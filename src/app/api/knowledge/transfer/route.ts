import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTransferQuestions, processTransferAnswer } from "@/lib/knowledge-transfer";

// GET: Generate knowledge transfer questions for an asset or general
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: session } = await supabase
      .from("manager_sessions")
      .select("company_id")
      .eq("token", token)
      .single();

    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const assetId = request.nextUrl.searchParams.get("assetId") || undefined;
    const questions = await generateTransferQuestions(session.company_id, assetId);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[knowledge/transfer] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// POST: Submit a worker's answer to a transfer question
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: session } = await supabase
      .from("manager_sessions")
      .select("company_id")
      .eq("token", token)
      .single();

    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { workerName, question, answer, assetId } = await request.json();

    if (!workerName || !question || !answer) {
      return NextResponse.json({ error: "workerName, question, and answer are required" }, { status: 400 });
    }

    const articleId = await processTransferAnswer(
      session.company_id,
      workerName,
      question,
      answer,
      assetId || undefined
    );

    return NextResponse.json({ success: !!articleId, articleId });
  } catch (error) {
    console.error("[knowledge/transfer] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
