import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDashboardAuth } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabase
    .from("training_paths")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Fetch steps separately to avoid Supabase nested ordering issues
  const { data: steps } = await supabase
    .from("training_steps")
    .select("*")
    .eq("training_path_id", id)
    .order("sort_order", { ascending: true });

  // Get enrollments for this path
  const { data: enrollments } = await supabase
    .from("training_enrollments")
    .select("id, worker_id, status, current_step, enrolled_at, completed_at, workers(name)")
    .eq("training_path_id", id)
    .order("enrolled_at", { ascending: false });

  const pathWithSteps = { ...data, training_steps: steps || [] };

  // Normalize for UI (expects worker_phone, last_activity_at fields)
  const normalizedEnrollments = (enrollments || []).map((e: any) => ({
    ...e,
    worker_phone: e.worker_id,
    last_activity_at: e.completed_at || e.enrolled_at,
  }));

  return NextResponse.json({ path: pathWithSteps, enrollments: normalizedEnrollments });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const allowed = ["name", "description", "role", "estimated_days", "department_id", "is_active"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("training_paths")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const { error } = await supabase.from("training_paths").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
