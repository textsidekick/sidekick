export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    const transcript = transcription.text;
    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json({ error: "Could not transcribe audio", transcript: "" }, { status: 400 });
    }

    // Parse equipment from transcript
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `The user verbally described equipment on their factory/shop floor. Extract each piece of equipment mentioned.

Transcript: "${transcript}"

For each piece of equipment, return:
- name: equipment name
- type: category
- location: if mentioned
- tag: suggested asset tag prefix + number

Return a JSON array. If no equipment is mentioned, return [].
Respond ONLY with valid JSON array.`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    const match = text.match(/\[[\s\S]*\]/);
    const assets = match ? JSON.parse(match[0]) : [];

    return NextResponse.json({ assets, transcript });
  } catch (e: any) {
    console.error("[voice-asset]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
