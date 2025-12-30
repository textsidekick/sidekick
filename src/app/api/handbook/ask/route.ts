import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocumentsByCompany, getDocumentText } from "@/lib/documentClassifier";

export const runtime = "nodejs";

function simpleChunks(text: string, size = 1200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size) chunks.push(clean.slice(i, i + size));
  return chunks.slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const { question = "", image = null } = await req.json();
    const q = String(question).trim();
    
    if (!q && !image) {
      return NextResponse.json({ error: "Missing question or image" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    // If there's an image, use vision capabilities
    if (image) {
      console.log("Processing image question...");
      console.log("Image data length:", image?.length || 0);
      
      // Extract base64 data and media type
      const matches = image.match(/^data:(.+?);base64,(.+)$/);
      if (!matches) {
        console.error("Invalid image format - no base64 match");
        return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
      }
      
      const mediaType = matches[1];
      const base64Data = matches[2];
      
      console.log("Media type:", mediaType);
      console.log("Base64 data length:", base64Data.length);

      // Get document context for additional information
      const companyId = "demo";
      const documents = getDocumentsByCompany(companyId);
      
      let contextText = "";
      if (documents.length > 0) {
        const relevantDocs = documents.filter(d => 
          d.type === "safety_manual" || d.type === "equipment_manual"
        );
        
        if (relevantDocs.length > 0) {
          const docTexts = relevantDocs.map(d => getDocumentText(companyId, d.id));
          const allText = docTexts.join("\n\n");
          const chunks = simpleChunks(allText);
          contextText = chunks.slice(0, 3).join("\n\n");
        }
      }

      console.log("Calling Claude Vision API...");
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Data
              }
            },
            {
              type: "text",
              text: q || "Please describe what you see in this image and provide any relevant safety or usage information."
            },
            ...(contextText ? [{
              type: "text" as const,
              text: `\n\nFor additional context, here are relevant excerpts from company documents:\n${contextText}`
            }] : [])
          ]
        }]
      });

      console.log("Got response from Claude Vision");

      const answer = response.content[0].type === "text"
        ? response.content[0].text
        : "I couldn't analyze that image.";

      return NextResponse.json({
        ok: true,
        answer,
        sources: documents.filter(d => 
          d.type === "safety_manual" || d.type === "equipment_manual"
        ).slice(0, 2).map(d => ({
          id: d.id,
          title: d.title,
          type: d.type
        })),
      });
    }

    // Text-only question - existing logic
    const companyId = "demo";
    const documents = getDocumentsByCompany(companyId);

    if (documents.length === 0) {
      return NextResponse.json({
        ok: true,
        answer: "No documents have been uploaded yet. Please ask your manager for help.",
        sources: [],
      });
    }

    const questionLower = q.toLowerCase();
    const keywords = {
      parking: ["parking", "park", "car", "vehicle"],
      schedule: ["schedule", "shift", "work", "hours", "time", "when"],
      safety: ["safety", "ppe", "equipment", "protective", "gear", "helmet", "boots"],
      payroll: ["pay", "salary", "commission", "wage", "paycheck"],
      training: ["training", "learn", "how to", "operate"],
    };

    const relevantTypes = new Set<string>();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => questionLower.includes(word))) {
        if (category === "parking") relevantTypes.add("handbook");
        if (category === "schedule") relevantTypes.add("shift_schedule");
        if (category === "safety") relevantTypes.add("safety_manual");
        if (category === "payroll") relevantTypes.add("payroll_info");
        if (category === "training") relevantTypes.add("training_material");
      }
    }

    if (relevantTypes.size === 0) {
      relevantTypes.add("handbook");
    }

    const relevantDocs = documents.filter(d => relevantTypes.has(d.type));
    const docsToSearch = relevantDocs.length > 0 ? relevantDocs : documents.slice(0, 3);

    const docTexts = docsToSearch.map(d => getDocumentText(companyId, d.id));
    const allText = docTexts.join("\n\n");
    const chunks = simpleChunks(allText);
    const context = chunks.slice(0, 10).map((c, i) => `SECTION ${i + 1}:\n${c}`).join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
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
      sources: docsToSearch.slice(0, 3).map(d => ({
        id: d.id,
        title: d.title,
        type: d.type
      })),
    });
  } catch (e: any) {
    console.error("Ask error:", e);
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    return NextResponse.json(
      { 
        error: "Ask failed", 
        detail: String(e?.message ?? e),
        ok: false 
      },
      { status: 500 }
    );
  }
}
