import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ANALYTICS_DIR = "/tmp/sidekick-analytics";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || "demo";
    const days = parseInt(searchParams.get("days") || "7");

    const logFile = path.join(ANALYTICS_DIR, `${companyId}.jsonl`);

    if (!fs.existsSync(logFile)) {
      return NextResponse.json({
        ok: true,
        totalQuestions: 0,
        questionsToday: 0,
        avgResponseTime: 0,
        timeSaved: 0,
        topQuestions: [],
        questionsByDay: {},
        questionsByHour: {},
      });
    }

    const logs = fs
      .readFileSync(logFile, "utf-8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const recentLogs = logs.filter((log) => log.timestamp > cutoffTime);

    const today = new Date().toDateString();
    const todayLogs = logs.filter(
      (log) => new Date(log.timestamp).toDateString() === today
    );

    const questionCounts: Record<string, number> = {};
    recentLogs.forEach((log) => {
      const normalized = log.question.toLowerCase().trim();
      questionCounts[normalized] = (questionCounts[normalized] || 0) + 1;
    });

    const topQuestions = Object.entries(questionCounts)
      .map(([q, count]) => ({ question: q, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const questionsByDay: Record<string, number> = {};
    recentLogs.forEach((log) => {
      const day = new Date(log.timestamp).toLocaleDateString();
      questionsByDay[day] = (questionsByDay[day] || 0) + 1;
    });

    const questionsByHour: Record<number, number> = {};
    recentLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      questionsByHour[hour] = (questionsByHour[hour] || 0) + 1;
    });

    const avgResponseTime =
      recentLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) /
        (recentLogs.length || 1);

    const timeSavedMinutes = recentLogs.length * 5;

    return NextResponse.json({
      ok: true,
      totalQuestions: recentLogs.length,
      questionsToday: todayLogs.length,
      avgResponseTime: Math.round(avgResponseTime),
      timeSaved: timeSavedMinutes,
      topQuestions,
      questionsByDay,
      questionsByHour,
    });
  } catch (e: any) {
    console.error("Analytics stats error:", e);
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
