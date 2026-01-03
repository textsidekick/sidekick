import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocuments } from "../documents/store";

// Twilio sends form-urlencoded data
export const runtime = "nodejs";

// In-memory store for SMS logs only
declare global {
  var smsLogs: Array<{
    from: string;
    question: string;
    answer: string;
    confidence: number;
    language: string;
    timestamp: string;
  }>;
}

if (!global.smsLogs) {
  global.smsLogs = [];
}

// Language detection
function detectLanguage(text: string): { code: string; name: string } {
  const patterns: { code: string; name: string; pattern: RegExp }[] = [
    { code: "es", name: "Spanish", pattern: /[¿¡áéíóúñü]|(?:hola|donde|cuando|como|que|por favor)/i },
    { code: "zh", name: "Chinese", pattern: /[\u4e00-\u9fff]/ },
    { code: "ko", name: "Korean", pattern: /[\uac00-\ud7af]/ },
    { code: "vi", name: "Vietnamese", pattern: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/ },
    { code: "tl", name: "Tagalog", pattern: /\b(ako|ikaw|siya|kami|tayo|sila|ang|ng|sa|na|at|ay|mga)\b/i },
  ];

  for (const { code, name, pattern } of patterns) {
    if (pattern.test(text)) {
      return { code, name };
    }
  }
  return { code: "en", name: "English" };
}

// Find relevant chunks from documents using existing store
function findRelevantChunks(question: string, maxChunks: number = 5): string[] {
  const documents = getDocuments();
  if (!documents || documents.length === 0) return [];

  const questionLower = question.toLowerCase();
  const questionWords = questionLower.split(/\s+/).filter(w => w.length > 3);

  const scoredChunks: { chunk: string; score: number }[] = [];

  for (const doc of documents) {
    for (const chunk of doc.chunks || []) {
      const chunkLower = chunk.toLowerCase();
      let score = 0;

      // Score based on word matches
      for (const word of questionWords) {
        if (chunkLower.includes(word)) {
          score += 2;
        }
      }

      // Boost for exact phrase matches
      if (chunkLower.includes(questionLower)) {
        score += 10;
      }

      // Boost for common question keywords
      const keywords = ["park", "break", "lunch", "ppe", "safety", "emergency", "clock", "schedule", "pay", "time off", "vacation", "sick", "uniform", "dress"];
      for (const kw of keywords) {
        if (questionLower.includes(kw) && chunkLower.includes(kw)) {
          score += 5;
        }
      }

      if (score > 0) {
        scoredChunks.push({ chunk, score });
      }
    }
  }

  // Sort by score and return top chunks
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, maxChunks).map(s => s.chunk);
}

export async function POST(req: Request) {
  try {
    // Parse Twilio's form-urlencoded body
    const formData = await req.formData();
    const from = formData.get("From")?.toString() || "";
    const body = formData.get("Body")?.toString() || "";

    console.log(`[SMS] Received from ${from}: ${body}`);

    // Handle STOP/HELP commands (Twilio compliance)
    const bodyUpper = body.toUpperCase().trim();
    if (bodyUpper === "STOP") {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>You've been unsubscribed from Sidekick. Reply START to resubscribe.</Message></Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    if (bodyUpper === "HELP") {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Sidekick: Ask any work question! Reply STOP to unsubscribe. Contact support@sidekick.ai for help.</Message></Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    if (bodyUpper === "START") {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Welcome back to Sidekick! Ask any question about your workplace.</Message></Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    // Detect language
    const { code: langCode, name: langName } = detectLanguage(body);

    // Find relevant document chunks
    const relevantChunks = findRelevantChunks(body);
    const hasContext = relevantChunks.length > 0;

    let answer = "";
    let confidence = 0;

    if (!hasContext) {
      // No documents uploaded yet
      answer = langCode === "es" 
        ? "No tengo información sobre eso. Por favor pregunta a tu supervisor."
        : "I don't have information about that yet. Please ask your supervisor or HR.";
      confidence = 0;
    } else {
      // Use Claude to generate answer
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const context = relevantChunks.join("\n\n---\n\n");

      const systemPrompt = langCode === "en" 
        ? `You are Sidekick, a helpful workplace assistant. Answer questions using ONLY the provided context. Keep answers under 300 characters for SMS. Be friendly and direct. If the answer isn't in the context, say you're not sure and suggest asking a manager.`
        : `You are Sidekick, a helpful workplace assistant. Answer in ${langName}. Use ONLY the provided context. Keep answers under 300 characters. Be friendly and direct. If unsure, suggest asking a manager.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Context from company documents:\n${context}\n\n---\n\nQuestion: ${body}`
        }]
      });

      answer = response.content[0].type === "text" 
        ? response.content[0].text 
        : "I'm not sure about that. Please ask your manager!";

      // Calculate confidence based on context relevance
      const contextWords = context.toLowerCase().split(/\s+/);
      const questionWords = body.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchedWords = questionWords.filter(w => contextWords.some(cw => cw.includes(w)));
      confidence = Math.min(95, Math.round((matchedWords.length / Math.max(questionWords.length, 1)) * 100) + 40);
    }

    // Truncate answer if too long for SMS
    if (answer.length > 320) {
      answer = answer.substring(0, 317) + "...";
    }

    // Log the interaction (in-memory)
    global.smsLogs.push({
      from,
      question: body,
      answer,
      confidence,
      language: langCode,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 logs in memory
    if (global.smsLogs.length > 1000) {
      global.smsLogs = global.smsLogs.slice(-1000);
    }

    console.log(`[SMS] Replying to ${from}: ${answer} (confidence: ${confidence}%)`);

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>${escapeXml(answer)}</Message></Response>`;

    return new Response(twiml, { 
      headers: { "Content-Type": "text/xml" } 
    });

  } catch (err: unknown) {
    console.error("[SMS] Error:", err);
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Sorry, something went wrong. Please try again or ask your manager.</Message></Response>`;
    
    return new Response(twiml, { 
      headers: { "Content-Type": "text/xml" } 
    });
  }
}

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// GET endpoint to check SMS logs (for analytics)
export async function GET() {
  const logs = global.smsLogs || [];
  const today = new Date().toISOString().split("T")[0];
  
  const todayLogs = logs.filter(l => l.timestamp.startsWith(today));
  const avgConfidence = logs.length > 0 
    ? Math.round(logs.reduce((sum, l) => sum + l.confidence, 0) / logs.length)
    : 0;

  const byLanguage: Record<string, number> = {};
  for (const log of logs) {
    byLanguage[log.language] = (byLanguage[log.language] || 0) + 1;
  }

  return NextResponse.json({
    totalQuestions: logs.length,
    todayCount: todayLogs.length,
    avgConfidence,
    byLanguage,
    recent: logs.slice(-20).reverse(),
    lowConfidence: logs.filter(l => l.confidence < 50).slice(-10).reverse()
  });
}
