import { NextRequest, NextResponse } from "next/server";
import { generateShiftHandoff, sendShiftHandoff } from "@/lib/shift-handoffs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") || req.headers.get("x-cron-secret");

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (secret !== process.env.CRON_SECRET) return unauthorized();

  const companyId = searchParams.get("company_id");
  const shiftName = searchParams.get("shift_name") || "shift";
  const outgoingSupervisor = searchParams.get("outgoing_supervisor") || "Supervisor";
  const incomingSupervisorPhone = searchParams.get("incoming_supervisor_phone");

  if (!companyId) {
    return NextResponse.json({ error: "company_id is required" }, { status: 400 });
  }

  const { id, summary } = await generateShiftHandoff(companyId, shiftName, outgoingSupervisor);

  if (incomingSupervisorPhone) {
    await sendShiftHandoff(id, incomingSupervisorPhone);
  }

  return NextResponse.json({ ok: true, handoff_id: id, summary });
}
