import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

async function getCloudId(accessToken: string): Promise<string | null> {
  const res = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as any[];
  // Prefer Confluence resource
  const confluence = data.find(r => Array.isArray(r.scopes) && r.scopes.some((s: string) => s.includes("confluence")));
  return confluence?.id || data?.[0]?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, limit = 25 } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const { data: conn } = await supabase
      .from("confluence_connections")
      .select("access_token")
      .eq("company_id", companyId)
      .single();

    if (!conn?.access_token) {
      return NextResponse.json({ error: "Confluence not connected" }, { status: 400 });
    }

    const cloudId = await getCloudId(conn.access_token);
    if (!cloudId) {
      return NextResponse.json({ error: "Unable to determine Confluence cloudId" }, { status: 500 });
    }

    const pagesUrl = `https://api.atlassian.com/ex/confluence/${cloudId}/wiki/api/v2/pages?limit=${encodeURIComponent(String(limit))}`;
    const pagesRes = await fetch(pagesUrl, {
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        Accept: "application/json",
      },
    });

    const pagesData = await pagesRes.json();

    if (!pagesRes.ok) {
      console.error("[Confluence] Pages fetch error:", pagesData);
      return NextResponse.json({ error: "Failed to fetch Confluence pages" }, { status: 500 });
    }

    const pages = pagesData.results || [];
    let imported = 0;

    for (const p of pages) {
      const title = p.title || "Untitled";
      const body = p.body?.storage?.value || p.body?.view?.value || "";

      // Body is usually HTML; keep it simple for now.
      const text = String(body).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const content = `Confluence Page: ${title}\n\n${text}`.trim();

      if (content.length < 30) continue;

      let embedding = null;
      try {
        embedding = await createEmbedding(content);
      } catch {
        // ignore embedding failures
      }

      await supabase.from("document_chunks").insert({
        company_id: companyId,
        content,
        embedding,
        metadata: { source: "confluence", pageId: p.id, title },
      });

      imported++;
    }

    return NextResponse.json({ success: true, pagesFetched: pages.length, pagesImported: imported });
  } catch (error) {
    console.error("[Confluence] Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
