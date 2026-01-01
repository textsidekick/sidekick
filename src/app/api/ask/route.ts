import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getEmbedding, cosineSimilarity } from "@/lib/embeddings";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChunkWithScore {
  text: string;
  similarity: number;
}

async function findRelevantChunks(question: string, documents: any[]): Promise<ChunkWithScore[]> {
  const allChunks: Array<{ text: string; embedding?: number[] }> = [];
  
  for (const doc of documents) {
    if (doc.chunks && doc.embeddings && doc.embeddings.length === doc.chunks.length) {
      // Use semantic search
      for (let i = 0; i < doc.chunks.length; i++) {
        allChunks.push({ text: doc.chunks[i], embedding: doc.embeddings[i] });
      }
    } else if (doc.chunks) {
      // Fallback: no embeddings yet
      for (const chunk of doc.chunks) {
        allChunks.push({ text: chunk });
      }
    }
  }

  // If we have embeddings, use semantic search
  const chunksWithEmbeddings = allChunks.filter(c => c.embedding);
  
  if (chunksWithEmbeddings.length > 0 && process.env.OPENAI_API_KEY) {
    try {
      console.log("Using semantic search with", chunksWithEmbeddings.length, "embedded chunks");
      const questionEmbedding = await getEmbedding(question);
      
      const scored = chunksWithEmbeddings.map(chunk => ({
        text: chunk.text,
        similarity: cosineSimilarity(questionEmbedding, chunk.embedding!),
      }));
      
      // Return top 5 most similar chunks (similarity > 0.3)
      return scored
        .filter(c => c.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
    } catch (error) {
      console.error("Semantic search error:", error);
    }
  }

  // Fallback to keyword matching
  console.log("Falling back to keyword search");
  const cleanQuestion = question.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const questionWords = cleanQuestion.split(/\s+/).filter(w => w.length > 2);
  
  const keywordScored: ChunkWithScore[] = [];
  for (const chunk of allChunks) {
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;
    for (const word of questionWords) {
      if (chunkLower.includes(word)) score += 1;
    }
    if (score > 0) {
      keywordScored.push({ text: chunk.text, similarity: score / questionWords.length });
    }
  }
  
  return keywordScored.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
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

  const relevantChunks = await findRelevantChunks(question, documents);
  console.log("Found", relevantChunks.length, "relevant chunks");

  let answer: string = "";
  let confidence: number = 0;
  let sources: number = 0;
  let needsDocuments: boolean = false;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");
      const avgSimilarity = relevantChunks.reduce((a, b) => a + b.similarity, 0) / relevantChunks.length;
      console.log("Calling Claude with context length:", context.length, "avg similarity:", avgSimilarity.toFixed(3));

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are Sidekick, a helpful AI assistant for blue-collar workers. Answer questions based on company documents. Be concise and direct.`,
        messages: [
          {
            role: "user",
            content: `Document context:\n\n${context}\n\n---\n\nQuestion: ${question}`,
          },
        ],
      });

      const textContent = message.content.find(block => block.type === "text");
      answer = textContent ? textContent.text : "I could not generate a response.";
      confidence = Math.min(95, Math.round(70 + avgSimilarity * 25));
      sources = relevantChunks.length;
      console.log("Claude responded successfully");
    } catch (error) {
      console.error("Claude API error:", error);
      answer = `Based on your documents:\n\n${relevantChunks[0].text}`;
      confidence = 70;
      sources = relevantChunks.length;
    }
  } else if (relevantChunks.length > 0) {
    answer = `Based on your documents:\n\n${relevantChunks[0].text}`;
    confidence = 70;
    sources = relevantChunks.length;
  } else {
    console.log("No relevant chunks found");
    answer = "I don't have enough information to answer that yet.\n\nPlease upload relevant documents (employee handbook, safety manual, SOPs) so I can help you better.";
    confidence = 0;
    needsDocuments = true;
    sources = 0;
  }

  return NextResponse.json({ answer, sources, confidence, needsDocuments });
}
