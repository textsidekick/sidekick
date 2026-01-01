import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function findRelevantChunks(question: string, documents: any[]): string[] {
  // Clean question - remove punctuation and split
  const cleanQuestion = question.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const questionWords = cleanQuestion.split(/\s+/).filter(w => w.length > 2);
  console.log("Question words:", questionWords);
  const relevantChunks: Array<{ chunk: string; score: number }> = [];

  for (const doc of documents) {
    console.log("Doc:", doc.name, "has", doc.chunks?.length, "chunks");
    for (const chunk of doc.chunks || []) {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      
      for (const word of questionWords) {
        if (chunkLower.includes(word)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        relevantChunks.push({ chunk, score });
        console.log("Found chunk with score", score);
      }
    }
  }

  console.log("Total relevant chunks:", relevantChunks.length);
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

  const baseUrl = request.nextUrl.origin;
  const docsResponse = await fetch(baseUrl + "/api/documents");
  const docsData = await docsResponse.json();
  const documents = docsData.documents || [];
  
  console.log("Got", documents.length, "documents");

  const relevantChunks = findRelevantChunks(question, documents);

  let answer: string = "";
  let confidence: number = 0;
  let sources: number = 0;
  let needsDocuments: boolean = false;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const context = relevantChunks.join("\n\n---\n\n");
      console.log("Calling Claude with context length:", context.length);
      
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are Sidekick, a helpful AI assistant for blue-collar workers. You answer questions based on company documents. Be concise and direct.`,
        messages: [
          {
            role: "user",
            content: `Document context:\n\n${context}\n\n---\n\nQuestion: ${question}`
          }
        ]
      });

      const textContent = message.content.find(block => block.type === "text");
      answer = textContent ? textContent.text : "I could not generate a response.";
      confidence = Math.min(95, 75 + relevantChunks.length * 5);
      sources = relevantChunks.length;
      console.log("Claude responded successfully");
    } catch (error) {
      console.error("Claude API error:", error);
      answer = `Based on your documents:\n\n${relevantChunks[0]}`;
      confidence = 70;
      sources = relevantChunks.length;
    }
  } else if (relevantChunks.length > 0) {
    answer = `Based on your documents:\n\n${relevantChunks[0]}`;
    confidence = 70;
    sources = relevantChunks.length;
  } else {
    console.log("No relevant chunks found, using fallback");
    answer = "I don't have enough information to answer that yet.\n\nPlease upload relevant documents (employee handbook, safety manual, SOPs) so I can help you better.";
    confidence = 0;
    needsDocuments = true;
    sources = 0;
  }

  return NextResponse.json({ answer, sources, confidence, needsDocuments });
}
