import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";
import { extractPriorityDisplayLabels, normalizeCompanyPriorityProfiles } from "@/lib/company-settings";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.from("company_settings").select("*").eq("company_id", companyId).single();
  const { data: cats } = await supabase.from("wo_categories").select("*").eq("company_id", companyId).order("name");
  const { data: pris } = await supabase.from("wo_priorities").select("*").eq("company_id", companyId).order("level");
  const { data: company } = await supabase.from("companies").select("name,manager_phone,manager_name").eq("id", companyId).single();
  const priorityDisplayLabels = extractPriorityDisplayLabels(data?.escalation_rules || []);

  return NextResponse.json({ settings: data, categories: cats || [], priorities: normalizeCompanyPriorityProfiles(pris as any, priorityDisplayLabels), company });
}

export async function PUT(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Upsert settings
  const { settings, company: companyUpdate, priorities } = body as {
    settings?: Record<string, unknown>;
    company?: Record<string, unknown>;
    priorities?: Array<{ id?: string; name?: string; level?: number; sla_hours?: number }>;
  };

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

  if (Array.isArray(priorities)) {
    const normalized = normalizeCompanyPriorityProfiles(priorities as any);
    const { data: existingRows } = await supabase
      .from("wo_priorities")
      .select("id, name")
      .eq("company_id", companyId);

    const existingByName = new Map(
      (existingRows || [])
        .filter((row: any) => typeof row.name === "string")
        .map((row: any) => [String(row.name).toLowerCase(), row])
    );

    for (const priority of normalized) {
      const existing = existingByName.get(priority.name);
      const payload = {
        company_id: companyId,
        name: priority.name,
        level: priority.level,
        sla_hours: priority.sla_hours,
      };

      if (existing?.id) {
        const { error } = await supabase
          .from("wo_priorities")
          .update({ level: priority.level, sla_hours: priority.sla_hours })
          .eq("id", existing.id)
          .eq("company_id", companyId);
        if (error) {
          console.error("[Settings] Priority update error:", error);
          return NextResponse.json({ error: "Failed to save priorities", details: error.message }, { status: 500 });
        }
      } else {
        const { error } = await supabase.from("wo_priorities").insert(payload);
        if (error) {
          console.error("[Settings] Priority insert error:", error);
          return NextResponse.json({ error: "Failed to save priorities", details: error.message }, { status: 500 });
        }
      }
    }
  }

  await auditLog({ companyId, action: "settings.updated", entityType: "company_settings", entityId: companyId });
  return NextResponse.json({ success: true });
}
