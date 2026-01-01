import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocuments } from "../documents/store";
import { getEmbeddings, cosineSimilarity } from "@/lib/embeddings";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Language detection and response
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

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  if (!question) {
    return NextResponse.json({ error: "No question provided" }, { status: 400 });
  }

  const documents = getDocuments();
  console.log("Got", documents.length, "documents");

  // Find relevant chunks using embeddings or keyword fallback
  let relevantChunks: { text: string; score: number }[] = [];

  // Try semantic search first
  const hasEmbeddings = documents.some(doc => doc.embeddings && doc.embeddings.length > 0);
  
  if (hasEmbeddings && process.env.OPENAI_API_KEY) {
    try {
      const [questionEmbedding] = await getEmbeddings([question]);
      
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

  // Fallback to keyword search
  if (relevantChunks.length === 0) {
    const questionWords = question.toLowerCase()
      .replace(/[?.,!]/g, "")
      .split(" ")
      .filter((w: string) => w.length > 3);

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
  }

  let answer = "";
  let confidence = 0;
  let sources = 0;
  let needsDocuments = false;
  let detectedLanguage = "en";

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are a helpful workplace assistant for blue-collar workers.

CRITICAL LANGUAGE RULES:
1. DETECT the language of the worker's question
2. RESPOND in the SAME language as the question
3. If Spanish question → Spanish answer
4. If Chinese question → Chinese answer
5. If English question → English answer

Your role:
- Answer questions based ONLY on the provided documents
- Be concise and direct - workers need quick answers
- Use simple language appropriate for the detected language
- If the answer is not in the documents, say so (in the worker's language)
- Format answers for easy reading

At the end of your response, add a new line with just the detected language code in brackets, like: [es] or [en] or [zh]`,
        messages: [
          {
            role: "user",
            content: `Here are relevant sections from company documents (in English):

${context}

---

Worker question: ${question}

Answer in the SAME LANGUAGE as the question. End with [language_code].`
          }
        ]
      });

      const textContent = message.content.find(block => block.type === "text");
      if (textContent && textContent.type === "text") {
        let responseText = textContent.text;
        
        // Extract language code from response
        const langMatch = responseText.match(/\[([a-z]{2})\]\s*$/i);
        if (langMatch) {
          detectedLanguage = langMatch[1].toLowerCase();
          responseText = responseText.replace(/\[([a-z]{2})\]\s*$/i, "").trim();
        }
        
        answer = responseText;
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
    // No documents - respond in detected language
    const isSpanish = /[¿¡áéíóúñü]/i.test(question) || 
      /\b(donde|como|que|cuando|por que|hola|gracias)\b/i.test(question);
    const isChinese = /[\u4e00-\u9fff]/.test(question);
    
    if (isSpanish) {
      answer = "No tengo suficiente información para responder eso todavía.\n\nPor favor, pida a su gerente que suba los documentos relevantes (manual del empleado, manual de seguridad, procedimientos) para que pueda ayudarle mejor.";
      detectedLanguage = "es";
    } else if (isChinese) {
      answer = "我目前没有足够的信息来回答这个问题。\n\n请让您的经理上传相关文件（员工手册、安全手册、操作程序），以便我能更好地帮助您。";
      detectedLanguage = "zh";
    } else {
      answer = "I don't have enough information to answer that yet.\n\nPlease ask your manager to upload relevant documents (employee handbook, safety manual, SOPs) so I can help you better.";
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
