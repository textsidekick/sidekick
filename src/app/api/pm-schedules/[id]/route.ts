import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { UpdatePMSchedule } from "@/types/operations";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function badRequest(message: string) {
  return json({ error: message }, 400);
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id) return badRequest("id is required");

  const { data, error } = await supabase
    .from("pm_schedules")
    .select(
      `
      *,
      asset:assets ( id, name, location ),
      completions:pm_completions ( id, completed_by, checklist_results, findings, photos, completed_at, work_order_id )
    `.trim()
    )
    .eq("id", id)
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ pm_schedule: data });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id) return badRequest("id is required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  // NOTE: No heavy validation yet; keep consistent with existing API style.
  const update: UpdatePMSchedule = {
    ...(body.company_id ? { company_id: body.company_id } : {}),
    ...(body.asset_id ? { asset_id: body.asset_id } : {}),
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.checklist !== undefined ? { checklist: body.checklist } : {}),
    ...(body.frequency_type !== undefined ? { frequency_type: body.frequency_type } : {}),
    ...(body.frequency_value !== undefined ? { frequency_value: body.frequency_value } : {}),
    ...(body.last_completed_at !== undefined ? { last_completed_at: body.last_completed_at } : {}),
    ...(body.next_due_at !== undefined ? { next_due_at: body.next_due_at } : {}),
    ...(body.assigned_to !== undefined ? { assigned_to: body.assigned_to } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
  } as any;

  const { data, error } = await supabase.from("pm_schedules").update(update as any).eq("id", id).select().single();
  if (error) return json({ error: error.message }, 500);

  return json({ pm_schedule: data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id) return badRequest("id is required");

  const { error } = await supabase.from("pm_schedules").delete().eq("id", id);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
}
