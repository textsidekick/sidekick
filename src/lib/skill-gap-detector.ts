import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

export interface SkillGapReport {
  topKnowledgeGaps: { topic: string; questionCount: number; sampleQuestions: string[] }[];
  documentationGaps: { topic: string; description: string; suggestedAction: string }[];
  workerTrainingNeeds: { workerName: string; topics: string[]; questionCount: number }[];
  recommendations: string[];
}

export async function detectSkillGaps(companyId: string): Promise<SkillGapReport> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  // Get all questions from last 90 days
  const { data: questions } = await supabase
    .from("questions")
    .select("question, answer, worker_name, confidence, created_at")
    .eq("company_id", companyId)
    .gte("created_at", ninetyDaysAgo)
    .order("created_at", { ascending: false })
    .limit(500);

  if (!questions || questions.length < 5) {
    return {
      topKnowledgeGaps: [],
      documentationGaps: [],
      workerTrainingNeeds: [],
      recommendations: ["Not enough data yet. Skill gap analysis requires at least 5 worker questions. Keep using Sidekick and check back later."],
    };
  }

  // Also get work order data for context
  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("title, category, priority, reported_by, created_at")
    .eq("company_id", companyId)
    .gte("created_at", ninetyDaysAgo)
    .limit(200);

  const questionsSummary = questions.map((q: any) => ({
    question: q.question,
    worker: q.worker_name,
    confidence: q.confidence,
    lowConfidence: (q.confidence || 0) < 50,
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Analyze these worker questions from a manufacturing facility to identify skill gaps and training needs.

QUESTIONS (last 90 days):
${JSON.stringify(questionsSummary.slice(0, 200), null, 0)}

WORK ORDERS (last 90 days):
${JSON.stringify((workOrders || []).slice(0, 100).map((w: any) => ({ title: w.title, category: w.category, priority: w.priority })), null, 0)}

Analyze and return JSON:
{
  "topKnowledgeGaps": [
    {"topic": "descriptive topic name", "questionCount": <number>, "sampleQuestions": ["q1", "q2"]}
  ],
  "documentationGaps": [
    {"topic": "topic", "description": "what's missing", "suggestedAction": "what to do"}
  ],
  "workerTrainingNeeds": [
    {"workerName": "name", "topics": ["topic1", "topic2"], "questionCount": <number>}
  ],
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}

Be specific and actionable. Group similar questions into topics. Identify workers who ask significantly more questions than peers. Flag topics where answers had low confidence scores. JSON only.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        topKnowledgeGaps: parsed.topKnowledgeGaps || [],
        documentationGaps: parsed.documentationGaps || [],
        workerTrainingNeeds: parsed.workerTrainingNeeds || [],
        recommendations: parsed.recommendations || [],
      };
    }
  } catch { /* fall through */ }

  return {
    topKnowledgeGaps: [],
    documentationGaps: [],
    workerTrainingNeeds: [],
    recommendations: ["Analysis could not be completed. Try again later."],
  };
}
