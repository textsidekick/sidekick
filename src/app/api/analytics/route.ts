import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const timeRange = searchParams.get("timeRange") || "all";

  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  try {
    // Calculate date filter based on time range
    let dateFilter: string | null = null;
    const now = new Date();
    
    switch (timeRange) {
      case "1day":
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case "1week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "1month":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "1year":
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        dateFilter = null;
    }

    // Build query
    let query = supabase
      .from("questions")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error("Analytics error:", error);
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    const allQuestions = questions || [];
    
    // Calculate stats
    const now_ts = Date.now();
    const oneDayAgo = now_ts - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now_ts - 7 * 24 * 60 * 60 * 1000;

    const todayQuestions = allQuestions.filter(q => new Date(q.created_at).getTime() > oneDayAgo);
    const weekQuestions = allQuestions.filter(q => new Date(q.created_at).getTime() > oneWeekAgo);

    const totalQuestions = allQuestions.length;
    const todayCount = todayQuestions.length;
    const weekCount = weekQuestions.length;

    const avgConfidence = totalQuestions > 0
      ? Math.round(allQuestions.reduce((sum, q) => sum + (q.confidence || 0), 0) / totalQuestions)
      : 0;

    const avgResponseTime = totalQuestions > 0
      ? Math.round(allQuestions.reduce((sum, q) => sum + (q.response_time_ms || 0), 0) / totalQuestions)
      : 0;

    const answeredCount = allQuestions.filter(q => q.confidence && q.confidence > 50).length;
    const answeredRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    // Group by hour (0-23)
    const byHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      byHour[i] = 0;
    }
    
    allQuestions.forEach(q => {
      const hour = new Date(q.created_at).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    // Group by language
    const byLanguage: Record<string, number> = {};
    allQuestions.forEach(q => {
      const lang = q.language || "English";
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    });

    // Group by topic
    const byTopic: Record<string, number> = {};
    allQuestions.forEach(q => {
      const topic = q.topic || "general";
      byTopic[topic] = (byTopic[topic] || 0) + 1;
    });

    // Find unanswered/low confidence questions (knowledge gaps)
    const lowConfidenceQuestions = allQuestions.filter(q => !q.confidence || q.confidence < 50);
    const questionCounts: Record<string, number> = {};
    lowConfidenceQuestions.forEach(q => {
      const normalized = q.question.toLowerCase().trim();
      questionCounts[normalized] = (questionCounts[normalized] || 0) + 1;
    });

    const knowledgeGaps = Object.entries(questionCounts)
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent questions with worker names
    const recentQuestions = allQuestions.slice(0, 20).map(q => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      worker_phone: q.worker_phone,
      worker_name: q.worker_name,
      confidence: q.confidence,
      created_at: q.created_at,
    }));

    return NextResponse.json({
      totalQuestions,
      todayCount,
      weekCount,
      avgConfidence,
      avgResponseTime,
      answeredRate,
      byHour,
      byLanguage,
      byTopic,
      knowledgeGaps,
      recentQuestions,
      timeRange,
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
