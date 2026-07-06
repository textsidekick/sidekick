import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locationId = req.nextUrl.searchParams.get("locationId");
  let query = supabase
    .from("assets")
    .select("id,name,asset_tag,type,manufacturer,make,model,year,serial_number,location,status,health_score,created_at,location_id")
    .eq("company_id", companyId)
    .order("name");
  if (locationId && locationId !== "all") query = query.eq("location_id", locationId);
  const { data, error } = await query;

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
