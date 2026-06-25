import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("assets")
    .select("id,name,asset_tag,type,manufacturer,make,model,year,serial_number,location,status,health_score,created_at")
    .eq("company_id", companyId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = ["id","name","asset_tag","type","manufacturer","make","model","year","serial_number","location","status","health_score","created_at"];
  const rows = (data || []).map((r: Record<string, unknown>) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="assets-${Date.now()}.csv"`,
    },
  });
}
