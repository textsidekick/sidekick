import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.from("company_settings").select("*").eq("company_id", companyId).single();
  const { data: cats } = await supabase.from("wo_categories").select("*").eq("company_id", companyId).order("name");
  const { data: pris } = await supabase.from("wo_priorities").select("*").eq("company_id", companyId).order("level");
  const { data: company } = await supabase.from("companies").select("name,manager_phone,manager_name").eq("id", companyId).single();

  return NextResponse.json({ settings: data, categories: cats || [], priorities: pris || [], company });
}

export async function PUT(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Upsert settings
  const { settings, company: companyUpdate } = body as { settings?: Record<string, unknown>; company?: Record<string, unknown> };

  if (settings) {
    const { error: settingsErr } = await supabase.from("company_settings").upsert({
      company_id: companyId,
      ...settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: "company_id" });
    if (settingsErr) {
      console.error("[Settings] Upsert error:", settingsErr);
      return NextResponse.json({ error: "Failed to save settings", details: settingsErr.message }, { status: 500 });
    }
  }

  if (companyUpdate) {
    const allowed = ["name", "manager_phone", "manager_name"];
    const upd: Record<string, unknown> = {};
    for (const k of allowed) if (k in companyUpdate) upd[k] = companyUpdate[k];
    if (Object.keys(upd).length > 0) {
      await supabase.from("companies").update(upd).eq("id", companyId);
    }
  }

  await auditLog({ companyId, action: "settings.updated", entityType: "company_settings", entityId: companyId });
  return NextResponse.json({ success: true });
}
