import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get all documents for this company
    const { data: documents, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    // Get document chunks grouped by source
    const { data: chunks, error: chunkError } = await supabase
      .from("document_chunks")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    // Get integration connection statuses
    const connections: Record<string, any> = {};
    const tables = [
      { key: "google_drive", table: "google_drive_connections" },
      { key: "dropbox", table: "dropbox_connections" },
      { key: "sharepoint", table: "sharepoint_connections" },
      { key: "microsoft", table: "microsoft_connections" },
      { key: "notion", table: "notion_connections" },
      { key: "slack", table: "slack_connections" },
      { key: "confluence", table: "confluence_connections" },
      { key: "box", table: "box_connections" },
      { key: "zendesk", table: "zendesk_connections" },
      { key: "quickbooks", table: "quickbooks_connections" },
      { key: "gusto", table: "gusto_connections" },
    ];

    for (const { key, table } of tables) {
      const { data } = await supabase
        .from(table)
        .select("connected_at")
        .eq("company_id", companyId)
        .limit(1)
        .single();
      if (data) {
        connections[key] = { connected: true, connectedAt: data.connected_at };
      }
    }

    // Group documents/chunks by source
    const allItems = [
      ...(documents || []).map((d: any) => ({
        id: d.id,
        name: d.filename || d.title || d.name || "Untitled",
        source: d.source || "upload",
        type: d.type || "document",
        size: d.content?.length || d.text?.length || 0,
        importedAt: d.created_at || d.uploaded_at,
      })),
      ...(chunks || []).map((c: any) => ({
        id: c.id,
        name: c.title || c.filename || c.source_name || "Untitled",
        source: c.source || "unknown",
        type: c.type || "chunk",
        size: c.content?.length || c.text?.length || 0,
        importedAt: c.created_at,
      })),
    ];

    // Group by source
    const grouped: Record<string, any[]> = {};
    for (const item of allItems) {
      const src = item.source || "upload";
      if (!grouped[src]) grouped[src] = [];
      grouped[src].push(item);
    }

    // Summary
    const sources = Object.keys(grouped);
    const totalDocs = allItems.length;
    const lastSync = allItems.length > 0
      ? allItems.reduce((latest, item) => {
          const d = new Date(item.importedAt);
          return d > latest ? d : latest;
        }, new Date(0)).toISOString()
      : null;

    return NextResponse.json({
      summary: {
        totalDocuments: totalDocs,
        totalSources: sources.length,
        lastSync,
      },
      connections,
      sources: grouped,
    });
  } catch (error) {
    console.error("[Knowledge Base] Error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge base" }, { status: 500 });
  }
}
