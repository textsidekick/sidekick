import { NextRequest, NextResponse } from "next/server";
import { generateShiftHandoff, sendShiftHandoff } from "@/lib/shift-handoffs";

import { verifyCronSecret } from "@/lib/cron-auth";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!verifyCronSecret(req)) return unauthorized();

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
