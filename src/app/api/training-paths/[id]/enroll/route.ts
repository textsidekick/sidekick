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
  const { worker_phone, company_id, assigned_by, reminder_frequency, reminder_time, due_date } = body;

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

  // Fetch training path name for SMS
  const { data: path } = await supabase
    .from("training_paths")
    .select("name")
    .eq("id", id)
    .single();

  const insertData: Record<string, unknown> = {
    worker_phone,
    company_id,
    training_path_id: id,
    current_step: 1,
    status: "not_started",
    assigned_by,
    started_at: null,
  };

  if (reminder_frequency) insertData.reminder_frequency = reminder_frequency;
  if (reminder_time) insertData.reminder_time = reminder_time;
  if (due_date) insertData.due_date = due_date;

  const { data, error } = await supabase
    .from("worker_training_progress")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send SMS notification to worker
  if (path?.name && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        to: worker_phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `You've been assigned to: ${path.name}. Reply NEXT to start your first lesson.`,
      });
    } catch {
      // SMS is best-effort
    }
  }

  return NextResponse.json({ enrollment: data }, { status: 201 });
}
