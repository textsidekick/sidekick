import { NextRequest, NextResponse } from "next/server";
import { getDocuments, addDocument, deleteDocument, updateDocumentEmbeddings } from "./store";
import { getEmbeddings } from "@/lib/embeddings";

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    return "";
  }
}

export async function GET() {
  return NextResponse.json({ documents: getDocuments() });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let content: string;

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    content = await extractPdfText(buffer);
    console.log("Extracted PDF text length:", content.length);
  } else {
    content = await file.text();
  }

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
  }

  // Improved chunking
  const chunks = content
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 30)
    .map(chunk => chunk.replace(/\s+/g, " "));

  console.log("Created", chunks.length, "chunks from", file.name);

  const doc = {
    id: Date.now().toString(),
    name: file.name,
    type: file.type || "text/plain",
    size: file.size,
    content: content.slice(0, 10000),
    uploadedAt: new Date().toISOString(),
    chunks,
  };

  addDocument(doc);

  // Generate embeddings in background (don't block response)
  if (process.env.OPENAI_API_KEY && chunks.length > 0) {
    getEmbeddings(chunks)
      .then(embeddings => {
        updateDocumentEmbeddings(doc.id, embeddings);
        console.log("Generated", embeddings.length, "embeddings for", file.name);
      })
      .catch(err => console.error("Embedding error:", err));
  }

  return NextResponse.json({ success: true, document: doc, chunksCount: chunks.length });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  deleteDocument(id);
  return NextResponse.json({ success: true });
}
