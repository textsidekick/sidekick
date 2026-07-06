import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";
import { extractPriorityDisplayLabels, normalizeCompanyPriorityProfiles } from "@/lib/company-settings";
import { locationIdFor } from "@/lib/location-utils";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.from("company_settings").select("*").eq("company_id", companyId).single();
  const { data: cats } = await supabase.from("wo_categories").select("*").eq("company_id", companyId).order("name");
  const { data: pris } = await supabase.from("wo_priorities").select("*").eq("company_id", companyId).order("level");
  const { data: company } = await supabase.from("companies").select("name,manager_phone,manager_name").eq("id", companyId).single();
  const { data: locations } = await supabase.from("locations").select("id,name,city,state,address,is_primary").eq("company_id", companyId).order("is_primary", { ascending: false }).order("name");
  const priorityDisplayLabels = extractPriorityDisplayLabels(data?.escalation_rules || []);

  return NextResponse.json({ settings: data, categories: cats || [], priorities: normalizeCompanyPriorityProfiles(pris as any, priorityDisplayLabels), company, locations: locations || [] });
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
    locations?: Array<{ id?: string; name?: string; city?: string; state?: string; address?: string; is_primary?: boolean }>;
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

  if (Array.isArray((body as any).locations)) {
    const rawLocations = (body as any).locations as Array<{ id?: string; name?: string; city?: string; state?: string; address?: string; is_primary?: boolean }>;
    const normalizedLocations = rawLocations
      .map((location) => ({
        id: typeof location.id === "string" && location.id.trim() ? location.id.trim() : locationIdFor(companyId, typeof location.name === "string" ? location.name.trim() : "location"),
        company_id: companyId,
        name: typeof location.name === "string" ? location.name.trim() : "",
        city: typeof location.city === "string" && location.city.trim() ? location.city.trim() : null,
        state: typeof location.state === "string" && location.state.trim() ? location.state.trim() : null,
        address: typeof location.address === "string" && location.address.trim() ? location.address.trim() : null,
        is_primary: Boolean(location.is_primary),
      }))
      .filter((location) => location.name);

    if (normalizedLocations.length > 0) {
      const primaryIndex = normalizedLocations.findIndex((location) => location.is_primary);
      const safeLocations = normalizedLocations.map((location, index) => ({
        ...location,
        is_primary: primaryIndex >= 0 ? index === primaryIndex : index === 0,
      }));

      const keepIds = new Set(safeLocations.map((location) => location.id).filter(Boolean));
      const { data: existingLocations } = await supabase.from("locations").select("id").eq("company_id", companyId);
      const staleIds = (existingLocations || []).map((location: any) => location.id).filter((id: string) => !keepIds.has(id));
      if (staleIds.length > 0) {
        await supabase.from("locations").delete().eq("company_id", companyId).in("id", staleIds);
      }

      for (const location of safeLocations) {
        if (location.id) {
          // Verify the location belongs to this company before upserting
          const { data: existing } = await supabase.from("locations").select("id,company_id").eq("id", location.id).maybeSingle();
          if (existing && existing.company_id !== companyId) {
            // Skip — this location ID belongs to another company
            continue;
          }
          await supabase.from("locations").upsert(
            { ...location, company_id: companyId, updated_at: new Date().toISOString() } as any,
            { onConflict: "id" }
          );
        }
      }
    }
  }

  await auditLog({ companyId, action: "settings.updated", entityType: "company_settings", entityId: companyId });
  return NextResponse.json({ success: true });
}
