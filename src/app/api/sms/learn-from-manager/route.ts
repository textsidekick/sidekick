export const maxDuration = 30;
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

interface LearnRequest {
  company_id: string;
  original_question: string;
  manager_answer: string;
  worker_phone?: string;
  source_conversation_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LearnRequest = await request.json();
    const { company_id, original_question, manager_answer, worker_phone, source_conversation_id } = body;

    if (!company_id || !original_question || !manager_answer) {
      return NextResponse.json(
        { error: "Missing required fields: company_id, original_question, manager_answer" },
        { status: 400 }
      );
    }

    // 1. Save to manager_knowledge table
    const { error: knowledgeError } = await supabase.from("manager_knowledge").insert({
      company_id,
      worker_question: original_question,
      manager_answer,
      source_conversation_id: source_conversation_id || null,
    });

    if (knowledgeError) {
      console.error("[Learn] Failed to save manager knowledge:", knowledgeError);
      return NextResponse.json({ error: "Failed to save knowledge" }, { status: 500 });
    }

    // 2. Create embedding from the Q&A pair for better retrieval
    const embeddingText = `Question: ${original_question}\nAnswer: ${manager_answer}`;
    let embedding: number[];
    try {
      embedding = await createEmbedding(embeddingText);
    } catch (e) {
      console.error("[Learn] Embedding creation failed:", e);
      // Still save the document without embedding
      embedding = [];
    }

    // 3. Save as a document in documents table
    const docContent = `Q: ${original_question}\nA: ${manager_answer}`;
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        company_id,
        name: `Manager Reply: ${original_question.slice(0, 50)}`,
        content: docContent,
      })
      .select()
      .single();

    if (docError) {
      console.error("[Learn] Failed to save document:", docError);
    }

    // 4. Save as document_chunk with embedding for vector search
    const chunkInsert: Record<string, unknown> = {
      company_id,
      content: docContent,
      metadata: {
        source: "Manager Reply",
        original_question,
        worker_phone: worker_phone || null,
        document_id: doc?.id || null,
      },
    };

    if (embedding.length > 0) {
      chunkInsert.embedding = embedding;
    }

    const { error: chunkError } = await supabase.from("document_chunks").insert(chunkInsert);

    if (chunkError) {
      console.error("[Learn] Failed to save document chunk:", chunkError);
    }

    console.log(`[Learn] Saved manager knowledge: "${original_question}" → "${manager_answer}" for company ${company_id}`);

    return NextResponse.json({
      success: true,
      message: `Learned: "${original_question}" → "${manager_answer}"`,
    });
  } catch (error) {
    console.error("[Learn] Unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
