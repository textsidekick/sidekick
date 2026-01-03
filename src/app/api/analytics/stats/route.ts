import { NextResponse } from "next/server";

// Access global stores
declare global {
  var smsLogs: Array<{
    from: string;
    question: string;
    answer: string;
    confidence: number;
    language: string;
    timestamp: string;
  }>;
  var questionLogs: Array<{
    question: string;
    answer: string;
    confidence: number;
    language: string;
    timestamp: string;
    source: string;
  }>;
}

if (!global.smsLogs) {
  global.smsLogs = [];
}

if (!global.questionLogs) {
  global.questionLogs = [];
}

export async function GET() {
  // Combine SMS logs and web Q&A logs
  const smsLogs = global.smsLogs || [];
  const webLogs = global.questionLogs || [];

  // Convert SMS logs to common format
  const allLogs = [
    ...smsLogs.map(l => ({
      question: l.question,
      answer: l.answer,
      confidence: l.confidence,
      language: l.language,
      timestamp: l.timestamp,
      source: "sms" as const
    })),
    ...webLogs.map(l => ({
      ...l,
      source: l.source || "web"
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = allLogs.filter(l => l.timestamp.startsWith(today));

  const avgConfidence = allLogs.length > 0
    ? Math.round(allLogs.reduce((sum, l) => sum + l.confidence, 0) / allLogs.length)
    : 0;

  // Count by language
  const byLanguage: Record<string, number> = {};
  for (const log of allLogs) {
    byLanguage[log.language] = (byLanguage[log.language] || 0) + 1;
  }

  // Count by source
  const bySource: Record<string, number> = {};
  for (const log of allLogs) {
    bySource[log.source] = (bySource[log.source] || 0) + 1;
  }

  // Low confidence questions
  const lowConfidence = allLogs
    .filter(l => l.confidence < 50)
    .slice(0, 10);

  return NextResponse.json({
    totalQuestions: allLogs.length,
    todayCount: todayLogs.length,
    avgConfidence,
    byLanguage,
    bySource,
    recent: allLogs.slice(0, 20),
    lowConfidence
  });
}

// POST endpoint to log a question (from web Q&A)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    global.questionLogs.push({
      question: body.question,
      answer: body.answer,
      confidence: body.confidence || 80,
      language: body.language || "en",
      timestamp: new Date().toISOString(),
      source: body.source || "web"
    });

    // Keep only last 1000 logs
    if (global.questionLogs.length > 1000) {
      global.questionLogs = global.questionLogs.slice(-1000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log question" }, { status: 500 });
  }
}
