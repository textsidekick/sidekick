import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocuments } from "../documents/store";
import { getEmbeddings, cosineSimilarity } from "@/lib/embeddings";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Step 1: Detect language and translate to English
async function detectAndTranslate(query: string): Promise<{
  originalLanguage: string;
  isEnglish: boolean;
  englishQuery: string;
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Analyze this text and respond with ONLY a JSON object (no markdown):
Text: "${query}"
{"language":"detected language name","isEnglish":true/false,"englishQuery":"English translation or original if already English"}`
    }]
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    return {
      originalLanguage: result.language || "English",
      isEnglish: result.isEnglish !== false,
      englishQuery: result.englishQuery || query
    };
  } catch {
    return { originalLanguage: "English", isEnglish: true, englishQuery: query };
  }
}

// Step 4: Translate response back to original language
async function translateResponse(answer: string, targetLanguage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Translate to ${targetLanguage}. Output ONLY the translation:\n\n${answer}`
    }]
  });
  return response.content[0].type === "text" ? response.content[0].text : answer;
}

export async function POST(request: NextRequest) {
  const { question } = await request.json();
  if (!question) {
    return NextResponse.json({ error: "No question" }, { status: 400 });
  }

  console.log("[Ask] Original question:", question);

  // STEP 1 & 2: Detect language and translate to English
  const { originalLanguage, isEnglish, englishQuery } = await detectAndTranslate(question);
  console.log("[Ask] Language:", originalLanguage, "| English query:", englishQuery);

  // STEP 3: Search documents using ENGLISH query
  const docs = getDocuments();
  let relevantChunks: { text: string; score: number }[] = [];
  const searchWords = englishQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  for (const doc of docs) {
    for (const chunk of doc.chunks || []) {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      for (const word of searchWords) {
        if (chunkLower.includes(word)) score++;
      }
      if (score > 0) {
        relevantChunks.push({ text: chunk, score });
      }
    }
  }

  relevantChunks.sort((a, b) => b.score - a.score);
  relevantChunks = relevantChunks.slice(0, 5);
  console.log("[Ask] Found", relevantChunks.length, "relevant chunks");

  let answer: string;
  let confidence = 0;
  let sources = relevantChunks.length;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: "You are a helpful workplace assistant. Answer based on the documents. Be concise for SMS.",
      messages: [{
        role: "user",
        content: `Documents:\n${context}\n\nQuestion: ${englishQuery}\n\nAnswer concisely:`
      }]
    });
    answer = response.content[0].type === "text" ? response.content[0].text : "Sorry, I couldn't generate a response.";
    confidence = 85;
  } else {
    answer = "I don't have information about that. Please ask your manager to upload relevant documents.";
    confidence = 0;
  }

  // STEP 4: Translate answer back if needed
  if (!isEnglish) {
    console.log("[Ask] Translating response to", originalLanguage);
    answer = await translateResponse(answer, originalLanguage);
  }

  return NextResponse.json({ answer, sources, confidence, language: originalLanguage });
}
