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

function determineRelevantDocTypes(question: string): string[] {
  const q = question.toLowerCase();
  
  if (q.includes("work") || q.includes("shift") || q.includes("schedule") || q.includes("when")) {
    return ["shift_schedule", "handbook"];
  }
  if (q.includes("safe") || q.includes("ppe") || q.includes("equipment") || q.includes("wear") || q.includes("boots") || q.includes("gear")) {
    return ["safety_manual", "equipment_manual", "handbook"];
  }
  if (q.includes("pay") || q.includes("commission") || q.includes("salary") || q.includes("wage")) {
    return ["payroll_info", "commission_sheet", "handbook"];
  }
  if (q.includes("park") || q.includes("where") || q.includes("break") || q.includes("lunch")) {
    return ["handbook", "other"];
  }
  
  return ["handbook", "safety_manual", "shift_schedule", "training_material", "equipment_manual", "other"];
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
    
    console.log("Found documents:", allDocs.length);
    
    if (allDocs.length === 0) {
      return NextResponse.json({
        ok: true,
        answer: "No documents have been uploaded yet. Please ask your manager to upload company documents.",
        sources: [],
      });
    }

    const relevantTypes = determineRelevantDocTypes(q);
    console.log("Relevant document types:", relevantTypes);
    
    const relevantDocs = allDocs.filter(doc => relevantTypes.includes(doc.type));
    console.log("Relevant documents:", relevantDocs.length);
    
    let allText = "";
    const sourceDocs: any[] = [];
    
    for (const doc of relevantDocs.slice(0, 5)) {
      const text = getDocumentText(companyId, doc.id);
      if (text) {
        allText += `\n\n=== ${doc.title} (${doc.type}) ===\n${text}`;
        sourceDocs.push({ id: doc.id, title: doc.title, type: doc.type });
      }
    }

    if (!allText) {
      return NextResponse.json({
        ok: true,
        answer: "I found documents but couldn't read their content. Please ask your manager for help.",
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
If the answer isn't in the documents, say: "I'm not sure based on the available documents. Please ask your manager."
Keep answers concise and practical.`,
      messages: [{
        role: "user",
        content: `Question: ${q}\n\nAvailable Documents:\n${context}`
      }]
    });

    const answer = response.content[0].type === "text"
      ? response.content[0].text
      : "I'm not sure based on the available documents.";

    return NextResponse.json({
      ok: true,
      answer,
      sources: sourceDocs,
      searchedDocTypes: relevantTypes,
    });
  } catch (e: any) {
    console.error("Ask error:", e);
    return NextResponse.json(
      { error: "Ask failed", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
