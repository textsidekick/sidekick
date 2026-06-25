import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("work_orders")
    .select("short_id,title,description,status,priority,created_at,resolved_at,asset_id,assigned_to")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = ["id", "title", "description", "status", "priority", "created_at", "resolved_at", "asset_id", "assigned_to"];
  const rows = (data || []).map((r: Record<string, unknown>) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="work-orders-${Date.now()}.csv"`,
    },
  });
}
