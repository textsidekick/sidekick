import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDigestEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { companyId, email } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // Get this week's stats
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("company_id", companyId)
      .gte("created_at", oneWeekAgo);

    const { data: workers } = await supabase
      .from("workers")
      .select("*")
      .eq("company_id", companyId);

    const totalQuestions = questions?.length || 0;
    const uniqueWorkers = new Set(questions?.map(q => q.worker_phone)).size;
    const topQuestions = questions?.slice(0, 5).map(q => q.question) || [];
    const avgConfidence = questions?.length 
      ? Math.round(questions.reduce((sum, q) => sum + (q.confidence || 0), 0) / questions.length)
      : 0;

    const digest: any = {
      period: "Last 7 days",
      totalQuestions,
      uniqueWorkers,
      totalWorkers: workers?.length || 0,
      avgConfidence,
      topQuestions,
      generatedAt: new Date().toISOString(),
    };

    // Send email digest via Resend
    if (email) {
      const company = await supabase.from("companies").select("name").eq("id", companyId).single();
      const result = await sendDigestEmail(email, { ...digest, companyName: company.data?.name });
      digest.emailSent = result.sent;
      if (!result.sent) digest.emailError = result.reason;
    }

    return NextResponse.json(digest);
  } catch (error) {
    console.error("[Digest] Error:", error);
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}
