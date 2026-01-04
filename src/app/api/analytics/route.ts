import { NextRequest, NextResponse } from "next/server";
import { logQuestion, getStats } from "./store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || undefined;
  const stats = await getStats(companyId);
  return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await logQuestion({
      question: body.question || "",
      answer: body.answer || "",
      language: body.language || "English",
      confidence: body.confidence || 0,
      sources: body.sources || 0,
      timestamp: new Date().toISOString(),
      companyId: body.companyId || "",
      topic: body.topic || "general",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false });
  }
}
