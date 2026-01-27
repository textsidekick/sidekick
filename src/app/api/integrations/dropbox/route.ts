import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { classifyDocument, extractStructuredData, saveDocumentMetadata, DocumentMetadata } from "@/lib/documentClassifier";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

const STORAGE_DIR = "/tmp/sidekick-documents";

async function getValidAccessToken(companyId: string): Promise<string | null> {
  const { data: connection } = await supabase
    .from("dropbox_connections")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (!connection) return null;
  return connection.access_token;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  const action = searchParams.get("action") || "status";

  const accessToken = await getValidAccessToken(companyId);

  if (action === "status") {
    const { data: connection } = await supabase
      .from("dropbox_connections")
      .select("dropbox_email, connected_at")
      .eq("company_id", companyId)
      .single();

    return NextResponse.json({
      connected: !!connection && !!accessToken,
      email: connection?.dropbox_email,
      connectedAt: connection?.connected_at,
    });
  }

  if (action === "list") {
    if (!accessToken) {
      return NextResponse.json({ error: "Not connected to Dropbox" }, { status: 401 });
    }

    try {
      const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "",
          recursive: false,
          include_media_info: false,
          include_deleted: false,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Dropbox API error:", data.error);
        return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
      }

      // Filter for supported file types
      const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv'];
      const files = (data.entries || [])
        .filter((entry: any) => {
          if (entry['.tag'] !== 'file') return false;
          const ext = path.extname(entry.name).toLowerCase();
          return supportedExtensions.includes(ext);
        })
        .map((entry: any) => ({
          id: entry.id,
          name: entry.name,
          path: entry.path_lower,
          size: entry.size,
          modified: entry.server_modified,
        }));

      return NextResponse.json({ files });
    } catch (error) {
      console.error("Failed to list Dropbox files:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { companyId, filePath, fileName } = await req.json();

    if (!companyId || !filePath) {
      return NextResponse.json({ error: "Missing companyId or filePath" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(companyId);
    if (!accessToken) {
      return NextResponse.json({ error: "Not connected to Dropbox" }, { status: 401 });
    }

    // Download file content
    const downloadResponse = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path: filePath }),
      },
    });

    if (!downloadResponse.ok) {
      console.error("Failed to download file:", await downloadResponse.text());
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const ext = path.extname(fileName).toLowerCase();
    let textContent = "";

    if (ext === '.pdf') {
      const buffer = Buffer.from(await downloadResponse.arrayBuffer());
      const pdfParse = require("pdf-parse");
      const parsed = await pdfParse(buffer);
      textContent = String(parsed?.text ?? "").replace(/\u0000/g, "").trim();
    } else if (['.txt', '.csv'].includes(ext)) {
      textContent = await downloadResponse.text();
    } else if (['.doc', '.docx'].includes(ext)) {
      const buffer = Buffer.from(await downloadResponse.arrayBuffer());
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      textContent = result.value;
    } else {
      textContent = await downloadResponse.text();
    }

    if (textContent.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from file" },
        { status: 400 }
      );
    }

    console.log("Classifying document from Dropbox...");
    const classification = await classifyDocument(textContent);
    console.log("Classification result:", classification);

    console.log("Extracting structured data...");
    const extractedData = await extractStructuredData(textContent, classification.type);

    const documentId = nanoid(10);
    const docDir = path.join(STORAGE_DIR, companyId);
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    const textPath = path.join(docDir, `${documentId}.txt`);
    fs.writeFileSync(textPath, textContent, "utf-8");

    const metadata: DocumentMetadata = {
      id: documentId,
      companyId,
      filename: fileName,
      type: classification.type,
      title: classification.title,
      uploadedAt: Date.now(),
      extractedData,
      pageCount: 1,
    };

    saveDocumentMetadata(companyId, metadata);

    return NextResponse.json({
      ok: true,
      document: metadata,
      classification,
      extractedData,
      chars: textContent.length,
      source: "dropbox",
    });
  } catch (error: any) {
    console.error("Dropbox import error:", error);
    return NextResponse.json(
      { error: "Import failed: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dropbox_connections")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    console.error("Failed to disconnect:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
