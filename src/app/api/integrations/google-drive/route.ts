import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { classifyDocument, extractStructuredData, saveDocumentMetadata, DocumentMetadata } from "@/lib/documentClassifier";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

const STORAGE_DIR = "/tmp/sidekick-documents";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'placeholder';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder';

async function getValidAccessToken(companyId: string): Promise<string | null> {
  const { data: connection } = await supabase
    .from("google_drive_connections")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (!connection) return null;

  const tokenExpiry = new Date(connection.token_expiry);
  const now = new Date();

  if (tokenExpiry > now) {
    return connection.access_token;
  }

  if (!connection.refresh_token) return null;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: connection.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const tokens = await response.json();

    if (!tokens.access_token) {
      console.error("Failed to refresh token:", tokens);
      return null;
    }

    await supabase
      .from("google_drive_connections")
      .update({
        access_token: tokens.access_token,
        token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq("company_id", companyId);

    return tokens.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  const action = searchParams.get("action") || "status";

  const accessToken = await getValidAccessToken(companyId);

  if (action === "status") {
    const { data: connection } = await supabase
      .from("google_drive_connections")
      .select("google_email, connected_at")
      .eq("company_id", companyId)
      .single();

    return NextResponse.json({
      connected: !!connection && !!accessToken,
      email: connection?.google_email,
      connectedAt: connection?.connected_at,
    });
  }

  if (action === "list") {
    if (!accessToken) {
      return NextResponse.json({ error: "Not connected to Google Drive" }, { status: 401 });
    }

    try {
      const mimeTypes = [
        "application/pdf",
        "application/vnd.google-apps.document",
        "application/vnd.google-apps.spreadsheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      const query = mimeTypes.map(m => `mimeType='${m}'`).join(" or ");
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Google Drive API error:", data.error);
        return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
      }

      return NextResponse.json({ files: data.files || [] });
    } catch (error) {
      console.error("Failed to list Google Drive files:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { companyId, fileId, fileName, mimeType } = await req.json();

    if (!companyId || !fileId) {
      return NextResponse.json({ error: "Missing companyId or fileId" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(companyId);
    if (!accessToken) {
      return NextResponse.json({ error: "Not connected to Google Drive" }, { status: 401 });
    }

    let textContent = "";

    if (mimeType === "application/vnd.google-apps.document") {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      textContent = await response.text();
    } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      textContent = await response.text();
    } else if (mimeType === "application/pdf") {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const pdfParse = require("pdf-parse");
      const parsed = await pdfParse(buffer);
      textContent = String(parsed?.text ?? "").replace(/\u0000/g, "").trim();
    } else {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      textContent = await response.text();
    }

    if (textContent.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from file" },
        { status: 400 }
      );
    }

    console.log("Classifying document from Google Drive...");
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
      source: "google_drive",
    });
  } catch (error: any) {
    console.error("Google Drive import error:", error);
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
    .from("google_drive_connections")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    console.error("Failed to disconnect:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
