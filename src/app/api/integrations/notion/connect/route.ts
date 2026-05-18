import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId, apiKey } = await request.json();
    
    if (!companyId || !apiKey) {
      return NextResponse.json({ error: "Company ID and API key required" }, { status: 400 });
    }

    // Verify the Notion API key by listing pages
    const notionRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ page_size: 20 }),
    });

    if (!notionRes.ok) {
      return NextResponse.json({ error: "Invalid Notion API key" }, { status: 401 });
    }

    const notionData = await notionRes.json();
    const pages = (notionData.results || [])
      .filter((r: any) => r.object === "page" || r.object === "database")
      .map((r: any) => ({
        id: r.id,
        title: r.object === "page" 
          ? (r.properties?.title?.title?.[0]?.plain_text || r.properties?.Name?.title?.[0]?.plain_text || "Untitled")
          : (r.title?.[0]?.plain_text || "Untitled Database"),
        type: r.object,
      }));

    // Store connection
    await supabase.from("notion_connections").upsert({
      company_id: companyId,
      api_key: apiKey,
      connected: true,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error("[Notion] Connect error:", error);
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}
