export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function chunkText(text: string, maxSize = 800, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxSize, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start += maxSize - overlap;
  }
  return chunks.filter((c) => c.length > 20);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const companyId = form.get("companyId") as string | null;

    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageData = buffer.toString("base64");
    let mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg";
    if (file.type === "image/png") mediaType = "image/png";
    else if (file.type === "image/webp") mediaType = "image/webp";

    // Extract text from photo via Claude Vision
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
            {
              type: "text",
              text: `Extract ALL text from this photo of a standard operating procedure, safety document, work instruction, or similar workplace document. 
Format it as clean, structured text with:
- A title/header at the top
- Numbered steps where applicable
- Bullet points for lists
- Safety warnings clearly marked
- Any equipment references noted

If this is not a document/procedure, describe what you see and note it may not be an SOP.`,
            },
          ],
        },
      ],
    });

    const extractedText = response.content[0].type === "text" ? response.content[0].text : "";

    if (extractedText.length < 30) {
      return NextResponse.json({ error: "Could not extract meaningful text from image" }, { status: 400 });
    }

    // Save as document
    const docName = `Photo SOP - ${new Date().toLocaleDateString()}`;
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({ company_id: companyId, name: docName, content: extractedText.slice(0, 50000) })
      .select()
      .single();

    if (docErr) throw docErr;

    // Create embeddings
    const chunks = chunkText(extractedText);
    let embedded = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await createEmbedding(chunk);
        await supabase.from("document_chunks").insert({
          document_id: doc.id,
          company_id: companyId,
          content: chunk,
          embedding,
        });
        embedded++;
      } catch (e) {
        console.error("[photo-sop] embedding error:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      document: { id: doc.id, name: docName },
      extractedText: extractedText.slice(0, 500) + (extractedText.length > 500 ? "..." : ""),
      chunksCreated: embedded,
    });
  } catch (e: any) {
    console.error("[photo-sop]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
