import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding, chunkText } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  const { fileId, fileName, companyId, mimeType } = await req.json();

  if (!fileId || !companyId) {
    return NextResponse.json({ error: "File ID and Company ID required" }, { status: 400 });
  }

  const { data: connection } = await supabase
    .from("google_drive_connections")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (!connection?.access_token) {
    return NextResponse.json({ error: "Not connected to Google Drive" }, { status: 401 });
  }

  try {
    let content = "";
    
    // Google Docs need to be exported, not downloaded directly
    if (mimeType === "application/vnd.google-apps.document") {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
        {
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export error:", errorText);
        return NextResponse.json({ error: "Failed to export Google Doc" }, { status: 500 });
      }
      
      content = await response.text();
    } else {
      // Regular files can be downloaded directly
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
          },
        }
      );

      if (!response.ok) {
        return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
      }

      content = await response.text();
    }

    // Use same logic as documents/route.ts
    const chunks = chunkText(content, 500);

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ company_id: companyId, name: fileName, content: content })
      .select()
      .single();

    if (docError) {
      console.error("Failed to store document:", docError);
      return NextResponse.json({ error: "Failed to store document: " + docError.message }, { status: 500 });
    }

    // Create chunks with embeddings
    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      await supabase.from("document_chunks").insert({
        document_id: doc.id,
        company_id: companyId,
        content: chunk,
        embedding: embedding,
      });
    }

    return NextResponse.json({ 
      success: true, 
      document: { id: doc.id, name: fileName },
      chunksCount: chunks.length 
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import file: " + error.message }, { status: 500 });
  }
}
