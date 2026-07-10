import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDashboardAuth } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabase
    .from("training_paths")
    .select(`*, training_path_steps(* order by step_order asc)`)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Get worker progress for this path
  const { data: progress } = await supabase
    .from("worker_training_progress")
    .select(`
      id, worker_phone, status, current_step, started_at, completed_at, last_activity_at,
      workers(name)
    `)
    .eq("training_path_id", id)
    .order("last_activity_at", { ascending: false });

  return NextResponse.json({ path: data, enrollments: progress || [] });
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
