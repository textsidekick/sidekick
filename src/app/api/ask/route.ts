export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function detectAndTranslate(query: string): Promise<{ language: string; englishQuery: string; isEnglish: boolean }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Detect language and translate to English. Return ONLY JSON, no markdown:
"${query}"
{"language":"detected language","englishQuery":"English translation","isEnglish":true/false}`
    }]
  });
  const text = response.choices[0]?.message?.content || "{}";
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    return {
      language: result.language || "English",
      englishQuery: result.englishQuery || query,
      isEnglish: result.isEnglish !== false
    };
  } catch {
    return { language: "English", englishQuery: query, isEnglish: true };
  }
}

async function translateResponse(answer: string, targetLanguage: string): Promise<string> {
  if (targetLanguage.toLowerCase() === "english") return answer;
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `Translate to ${targetLanguage}. Output ONLY the translation:\n\n${answer}`
    }]
  });
  return response.choices[0]?.message?.content || answer;
}

async function searchDocuments(question: string, companyId: string) {
  const embedding = await createEmbedding(question);
  
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_company_id: companyId,
    match_count: 5,
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }

  return data || [];
}

export async function POST(request: NextRequest) {
  const { question, companyId = "default" } = await request.json();
  console.log("[Ask] Question:", question);

  // Step 1: Detect language and translate to English
  const { language, englishQuery, isEnglish } = await detectAndTranslate(question);
  console.log("[Ask] Language:", language, "| English query:", englishQuery);

  // Step 2: Search documents with vector search
  const relevantChunks = await searchDocuments(englishQuery, companyId);
  console.log("[Ask] Found", relevantChunks.length, "relevant chunks");

  let answer: string;
  let confidence = 0;
  const sources = relevantChunks.length;

  // Step 3: Generate answer in English
  if (relevantChunks.length > 0 && process.env.OPENAI_API_KEY) {
    const context = relevantChunks.map((c: any) => c.content).join("\n\n---\n\n");
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      max_tokens: 500,
      messages: [
        { role: "system", content: "You're a helpful workplace assistant. Answer based on the documents provided. Be concise and direct." },
        {
          role: "user",
          content: `Documents:\n${context}\n\nQuestion: ${englishQuery}\n\nAnswer concisely:`
        }
      ]
    });
    answer = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    confidence = relevantChunks.length > 0 ? Math.round(relevantChunks[0].similarity * 100) : 0;
  } else {
    answer = "I don't have information about that. Please ask your manager to upload relevant documents.";
    confidence = 0;
  }

  // Step 4: Translate answer back if needed
  if (!isEnglish) {
    console.log("[Ask] Translating response to", language);
    answer = await translateResponse(answer, language);
  }

  return NextResponse.json({ answer, sources, confidence, language });
}
