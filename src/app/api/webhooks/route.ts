import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("webhooks")
    .select("id,url,events,active,created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ webhooks: data });
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { url?: string; events?: string[]; secret?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { url, events = [], secret } = body;
  if (!url || !url.startsWith("http")) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  if (!Array.isArray(events) || events.length === 0) return NextResponse.json({ error: "events array required" }, { status: 400 });

  const { data, error } = await supabase
    .from("webhooks")
    .insert({ company_id: companyId, url, events, secret: secret || null, active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditLog({ companyId, action: "webhook.created", entityType: "webhook", entityId: data.id });
  return NextResponse.json({ webhook: data }, { status: 201 });
}
