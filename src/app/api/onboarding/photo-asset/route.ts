export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const base64Input = form.get("image") as string | null;

    let imageData: string;
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      imageData = buffer.toString("base64");
      if (file.type === "image/png") mediaType = "image/png";
      else if (file.type === "image/webp") mediaType = "image/webp";
    } else if (base64Input) {
      imageData = base64Input.replace(/^data:image\/\w+;base64,/, "");
    } else {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mediaType};base64,${imageData}` },
            },
            {
              type: "text",
              text: `Look at this photo of industrial/workplace equipment. For each piece of equipment visible, extract:
- name: what it is (e.g. "CNC Mill", "Hydraulic Press")
- type: category (e.g. "CNC Mill", "Press", "Conveyor")
- manufacturer: if visible on the machine
- model: if visible
- location: describe where it appears to be
- tag: any asset tag, serial number, or label visible

Return a JSON array of objects. If you can't identify equipment, return an empty array.
Respond ONLY with valid JSON array.`,
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "[]";
    const match = text.match(/\[[\s\S]*\]/);
    const assets = match ? JSON.parse(match[0]) : [];

    return NextResponse.json({ assets });
  } catch (e: any) {
    console.error("[photo-asset]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
