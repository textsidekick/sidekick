import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  delete body.id; delete body.company_id;
  const { data, error } = await supabase.from("workers").update(body).eq("id", id).eq("company_id", companyId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "worker.updated", entityType: "worker", entityId: id });
  return NextResponse.json({ worker: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabase.from("workers").delete().eq("id", id).eq("company_id", companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "worker.deleted", entityType: "worker", entityId: id });
  return NextResponse.json({ success: true });
}
