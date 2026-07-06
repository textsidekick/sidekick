import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding, chunkText } from "@/lib/embeddings";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyId = (formData.get("companyId") as string) || await getCompanyId(request) || "default";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const chunks = chunkText(text, 500);

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ company_id: companyId, name: file.name, content: text })
      .select()
      .single();

    if (docError) throw docError;

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      await supabase.from("document_chunks").insert({
        document_id: doc.id,
        company_id: companyId,
        content: chunk,
        embedding: embedding,
      });
    }

    return NextResponse.json({
      success: true,
      document: { id: doc.id, name: file.name },
      chunksCount: chunks.length,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request) || "default";
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
