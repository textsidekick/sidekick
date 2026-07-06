import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auditLog } from "@/lib/audit";
import { fireWebhooks } from "@/lib/webhooks";

async function resolveCompany(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key) return null;
  const { data } = await supabase.from("companies").select("id").eq("api_key", key).single();
  return data?.id ?? null;
}

export async function GET(req: NextRequest) {
  const companyId = await resolveCompany(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const locationId = req.nextUrl.searchParams.get("locationId");
  let q = supabase.from("work_orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  if (locationId && locationId !== "all") q = q.eq("location_id", locationId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count: data?.length ?? 0 });
}

export async function POST(req: NextRequest) {
  const companyId = await resolveCompany(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const { data, error } = await supabase.from("work_orders").insert({ ...body, company_id: companyId, status: body.status || "open", location_id: body.location_id || null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "work_order.created", entityType: "work_order", entityId: data.id });
  await fireWebhooks(companyId, "work_order.created", data);
  return NextResponse.json({ data }, { status: 201 });
}
