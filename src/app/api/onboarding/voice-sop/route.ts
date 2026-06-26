export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const title = (form.get("title") as string) || "Voice SOP";

    if (!file) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    // Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    const transcript = transcription.text;
    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json({ error: "Could not transcribe audio" }, { status: 400 });
    }

    // Format as SOP
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `This is a verbal explanation of a work procedure recorded by a manager or experienced worker. Format it as a clean, professional Standard Operating Procedure (SOP) document.

Transcript: "${transcript}"

Include:
- A clear title
- Numbered steps in order
- Safety warnings or cautions where appropriate
- Equipment and materials needed
- Any tips or best practices mentioned

Write it as if it's going in a company manual. Keep the original knowledge but make it professional and easy to follow.`,
        },
      ],
    });

    const sopText = response.content[0].type === "text" ? response.content[0].text : "";

    if (sopText.length < 30) {
      return NextResponse.json({ error: "Could not generate SOP from audio" }, { status: 400 });
    }

    // Save document
    const docName = `${title} - ${new Date().toLocaleDateString()}`;
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({ company_id: companyId, name: docName, content: sopText.slice(0, 50000) })
      .select()
      .single();

    if (docErr) throw docErr;

    // Create embeddings
    const chunks = chunkText(sopText);
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
        console.error("[voice-sop] embedding error:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      document: { id: doc.id, name: docName },
      transcript,
      sopPreview: sopText.slice(0, 500) + (sopText.length > 500 ? "..." : ""),
      chunksCreated: embedded,
    });
  } catch (e: any) {
    console.error("[voice-sop]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
