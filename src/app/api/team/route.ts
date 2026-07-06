import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("workers")
    .select("id,name,phone,role,verified,skills,shift,created_at")
    .eq("company_id", companyId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workers: data });
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; phone?: string; role?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });

  const { data, error } = await supabase.from("workers")
    .insert({ name: body.name || null, phone: body.phone, role: body.role || "operator", company_id: companyId, verified: false })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "worker.created", entityType: "worker", entityId: data.id });
  return NextResponse.json({ worker: data }, { status: 201 });
}
