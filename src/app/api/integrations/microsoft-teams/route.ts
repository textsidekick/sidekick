import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { classifyDocument, extractStructuredData, saveDocumentMetadata, DocumentMetadata } from "@/lib/documentClassifier";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

const STORAGE_DIR = "/tmp/sidekick-documents";

async function getValidAccessToken(companyId: string): Promise<string | null> {
  const { data: connection } = await supabase
    .from("microsoft_connections")
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

  if (action === "status") {
    const { data: connection } = await supabase
      .from("microsoft_connections")
      .select("microsoft_email, connected_at")
      .eq("company_id", companyId)
      .single();

    return NextResponse.json({
      connected: !!connection,
      email: connection?.microsoft_email,
      connectedAt: connection?.connected_at,
    });
  }

  const accessToken = await getValidAccessToken(companyId);
  if (!accessToken) {
    return NextResponse.json({ error: "Not connected to Microsoft" }, { status: 401 });
  }

  if (action === "teams") {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me/joinedTeams", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      return NextResponse.json({ teams: data.value || [] });
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
  }

  if (action === "files") {
    try {
      // List files from OneDrive root
      const response = await fetch("https://graph.microsoft.com/v1.0/me/drive/root/children", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      
      // Filter for supported file types
      const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv', '.ppt', '.pptx'];
      const files = (data.value || [])
        .filter((item: any) => {
          if (item.folder) return false;
          const ext = path.extname(item.name).toLowerCase();
          return supportedExtensions.includes(ext);
        })
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          modified: item.lastModifiedDateTime,
          downloadUrl: item["@microsoft.graph.downloadUrl"],
        }));

      return NextResponse.json({ files });
    } catch (error) {
      console.error("Failed to fetch OneDrive files:", error);
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { companyId, teamId, channelId, message, action, fileId, fileName, downloadUrl } = await req.json();

    const accessToken = await getValidAccessToken(companyId);
    if (!accessToken) {
      return NextResponse.json({ error: "Not connected to Microsoft" }, { status: 401 });
    }

    // Handle file import from OneDrive
    if (action === "import") {
      if (!fileId || !fileName) {
        return NextResponse.json({ error: "Missing fileId or fileName" }, { status: 400 });
      }

      // Get download URL if not provided
      let fileDownloadUrl = downloadUrl;
      if (!fileDownloadUrl) {
        const fileResponse = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const fileData = await fileResponse.json();
        fileDownloadUrl = fileData["@microsoft.graph.downloadUrl"];
      }

      // Download file content
      const downloadResponse = await fetch(fileDownloadUrl);
      if (!downloadResponse.ok) {
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
        return NextResponse.json({ error: "Could not extract enough text from file" }, { status: 400 });
      }

      const classification = await classifyDocument(textContent);
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
        source: "onedrive",
      });
    }

    // Handle Teams message sending
    if (!message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: {
            content: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send Teams message:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Microsoft API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("microsoft_connections")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    console.error("Failed to disconnect Microsoft:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
