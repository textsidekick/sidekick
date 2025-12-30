import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ANALYTICS_DIR = "/tmp/sidekick-analytics";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const { question, answer, sources, companyId = "demo", method, responseTime } = await req.json();

    ensureDir(ANALYTICS_DIR);
    
    const logEntry = {
      timestamp: Date.now(),
      companyId,
      question,
      answer: answer?.slice(0, 200),
      sources: sources || [],
      method: method || "unknown",
      responseTime: responseTime || 0,
      date: new Date().toISOString(),
    };

    const logFile = path.join(ANALYTICS_DIR, `${companyId}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Analytics log error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
