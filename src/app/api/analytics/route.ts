import { NextRequest, NextResponse } from "next/server";
import { logQuestion, getStats } from "./store";

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logQuestion({
      question: body.question || "",
      answer: body.answer || "",
      language: body.language || "en",
      confidence: body.confidence || 0,
      sources: body.sources || 0,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false });
  }
}
