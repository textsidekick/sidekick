import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locationId = req.nextUrl.searchParams.get("locationId");

  let query = supabase
    .from("workers")
    .select("id,name,phone,role,verified,skills,shift,location_id,created_at")
    .eq("company_id", companyId);

  if (locationId && locationId !== "all") query = query.eq("location_id", locationId);

  const { data, error } = await query.order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workers: data });
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; phone?: string; role?: string; location_id?: string | null };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });

  const { data, error } = await supabase.from("workers")
    .insert({ name: body.name || null, phone: body.phone, role: body.role || "operator", company_id: companyId, location_id: body.location_id || null, verified: false })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "worker.created", entityType: "worker", entityId: data.id });
  return NextResponse.json({ worker: data }, { status: 201 });
}
