import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { classifyDocument, saveDocumentMetadata, DocumentMetadata } from "@/lib/documentClassifier";

export const runtime = "nodejs";

const STORAGE_DIR = "/tmp/sidekick-documents";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const pdfParse = require("pdf-parse");

    const form = await req.formData();
    const file = form.get("file");
    const companyId = String(form.get("companyId") ?? "demo");
    const userProvidedType = form.get("type") as string | null;

    console.log("Upload request received:", { 
      filename: file instanceof File ? file.name : "not a file",
      companyId,
      userProvidedType 
    });

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    console.log("PDF buffer size:", buf.length);

    const parsed = await pdfParse(buf);
    const text = String(parsed?.text ?? "").replace(/\u0000/g, "").trim();

    console.log("Extracted text length:", text.length);

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from PDF (only " + text.length + " chars)" },
        { status: 400 }
      );
    }

    console.log("Classifying document...");
    const classification = await classifyDocument(text);
    console.log("Classification result:", classification);

    const documentId = nanoid(10);

    const docDir = path.join(STORAGE_DIR, companyId);
    ensureDir(docDir);
    const textPath = path.join(docDir, `${documentId}.txt`);
    fs.writeFileSync(textPath, text, "utf-8");

    const metadata: DocumentMetadata = {
      id: documentId,
      companyId,
      filename: file.name,
      type: (userProvidedType as any) || classification.type,
      title: classification.title,
      uploadedAt: Date.now(),
      pageCount: parsed.numpages,
    };

    saveDocumentMetadata(companyId, metadata);

    return NextResponse.json({
      ok: true,
      document: metadata,
      classification,
      chars: text.length,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    console.error("Error stack:", e.stack);
    return NextResponse.json(
      { error: "Upload failed: " + e.message, detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
