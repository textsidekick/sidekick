export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function findRelevantChunks(question: string, documents: any[]): string[] {
  const questionWords = question.toLowerCase().split(/\s+/);
  const relevantChunks: Array<{ chunk: string; score: number }> = [];

  for (const doc of documents) {
    for (const chunk of doc.chunks || []) {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      
      for (const word of questionWords) {
        if (word.length > 3 && chunkLower.includes(word)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        relevantChunks.push({ chunk, score });
      }
    }
  }

  return relevantChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.chunk);
}

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  if (!question) {
    return NextResponse.json({ error: "No question provided" }, { status: 400 });
  }

  const docsResponse = await fetch(new URL("/api/documents", request.url).toString());
  const { documents } = await docsResponse.json();

  const relevantChunks = findRelevantChunks(question, documents);

  let answer: string = "";
  let confidence: number = 0;
  let sources: number = 0;
  let needsDocuments: boolean = false;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const context = relevantChunks.join("\n\n---\n\n");
      
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: `You are Sidekick, a helpful AI assistant for blue-collar workers. You answer questions based on company documents.

Rules:
- Only answer based on the provided document context
- Be concise and direct - workers need quick answers
- If the answer is not in the documents, say so
- Use simple language, avoid jargon
- Format answers for easy reading (bullet points for lists)
- Be friendly but professional`,
        messages: [
          {
            role: "user",
            content: `Here are relevant sections from the company documents:

${context}

---

Worker question: ${question}

Please answer based only on the information in these documents.`
          }
        ]
      });

      const textContent = message.content.find(block => block.type === "text");
      answer = textContent ? textContent.text : "I could not generate a response. Please try again.";
      confidence = Math.min(95, 75 + relevantChunks.length * 5);
      sources = relevantChunks.length;
    } catch (error) {
      console.error("Claude API error:", error);
      answer = `Based on your company documents:\n\n${relevantChunks[0]}${relevantChunks[1] ? "\n\n" + relevantChunks[1] : ""}`;
      confidence = Math.min(85, 60 + relevantChunks.length * 10);
      sources = relevantChunks.length;
    }
  } else if (relevantChunks.length > 0) {
    answer = `Based on your company documents:\n\n${relevantChunks[0]}${relevantChunks[1] ? "\n\n" + relevantChunks[1] : ""}`;
    confidence = Math.min(85, 60 + relevantChunks.length * 10);
    sources = relevantChunks.length;
  } else {
    const fallbacks: Record<string, { answer: string; confidence: number }> = {
      "break": { answer: "Break times vary by company. Typical schedules:\n- Morning: 10:00-10:15 AM\n- Lunch: 12:00-12:30 PM\n- Afternoon: 3:00-3:15 PM\n\nUpload your employee handbook for specific times.", confidence: 65 },
      "ppe": { answer: "Standard PPE includes:\n- Safety glasses\n- Steel-toe boots\n- High-visibility vest\n- Hard hat (construction)\n- Gloves\n\nUpload your safety manual for specific requirements.", confidence: 70 },
      "incident": { answer: "To report an incident:\n1. Ensure immediate safety\n2. Notify your supervisor\n3. Get medical attention if needed\n4. Complete incident report\n5. Submit within 24 hours\n\nUpload safety procedures for details.", confidence: 75 },
      "supervisor": { answer: "To find your supervisor:\n- Check department org chart\n- Ask a coworker\n- Contact HR\n\nUpload employee directory for contacts.", confidence: 60 },
      "overtime": { answer: "General overtime rules:\n- Over 40 hrs/week = 1.5x pay\n- Must be pre-approved\n\nUpload handbook for specific policy.", confidence: 60 },
      "pay": { answer: "For payroll questions:\n- Most companies pay bi-weekly\n- Check pay stub for schedule\n- Contact HR for specifics\n\nUpload handbook for pay schedule.", confidence: 60 },
      "safety": { answer: "General safety guidelines:\n- Wear required PPE\n- Report hazards immediately\n- Know emergency exits\n- Follow equipment procedures\n- Ask if unsure\n\nUpload safety manual for specifics.", confidence: 70 },
    };

    const questionLower = question.toLowerCase();
    let matched = false;
    
    for (const [key, data] of Object.entries(fallbacks)) {
      if (questionLower.includes(key)) {
        answer = data.answer;
        confidence = data.confidence;
        matched = true;
        needsDocuments = true;
        break;
      }
    }

    if (!matched) {
      answer = "I don't have enough information to answer that yet.\n\nPlease upload relevant documents (employee handbook, safety manual, SOPs) so I can help you better.";
      confidence = 0;
      needsDocuments = true;
    }
    sources = 0;
  }

  try {
    await fetch(new URL("/api/analytics", request.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, confidence }),
    });
  } catch (e) {
    console.error("Failed to log analytics", e);
  }

  return NextResponse.json({ answer, sources, confidence, needsDocuments });
}
