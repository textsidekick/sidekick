import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";
import { getCompanyId } from "@/lib/dashboard-auth";

export const runtime = "nodejs";

function chunkTextWithOverlap(text: string, maxSize = 800, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxSize, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start += maxSize - overlap;
  }
  return chunks.filter((c) => c.length > 20);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const assetIdParam = form.get("asset_id") as string | null;

    // Auth: prefer session, fall back to form companyId
    let companyId = await getCompanyId(req);
    if (!companyId) {
      companyId = form.get("companyId") as string | null;
    }
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Check document upload limit for trial accounts
    const { data: account } = await supabase
      .from("manager_accounts")
      .select("plan, documents_limit")
      .eq("company_id", companyId)
      .single();

    if (account?.plan === "trial") {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId);

      if ((count || 0) >= (account.documents_limit || 3)) {
        return NextResponse.json({
          error: "Document limit reached. Upgrade your plan to upload more documents.",
          upgrade: true,
        }, { status: 403 });
      }
    }

    // Extract text from file
    let text = "";
    const isPdf = file.name.endsWith(".pdf") || file.type === "application/pdf";

    if (isPdf) {
      const pdfParse = require("pdf-parse");
      const buf = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buf);
      text = String(parsed?.text ?? "").replace(/\u0000/g, "").trim();
    } else {
      // Plain text / markdown / other text files
      text = await file.text();
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from file (only " + text.length + " chars)" },
        { status: 400 }
      );
    }

    // Save document to Supabase
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        company_id: companyId,
        name: file.name,
        content: text.slice(0, 50000), // cap at 50k for storage
        asset_id: assetIdParam || null,
      })
      .select()
      .single();

    if (docError) {
      console.error("[Upload] Document insert error:", docError);
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
    }

    // Chunk text and create embeddings
    const chunks = chunkTextWithOverlap(text, 800, 100);
    console.log(`[Upload] Creating embeddings for ${chunks.length} chunks of ${file.name}`);

    let embeddedCount = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await createEmbedding(chunk);
        await supabase.from("document_chunks").insert({
          document_id: doc.id,
          company_id: companyId,
          content: chunk,
          embedding: embedding,
        });
        embeddedCount++;
      } catch (e) {
        console.error("[Upload] Embedding error for chunk:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      document: { id: doc.id, name: file.name },
      chunksCreated: embeddedCount,
      totalChunks: chunks.length,
      chars: text.length,
    });
  } catch (e: any) {
    console.error("[Upload] Error:", e);
    return NextResponse.json({ error: "Upload failed: " + e.message }, { status: 500 });
  }
}
