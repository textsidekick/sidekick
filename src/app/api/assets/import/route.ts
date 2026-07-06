import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
    rows.push(row);
  }
  return rows;
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 });

  const locationId = formData.get("locationId") as string | null;

  const inserts = rows
    .filter((r) => r.name || r.asset_name)
    .map((r) => ({
      company_id: companyId,
      name: r.name || r.asset_name || "Unnamed",
      asset_tag: r.asset_tag || r.tag || `IMPORT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: r.type || r.asset_type || "Equipment",
      manufacturer: r.manufacturer || r.make || null,
      make: r.make || r.manufacturer || null,
      model: r.model || null,
      year: r.year ? parseInt(r.year, 10) || null : null,
      serial_number: r.serial_number || r.serial || null,
      location: r.location || null,
      location_id: (locationId && locationId !== "all") ? locationId : null,
      status: (r.status as string) || "operational",
    }));

  if (inserts.length === 0) return NextResponse.json({ error: "No valid rows found. Ensure CSV has a 'name' column." }, { status: 400 });

  const { data, error } = await supabase.from("assets").insert(inserts).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await auditLog({ companyId, action: "assets.bulk_import", entityType: "asset", details: { count: data?.length ?? 0 } });
  return NextResponse.json({ imported: data?.length ?? 0, total: rows.length });
}
