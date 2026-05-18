import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { companyId, limit = 50 } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const { data: conn } = await supabase
      .from("box_connections")
      .select("access_token")
      .eq("company_id", companyId)
      .single();

    if (!conn?.access_token) {
      return NextResponse.json({ error: "Box not connected" }, { status: 400 });
    }

    const listRes = await fetch(`https://api.box.com/2.0/folders/0/items?limit=${encodeURIComponent(String(limit))}`, {
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        Accept: "application/json",
      },
    });

    const listData = await listRes.json();
    if (!listRes.ok) {
      console.error("[Box] List error:", listData);
      return NextResponse.json({ error: "Failed to list Box files" }, { status: 500 });
    }

    const entries = listData.entries || [];
    let imported = 0;

    for (const item of entries) {
      if (item.type !== "file") continue;

      // Use Box download endpoint; some content-types may be binary.
      const downloadRes = await fetch(`https://api.box.com/2.0/files/${item.id}/content`, {
        headers: { Authorization: `Bearer ${conn.access_token}` },
        redirect: "follow",
      });

      if (!downloadRes.ok) continue;

      const text = await downloadRes.text();
      const content = `Box File: ${item.name}\n\n${text}`.trim();
      if (content.length < 30) continue;

      let embedding = null;
      try {
        embedding = await createEmbedding(content);
      } catch {}

      await supabase.from("document_chunks").insert({
        company_id: companyId,
        content,
        embedding,
        metadata: { source: "box", fileId: item.id, name: item.name },
      });

      imported++;
    }

    return NextResponse.json({ success: true, itemsFetched: entries.length, filesImported: imported });
  } catch (error) {
    console.error("[Box] Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
