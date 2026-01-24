import { supabase } from "@/lib/supabase";

export interface QuestionLog {
  id: string;
  companyId: string;
  question: string;
  answer: string;
  confidence: number;
  language: string;
  responseTimeMs: number;
  timestamp: string;
  workerPhone?: string;
}

export async function logQuestion(log: Omit<QuestionLog, "id">): Promise<void> {
  const { error } = await supabase.from("questions").insert({
    company_id: log.companyId,
    question: log.question,
    answer: log.answer,
    confidence: log.confidence,
    language: log.language,
    response_time_ms: log.responseTimeMs,
    worker_phone: log.workerPhone,
    created_at: log.timestamp,
  });

  if (error) {
    console.error("Error logging question:", error);
  }
}

export async function getQuestionLogs(companyId: string): Promise<QuestionLog[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    companyId: q.company_id,
    question: q.question,
    answer: q.answer,
    confidence: q.confidence,
    language: q.language,
    responseTimeMs: q.response_time_ms,
    timestamp: q.created_at,
    workerPhone: q.worker_phone,
  }));
}

export async function getStats(companyId: string) {
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("company_id", companyId);

  if (error || !questions) {
    return {
      totalQuestions: 0,
      todayCount: 0,
      weekCount: 0,
      avgConfidence: 0,
      avgResponseTime: 0,
      answeredRate: 0,
      byLanguage: {},
      byTopic: {},
      recentQuestions: [],
      knowledgeGaps: [],
    };
  }

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.setDate(now.getDate() - 7));

  const todayCount = questions.filter((q: any) => new Date(q.created_at) >= todayStart).length;
  const weekCount = questions.filter((q: any) => new Date(q.created_at) >= weekStart).length;

  const avgConfidence = questions.length > 0
    ? Math.round(questions.reduce((sum: number, q: any) => sum + (q.confidence || 0), 0) / questions.length)
    : 0;

  const avgResponseTime = questions.length > 0
    ? Math.round(questions.reduce((sum: number, q: any) => sum + (q.response_time_ms || 0), 0) / questions.length)
    : 0;

  const answered = questions.filter((q: any) => q.confidence && q.confidence > 50).length;
  const answeredRate = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

  const byLanguage: Record<string, number> = {};
  const byTopic: Record<string, number> = {};

  questions.forEach((q: any) => {
    if (q.language) {
      byLanguage[q.language] = (byLanguage[q.language] || 0) + 1;
    }
  });

  const lowConfidence = questions.filter((q: any) => q.confidence && q.confidence < 50);
  const knowledgeGaps = lowConfidence.slice(0, 10).map((q: any) => ({
    question: q.question,
    count: 1,
  }));

  return {
    totalQuestions: questions.length,
    todayCount,
    weekCount,
    avgConfidence,
    avgResponseTime,
    answeredRate,
    byLanguage,
    byTopic,
    recentQuestions: questions.slice(0, 20),
    knowledgeGaps,
  };
}
