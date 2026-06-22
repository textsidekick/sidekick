import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { InsertPMSchedule, PMScheduleFrequencyType, UUID } from "@/types/operations";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function badRequest(message: string) {
  return json({ error: message }, 400);
}

function computeNextDueAt(frequencyType: PMScheduleFrequencyType, frequencyValue: number, fromDate = new Date()): string {
  // NOTE: For now, we only support simple calendar-based schedules.
  // `frequency_value` meaning depends on `frequency_type`. For calendar we treat it as days.
  const d = new Date(fromDate);
  if (frequencyType === "calendar") {
    const days = Number(frequencyValue);
    if (!Number.isFinite(days) || days <= 0) throw new Error("frequency_value must be a positive number of days");
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  // Meter / condition-based PMs need domain-specific signals; schedule next_due_at same as now for now.
  // Caller can update later.
  return d.toISOString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id");
  if (!companyId) return badRequest("company_id is required");

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("pm_schedules")
    .select(
      `
      *,
      asset:assets (
        id,
        name,
        location
      )
    `.trim()
    )
    .eq("company_id", companyId)
    .order("next_due_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  const rows = (data || []).map((row: any) => ({
    ...row,
    overdue: row?.next_due_at ? row.next_due_at < nowIso : false,
  }));

  return json({ pm_schedules: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const required = ["company_id", "asset_id", "title", "frequency_type", "frequency_value"] as const;
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || body[k] === "") {
      return badRequest(`${k} is required`);
    }
  }

  const company_id = body.company_id as UUID;
  const asset_id = body.asset_id as UUID;
  const title = String(body.title);
  const frequency_type = body.frequency_type as PMScheduleFrequencyType;
  const frequency_value = Number(body.frequency_value);

  const description = body.description ? String(body.description) : "";
  const checklist = Array.isArray(body.checklist) ? body.checklist : [];
  const assigned_to = (body.assigned_to as UUID | null | undefined) || null;

  let next_due_at: string;
  try {
    next_due_at = computeNextDueAt(frequency_type, frequency_value, new Date());
  } catch (e: any) {
    return badRequest(e?.message || "Unable to compute next_due_at");
  }

  const insert: InsertPMSchedule = {
    company_id,
    asset_id,
    title,
    description,
    checklist,
    frequency_type,
    frequency_value,
    last_completed_at: null,
    next_due_at,
    assigned_to,
    status: "active",
  };

  const { data, error } = await supabase.from("pm_schedules").insert(insert as any).select().single();
  if (error) return json({ error: error.message }, 500);

  return json({ pm_schedule: data }, 201);
}
