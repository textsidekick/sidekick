import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { companyId, perPage = 50 } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const { data: conn } = await supabase
      .from("zendesk_connections")
      .select("access_token, subdomain")
      .eq("company_id", companyId)
      .single();

    if (!conn?.access_token || !conn?.subdomain) {
      return NextResponse.json({ error: "Zendesk not connected" }, { status: 400 });
    }

    const url = `https://${conn.subdomain}.zendesk.com/api/v2/help_center/articles.json?per_page=${encodeURIComponent(String(perPage))}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Zendesk] Articles fetch error:", data);
      return NextResponse.json({ error: "Failed to fetch Zendesk articles" }, { status: 500 });
    }

    const articles = data.articles || [];
    let imported = 0;

    for (const a of articles) {
      const title = a.title || "Untitled";
      const body = a.body || "";
      const text = String(body).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const content = `Zendesk Article: ${title}\n\n${text}`.trim();
      if (content.length < 30) continue;

      let embedding = null;
      try {
        embedding = await createEmbedding(content);
      } catch {}

      await supabase.from("document_chunks").insert({
        company_id: companyId,
        content,
        embedding,
        metadata: { source: "zendesk", articleId: a.id, title },
      });

      imported++;
    }

    return NextResponse.json({ success: true, articlesFetched: articles.length, articlesImported: imported });
  } catch (error) {
    console.error("[Zendesk] Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
