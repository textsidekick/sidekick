import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocuments } from "../documents/store";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function translateToEnglish(query: string): Promise<{ language: string; englishQuery: string }> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Detect language and translate to English. Return ONLY JSON, no markdown:
"${query}"
{"language":"detected language","englishQuery":"English translation"}`
    }]
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    return { language: result.language || "English", englishQuery: result.englishQuery || query };
  } catch {
    return { language: "English", englishQuery: query };
  }
}

async function translateResponse(answer: string, targetLanguage: string): Promise<string> {
  if (targetLanguage.toLowerCase() === "english") return answer;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `Translate to ${targetLanguage}. Output ONLY the translation:\n\n${answer}`
    }]
  });
  return response.content[0].type === "text" ? response.content[0].text : answer;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body = formData.get("Body")?.toString() || "";
  const from = formData.get("From")?.toString() || "";

  console.log("[SMS] From:", from, "| Message:", body);

  const { language, englishQuery } = await translateToEnglish(body);
  console.log("[SMS] Language:", language, "| English query:", englishQuery);

  // Now async!
  const docs = await getDocuments();
  const searchWords = englishQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let relevantChunks: { text: string; score: number }[] = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks || []) {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      for (const word of searchWords) {
        if (chunkLower.includes(word)) score++;
      }
      if (score > 0) relevantChunks.push({ text: chunk, score });
    }
  }

  relevantChunks.sort((a, b) => b.score - a.score);
  relevantChunks = relevantChunks.slice(0, 5);
  console.log("[SMS] Found", relevantChunks.length, "chunks");

  let answer: string;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: "You're a helpful workplace assistant. Answer based on the documents. Be concise for SMS (under 300 chars). Add a relevant emoji at the end.",
      messages: [{
        role: "user",
        content: `Documents:\n${context}\n\nQuestion: ${englishQuery}\n\nAnswer concisely:`
      }]
    });
    answer = response.content[0].type === "text" ? response.content[0].text : "Sorry, I couldn't find that information.";
  } else {
    answer = "I don't have information about that yet. Please ask your supervisor or HR.";
  }

  answer = await translateResponse(answer, language);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
