import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocuments } from "../documents/store";
import { getEmbeddings, cosineSimilarity } from "@/lib/embeddings";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Chinese",
  vi: "Vietnamese",
  tl: "Tagalog",
  ko: "Korean",
  pt: "Portuguese",
  fr: "French",
};

// Detect if question is non-English and translate for search
async function translateForSearch(question: string): Promise<{ translated: string; originalLang: string }> {
  const isEnglish = /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(question);
  
  if (isEnglish && !/[¿¡áéíóúñü]/i.test(question)) {
    return { translated: question, originalLang: "en" };
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: "Translate the following question to English. Return ONLY the English translation, nothing else.",
      messages: [{ role: "user", content: question }]
    });
    
    const text = response.content[0];
    if (text.type === "text") {
      // Detect original language
      let lang = "en";
      if (/[¿¡áéíóúñü]/i.test(question) || /\b(donde|como|que|cuando)\b/i.test(question)) lang = "es";
      else if (/[\u4e00-\u9fff]/.test(question)) lang = "zh";
      else if (/[\uac00-\ud7af]/.test(question)) lang = "ko";
      else if (/[\u0600-\u06ff]/.test(question)) lang = "ar";
      
      return { translated: text.text.trim(), originalLang: lang };
    }
  } catch (e) {
    console.error("Translation error:", e);
  }
  
  return { translated: question, originalLang: "en" };
}

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  if (!question) {
    return NextResponse.json({ error: "No question provided" }, { status: 400 });
  }

  // Translate question for search if needed
  const { translated: searchQuery, originalLang } = await translateForSearch(question);
  console.log("Original:", question, "| Search query:", searchQuery, "| Lang:", originalLang);

  const documents = getDocuments();
  console.log("Got", documents.length, "documents");

  let relevantChunks: { text: string; score: number }[] = [];

  // Try semantic search first
  const hasEmbeddings = documents.some(doc => doc.embeddings && doc.embeddings.length > 0);
  
  if (hasEmbeddings && process.env.OPENAI_API_KEY) {
    try {
      const [questionEmbedding] = await getEmbeddings([searchQuery]);
      
      for (const doc of documents) {
        if (doc.embeddings && doc.chunks) {
          for (let i = 0; i < doc.chunks.length; i++) {
            if (doc.embeddings[i]) {
              const score = cosineSimilarity(questionEmbedding, doc.embeddings[i]);
              if (score > 0.3) {
                relevantChunks.push({ text: doc.chunks[i], score });
              }
            }
          }
        }
      }
      
      relevantChunks.sort((a, b) => b.score - a.score);
      relevantChunks = relevantChunks.slice(0, 5);
      console.log("Semantic search found", relevantChunks.length, "chunks");
    } catch (err) {
      console.error("Semantic search error:", err);
    }
  }

  // Fallback to keyword search using translated query
  if (relevantChunks.length === 0) {
    const questionWords = searchQuery.toLowerCase()
      .replace(/[?.,!]/g, "")
      .split(" ")
      .filter((w: string) => w.length > 3);

    console.log("Keyword search with:", questionWords);

    for (const doc of documents) {
      for (const chunk of doc.chunks || []) {
        const chunkLower = chunk.toLowerCase();
        let score = 0;
        for (const word of questionWords) {
          if (chunkLower.includes(word)) score++;
        }
        if (score > 0) {
          relevantChunks.push({ text: chunk, score });
        }
      }
    }

    relevantChunks.sort((a, b) => b.score - a.score);
    relevantChunks = relevantChunks.slice(0, 5);
    console.log("Keyword search found", relevantChunks.length, "chunks");
  }

  let answer = "";
  let confidence = 0;
  let sources = 0;
  let needsDocuments = false;
  let detectedLanguage = originalLang;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are a helpful workplace assistant for blue-collar workers.

CRITICAL: The worker asked their question in ${SUPPORTED_LANGUAGES[originalLang] || originalLang}. 
You MUST respond in ${SUPPORTED_LANGUAGES[originalLang] || originalLang}.

Your role:
- Answer based ONLY on the provided documents
- Be concise and direct
- Use simple language
- If the answer is not in the documents, say so`,
        messages: [
          {
            role: "user",
            content: `Documents (English):

${context}

---

Worker's original question (in ${SUPPORTED_LANGUAGES[originalLang] || originalLang}): ${question}

Respond in ${SUPPORTED_LANGUAGES[originalLang] || originalLang}.`
          }
        ]
      });

      const textContent = message.content.find(block => block.type === "text");
      if (textContent && textContent.type === "text") {
        answer = textContent.text;
        confidence = Math.min(95, 70 + relevantChunks.length * 5);
        sources = relevantChunks.length;
      }
    } catch (error) {
      console.error("Claude API error:", error);
      answer = relevantChunks[0].text;
      confidence = 70;
      sources = relevantChunks.length;
    }
  } else if (relevantChunks.length > 0) {
    answer = relevantChunks[0].text;
    confidence = 70;
    sources = relevantChunks.length;
  } else {
    if (originalLang === "es") {
      answer = "No tengo suficiente información para responder eso todavía.\n\nPor favor, pida a su gerente que suba los documentos relevantes.";
    } else if (originalLang === "zh") {
      answer = "我目前没有足够的信息来回答这个问题。\n\n请让您的经理上传相关文件。";
    } else {
      answer = "I don't have enough information to answer that yet.\n\nPlease ask your manager to upload relevant documents.";
    }
    confidence = 0;
    needsDocuments = true;
    sources = 0;
  }

  return NextResponse.json({ 
    answer, 
    sources, 
    confidence, 
    needsDocuments,
    language: detectedLanguage,
    languageName: SUPPORTED_LANGUAGES[detectedLanguage] || "English"
  });
}
