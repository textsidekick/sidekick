import { NextRequest, NextResponse } from "next/server";
import { checkAndSendDuePMs } from "@/lib/pm-scheduler";

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

  const result = await checkAndSendDuePMs();
  return NextResponse.json({ ok: true, ...result });
}
