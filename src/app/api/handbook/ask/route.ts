import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocumentsByCompany, getDocumentText } from "@/lib/documentClassifier";

export const runtime = "nodejs";

function simpleChunks(text: string, size = 1200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size) {
    chunks.push(clean.slice(i, i + size));
  }
  return chunks.slice(0, 200);
}

// PHASE 3: Intelligent routing based on question
function determineRelevantDocTypes(question: string): string[] {
  const q = question.toLowerCase();
  
  // Direct queries that need structured data
  if (q.match(/when (do|does) (i|[a-z]+) work/i)) {
    return ["shift_schedule"];
  }
  if (q.match(/how much.*commission|what.*commission/i)) {
    return ["commission_sheet", "payroll_info"];
  }
  if (q.match(/repair|fix|service/i)) {
    return ["repair_order", "equipment_manual"];
  }
  if (q.match(/vehicle|car|inventory|vin/i)) {
    return ["vehicle_inventory"];
  }
  
  // Broader queries
  if (q.includes("safe") || q.includes("ppe") || q.includes("boots") || q.includes("gear")) {
    return ["safety_manual", "equipment_manual", "handbook"];
  }
  if (q.includes("pay") || q.includes("salary") || q.includes("wage")) {
    return ["payroll_info", "commission_sheet", "handbook"];
  }
  if (q.includes("park") || q.includes("break") || q.includes("lunch")) {
    return ["handbook"];
  }
  
  return ["handbook", "safety_manual", "shift_schedule", "other"];
}

// Use structured data for direct queries
function answerFromStructuredData(question: string, docs: any[]): string | null {
  const q = question.toLowerCase();
  
  for (const doc of docs) {
    if (!doc.extractedData) continue;
    
    // Shift schedule queries
    if (doc.type === "shift_schedule" && doc.extractedData.shifts) {
      if (q.match(/when (do|does) (i|[a-z]+) work/i)) {
        const name = q.match(/when does ([a-z]+) work/i)?.[1];
        const shifts = doc.extractedData.shifts;
        
        if (name) {
          const matchedShift = shifts.find((s: any) => 
            s.employeeName?.toLowerCase().includes(name.toLowerCase())
          );
          if (matchedShift) {
            return `${matchedShift.employeeName} works on ${matchedShift.date} from ${matchedShift.startTime} to ${matchedShift.endTime} at ${matchedShift.location}.`;
          }
        } else {
          // "When do I work?" - return first shift
          const shift = shifts[0];
          if (shift) {
            return `Your next shift is on ${shift.date} from ${shift.startTime} to ${shift.endTime} at ${shift.location}.`;
          }
        }
      }
    }
    
    // Commission queries
    if (doc.type === "commission_sheet" && doc.extractedData.commissions) {
      if (q.includes("commission")) {
        const comm = doc.extractedData.commissions[0];
        if (comm) {
          return `Commission for ${comm.period}: $${comm.commissionAmount} (${comm.commissionRate * 100}% of $${comm.salesAmount} in sales).`;
        }
      }
    }
    
    // Safety requirements
    if (doc.type === "safety_manual" && doc.extractedData.requirements) {
      if (q.includes("ppe") || q.includes("safety gear") || q.includes("boots")) {
        const req = doc.extractedData.requirements[0];
        if (req && req.ppe) {
          return `Required safety equipment for ${req.area}: ${req.ppe.join(", ")}.`;
        }
      }
    }
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    const { question = "" } = await req.json();
    const q = String(question).trim();
    
    if (!q) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const companyId = "demo";
    const allDocs = getDocumentsByCompany(companyId);
    
    if (allDocs.length === 0) {
      return NextResponse.json({
        ok: true,
        answer: "No documents have been uploaded yet. Please ask your manager to upload company documents.",
        sources: [],
      });
    }

    const relevantTypes = determineRelevantDocTypes(q);
    const relevantDocs = allDocs.filter(doc => relevantTypes.includes(doc.type));
    
    // Try structured data first (FAST!)
    const structuredAnswer = answerFromStructuredData(q, relevantDocs);
    if (structuredAnswer) {
      return NextResponse.json({
        ok: true,
        answer: structuredAnswer,
        sources: relevantDocs.map(d => ({ title: d.title, type: d.type })),
        method: "structured_data" // For debugging
      });
    }
    
    // Fall back to full-text search
    let allText = "";
    const sourceDocs: any[] = [];
    
    for (const doc of relevantDocs.slice(0, 5)) {
      const text = getDocumentText(companyId, doc.id);
      if (text) {
        allText += `\n\n=== ${doc.title} ===\n${text}`;
        sourceDocs.push({ title: doc.title, type: doc.type });
      }
    }

    if (!allText) {
      return NextResponse.json({
        ok: true,
        answer: "I found documents but couldn't read their content. Please ask your manager.",
        sources: [],
      });
    }

    const chunks = simpleChunks(allText);
    const context = chunks.slice(0, 10).map((c, i) => `SECTION ${i + 1}:\n${c}`).join("\n\n");

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: `You are Sidekick, an onboarding assistant for hourly workers.
Answer questions using ONLY the provided document sections.
If the answer isn't in the documents, say: "I'm not sure. Please ask your manager."
Keep answers concise and practical.`,
      messages: [{
        role: "user",
        content: `Question: ${q}\n\nDocuments:\n${context}`
      }]
    });

    const answer = response.content[0].type === "text"
      ? response.content[0].text
      : "I'm not sure. Please ask your manager.";

    return NextResponse.json({
      ok: true,
      answer,
      sources: sourceDocs,
      method: "full_text_search"
    });
  } catch (e: any) {
    console.error("Ask error:", e);
    return NextResponse.json(
      { error: "Ask failed: " + e.message },
      { status: 500 }
    );
  }
}
