import { NextRequest, NextResponse } from "next/server";
import { checkAndSendDuePMs } from "@/lib/pm-scheduler";

import { verifyCronSecret } from "@/lib/cron-auth";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!verifyCronSecret(req)) return unauthorized();

  const result = await checkAndSendDuePMs();
  return NextResponse.json({ ok: true, ...result });
}
