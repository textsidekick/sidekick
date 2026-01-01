import { NextRequest, NextResponse } from "next/server";
import { getDocuments, addDocument, deleteDocument } from "./store";

export async function GET() {
  return NextResponse.json({ documents: getDocuments() });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const content = await file.text();
  
  // Simple chunking - split by paragraphs
  const chunks = content
    .split(/\n\n+/)
    .filter(chunk => chunk.trim().length > 50)
    .map(chunk => chunk.trim());

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

  return NextResponse.json({ success: true, document: doc });
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
