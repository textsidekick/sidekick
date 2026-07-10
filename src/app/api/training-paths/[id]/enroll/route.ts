import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDashboardAuth } from "@/lib/dashboard-auth";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "",
  process.env.TWILIO_AUTH_TOKEN || ""
);

// POST /api/training-paths/:id/enroll
// Assign a worker to a training path
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { worker_phone, worker_id: bodyWorkerId, company_id, assigned_by, reminder_frequency, reminder_time, due_date } = body;

  if ((!worker_phone && !bodyWorkerId) || !company_id) {
    return NextResponse.json({ error: "worker_id (or worker_phone) and company_id required" }, { status: 400 });
  }

  // Resolve worker_id — prefer explicit worker_id, fall back to phone lookup
  let workerId: string | null = bodyWorkerId || null;
  let workerPhone: string | null = worker_phone || null;
  if (!workerId && workerPhone) {
    const { data: workerRow } = await supabase
      .from("workers")
      .select("id, phone")
      .eq("phone", workerPhone)
      .eq("company_id", company_id)
      .maybeSingle();
    workerId = workerRow?.id || null;
    workerPhone = workerRow?.phone || workerPhone;
  }
  if (!workerId) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("training_enrollments")
    .select("id, status")
    .eq("worker_id", workerId)
    .eq("training_path_id", id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ enrollment: existing, already_enrolled: true });
  }

  // Fetch training path name for SMS
  const { data: path } = await supabase
    .from("training_paths")
    .select("name")
    .eq("id", id)
    .single();

  const insertData: Record<string, unknown> = {
    worker_id: workerId,
    company_id,
    training_path_id: id,
    current_step: 0,
    status: "not_started",
    assigned_by,
    started_at: null,
  };

  if (reminder_frequency) insertData.reminder_frequency = reminder_frequency;
  if (reminder_time) insertData.reminder_time = reminder_time;
  if (due_date) insertData.due_date = due_date;

  const { data, error } = await supabase
    .from("training_enrollments")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send SMS notification to worker
  if (path?.name && workerPhone && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        to: workerPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `You've been assigned to: ${path.name}. Reply NEXT to start your first lesson.`,
      });
    } catch {
      // SMS is best-effort
    }
  }

  return NextResponse.json({ enrollment: data }, { status: 201 });
}
