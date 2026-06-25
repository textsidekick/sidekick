import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auditLog } from "@/lib/audit";

async function resolveCompany(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key) return null;
  const { data } = await supabase.from("companies").select("id").eq("api_key", key).single();
  return data?.id ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await resolveCompany(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  delete body.id; delete body.company_id;
  const { data, error } = await supabase.from("assets").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).eq("company_id", companyId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "asset.updated", entityType: "asset", entityId: id, details: body as Record<string, unknown> });
  return NextResponse.json({ data });
}
