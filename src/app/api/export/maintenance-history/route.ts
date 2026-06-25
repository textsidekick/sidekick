import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("work_orders")
    .select("short_id,title,status,priority,created_at,resolved_at,asset_id,assigned_to,assets(name)")
    .eq("company_id", companyId)
    .in("status", ["completed", "resolved", "closed"])
    .order("resolved_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = ["wo_id","title","status","priority","asset_name","created_at","resolved_at","resolution_time_hours","assigned_to"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data || []).map((r: any) => {
    const created = r.created_at ? new Date(r.created_at) : null;
    const resolved = r.resolved_at ? new Date(r.resolved_at) : null;
    const resHours = created && resolved
      ? ((resolved.getTime() - created.getTime()) / 3600000).toFixed(2)
      : "";
    const assetName = Array.isArray(r.assets) ? r.assets[0]?.name ?? "" : r.assets?.name ?? "";
    return [
      JSON.stringify(r.short_id ?? ""),
      JSON.stringify(r.title ?? ""),
      JSON.stringify(r.status ?? ""),
      JSON.stringify(r.priority ?? ""),
      JSON.stringify(assetName),
      JSON.stringify(r.created_at ?? ""),
      JSON.stringify(r.resolved_at ?? ""),
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
