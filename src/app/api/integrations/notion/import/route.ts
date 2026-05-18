import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { companyId, pageId, title } = await request.json();

    // Get the Notion API key from stored connection
    const { data: conn } = await supabase
      .from("notion_connections")
      .select("api_key")
      .eq("company_id", companyId)
      .single();

    if (!conn?.api_key) {
      return NextResponse.json({ error: "Notion not connected" }, { status: 400 });
    }

    // Fetch page content from Notion
    const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      headers: {
        "Authorization": `Bearer ${conn.api_key}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!blocksRes.ok) {
      return NextResponse.json({ error: "Failed to fetch Notion page" }, { status: 500 });
    }

    const blocksData = await blocksRes.json();
    
    // Extract text from blocks
    let content = "";
    for (const block of blocksData.results || []) {
      const type = block.type;
      const richText = block[type]?.rich_text || block[type]?.text || [];
      for (const t of richText) {
        content += (t.plain_text || "") + " ";
      }
      content += "\n";
    }

    content = content.trim();
    if (content.length < 10) {
      return NextResponse.json({ error: "Page has no extractable text" }, { status: 400 });
    }

    // Chunk and store
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      let embedding = null;
      try { embedding = await createEmbedding(chunk); } catch {}
      
      await supabase.from("document_chunks").insert({
        company_id: companyId,
        content: chunk,
        embedding,
        metadata: { source: "notion", pageId, title },
      });
    }

    return NextResponse.json({
      success: true,
      chunksCount: chunks.length,
      title,
      source: "notion",
    });
  } catch (error) {
    console.error("[Notion] Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
