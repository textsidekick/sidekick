import { NextRequest, NextResponse } from "next/server";
import { getDocuments, addDocument, deleteDocument } from "./store";

// Dynamic import for pdf-parse to avoid build issues
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
  
  // Handle PDFs differently
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
  
  // Improved chunking - split by sections/paragraphs
  const chunks = content
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 30)
    .map(chunk => chunk.replace(/\s+/g, ' '));

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
