import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auditLog } from "@/lib/audit";

function getApiKey(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function resolveCompany(req: NextRequest) {
  const key = getApiKey(req);
  if (!key) return null;
  const { data } = await supabase.from("companies").select("id").eq("api_key", key).single();
  return data?.id ?? null;
}

export async function GET(req: NextRequest) {
  const companyId = await resolveCompany(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const locationId = req.nextUrl.searchParams.get("locationId");

  let query = supabase
    .from("assets")
    .select("id,name,asset_tag,type,manufacturer,make,model,year,serial_number,location,location_id,status,health_score,created_at,updated_at")
    .eq("company_id", companyId);
  if (locationId && locationId !== "all") query = query.eq("location_id", locationId);
  const { data, error } = await query.order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count: data?.length ?? 0 });
}

export async function POST(req: NextRequest) {
  const companyId = await resolveCompany(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!body.asset_tag) body.asset_tag = `ASSET-${Date.now()}`;

  const { data, error } = await supabase
    .from("assets")
    .insert({ ...body, company_id: companyId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "asset.created", entityType: "asset", entityId: data.id });
  return NextResponse.json({ data }, { status: 201 });
}
