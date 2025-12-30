import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { classifyDocument, extractStructuredData, saveDocumentMetadata, DocumentMetadata } from "@/lib/documentClassifier";

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

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buf);
    const text = String(parsed?.text ?? "").replace(/\u0000/g, "").trim();

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from PDF (only " + text.length + " chars)" },
        { status: 400 }
      );
    }

    // PHASE 1: Classify
    console.log("Classifying document...");
    const classification = await classifyDocument(text);
    console.log("Classification result:", classification);

    // PHASE 2: Extract structured data
    console.log("Extracting structured data...");
    const extractedData = await extractStructuredData(text, classification.type);
    console.log("Extracted data:", JSON.stringify(extractedData).slice(0, 200));

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
      extractedData: extractedData, // Store structured data!
    };

    saveDocumentMetadata(companyId, metadata);

    return NextResponse.json({
      ok: true,
      document: metadata,
      classification,
      extractedData,
      chars: text.length,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Upload failed: " + e.message },
      { status: 500 }
    );
  }
}
