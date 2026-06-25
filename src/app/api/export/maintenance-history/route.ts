import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Bug 5 fix: separate queries instead of FK join (schema cache issue)
  const { data, error } = await supabase
    .from("work_orders")
    .select("short_id,title,status,priority,created_at,completed_at,asset_id,assigned_to")
    .eq("company_id", companyId)
    .in("status", ["completed", "resolved", "closed"])
    .order("completed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch asset names separately
  const assetIds = [...new Set((data || []).map((r: any) => r.asset_id).filter(Boolean))];
  let assetMap: Record<string, string> = {};
  if (assetIds.length > 0) {
    const { data: assets } = await supabase
      .from("assets")
      .select("id,name")
      .in("id", assetIds);
    assetMap = Object.fromEntries((assets || []).map((a: any) => [a.id, a.name]));
  }

  const headers = ["wo_id","title","status","priority","asset_name","created_at","completed_at","resolution_time_hours","assigned_to"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data || []).map((r: any) => {
    const created = r.created_at ? new Date(r.created_at) : null;
    const completed = r.completed_at ? new Date(r.completed_at) : null;
    const resHours = created && completed
      ? ((completed.getTime() - created.getTime()) / 3600000).toFixed(2)
      : "";
    const assetName = r.asset_id ? (assetMap[r.asset_id] ?? "") : "";
    return [
      JSON.stringify(r.short_id ?? ""),
      JSON.stringify(r.title ?? ""),
      JSON.stringify(r.status ?? ""),
      JSON.stringify(r.priority ?? ""),
      JSON.stringify(assetName),
      JSON.stringify(r.created_at ?? ""),
      JSON.stringify(r.completed_at ?? ""),
      JSON.stringify(resHours),
      JSON.stringify(r.assigned_to ?? ""),
    ].join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="maintenance-history-${Date.now()}.csv"`,
    },
  });
}
