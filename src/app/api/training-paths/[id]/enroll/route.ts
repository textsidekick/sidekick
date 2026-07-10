import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDashboardAuth } from "@/lib/dashboard-auth";

// POST /api/training-paths/:id/enroll
// Assign a worker to a training path
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { worker_phone, company_id, assigned_by } = body;

  if (!worker_phone || !company_id) {
    return NextResponse.json({ error: "worker_phone and company_id required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("worker_training_progress")
    .select("id, status")
    .eq("worker_phone", worker_phone)
    .eq("training_path_id", id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ enrollment: existing, already_enrolled: true });
  }

  const { data, error } = await supabase
    .from("worker_training_progress")
    .insert({
      worker_phone,
      company_id,
      training_path_id: id,
      current_step: 1,
      status: "not_started",
      assigned_by,
      started_at: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send first step via SMS
  try {
    const { data: path } = await supabase
      .from("training_paths")
      .select("name, training_path_steps!inner(title, content, step_order)")
      .eq("id", id)
      .single();

    if (path) {
      const steps = (path.training_path_steps || []).sort((a: any, b: any) => a.step_order - b.step_order);
      const firstStep = steps[0];
      if (firstStep) {
        // Notify via internal SMS trigger (best-effort, table may not exist)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queueTable = supabase.from("sms_outbound_queue" as any);
        await (queueTable as any).insert({
          to: worker_phone,
          message: `📚 You've been enrolled in: ${path.name}\n\nStep 1: ${firstStep.title}\n\n${firstStep.content}\n\nReply NEXT for next step, DONE when complete.`,
          company_id,
          type: "training_enrollment",
        });
      }
    }
  } catch {
    // SMS notification is best-effort
  }

  return NextResponse.json({ enrollment: data }, { status: 201 });
}
