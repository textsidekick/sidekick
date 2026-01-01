import { NextRequest, NextResponse } from "next/server";

// In-memory store (would be database in production)
let documents: Array<{
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
  chunks: string[];
}> = [];

export async function GET() {
  return NextResponse.json({ documents });
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
    content: content.slice(0, 10000), // Store first 10k chars
    uploadedAt: new Date().toISOString(),
    chunks,
  };

  documents.push(doc);

  return NextResponse.json({ success: true, document: doc });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  documents = documents.filter(d => d.id !== id);
  return NextResponse.json({ success: true });
}
