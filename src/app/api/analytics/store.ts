import { put, list, del } from "@vercel/blob";

export interface QuestionLog {
  id: string;
  question: string;
  answer: string;
  language: string;
  confidence: number;
  sources: number;
  timestamp: string;
  companyId?: string;
  topic?: string;
  responseTime?: number;
  answered?: boolean;
}

const ANALYTICS_KEY = "analytics-data.json";

async function getAnalyticsData(): Promise<QuestionLog[]> {
  try {
    const { blobs } = await list({ prefix: ANALYTICS_KEY });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch {
    return [];
  }
}

async function saveAnalyticsData(logs: QuestionLog[]): Promise<void> {
  try {
    const { blobs } = await list({ prefix: ANALYTICS_KEY });
    for (const blob of blobs) await del(blob.url);
  } catch {}
  const trimmed = logs.slice(-500);
  await put(ANALYTICS_KEY, JSON.stringify(trimmed), { access: "public", addRandomSuffix: false });
}

export async function logQuestion(log: Omit<QuestionLog, "id">): Promise<void> {
  const logs = await getAnalyticsData();
  logs.push({ ...log, id: Date.now().toString() });
  await saveAnalyticsData(logs);
}

function classifyTopic(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("park") || q.includes("lot")) return "parking";
  if (q.includes("safety") || q.includes("ppe")) return "safety";
  if (q.includes("break") || q.includes("lunch")) return "breaks";
  if (q.includes("pay") || q.includes("wage")) return "compensation";
  if (q.includes("schedule") || q.includes("shift")) return "schedule";
  if (q.includes("dress") || q.includes("wear") || q.includes("uniform")) return "dress_code";
  if (q.includes("benefit") || q.includes("insurance")) return "benefits";
  if (q.includes("bathroom") || q.includes("restroom") || q.includes("bano")) return "facilities";
  return "general";
}

export async function getStats(companyId?: string) {
  let logs = await getAnalyticsData();
  if (companyId) logs = logs.filter(l => l.companyId === companyId || !l.companyId);

  const byLanguage: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  
  logs.forEach(l => {
    byLanguage[l.language || "English"] = (byLanguage[l.language || "English"] || 0) + 1;
    const topic = l.topic || classifyTopic(l.question);
    byTopic[topic] = (byTopic[topic] || 0) + 1;
  });

  const avgConfidence = logs.length > 0 
    ? Math.round((logs.reduce((sum, l) => sum + (l.confidence || 0), 0) / logs.length) * 100)
    : 0;

  const logsWithTime = logs.filter(l => l.responseTime && l.responseTime > 0);
  const avgResponseTime = logsWithTime.length > 0
    ? Math.round(logsWithTime.reduce((sum, l) => sum + (l.responseTime || 0), 0) / logsWithTime.length)
    : 0;

  const today = new Date().toDateString();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  const knowledgeGaps = logs
    .filter(l => l.answered === false || l.confidence < 0.5)
    .reduce((acc, l) => {
      const existing = acc.find(g => g.question.toLowerCase() === l.question.toLowerCase());
      if (existing) existing.count++;
      else acc.push({ question: l.question, count: 1, topic: classifyTopic(l.question) });
      return acc;
    }, [] as { question: string; count: number; topic: string }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const answeredCount = logs.filter(l => l.answered !== false && l.confidence >= 0.5).length;

  return {
    totalQuestions: logs.length,
    todayCount: logs.filter(l => new Date(l.timestamp).toDateString() === today).length,
    weekCount: logs.filter(l => new Date(l.timestamp) >= weekAgo).length,
    byLanguage,
    byTopic,
    recentQuestions: logs.slice(-20).reverse(),
    avgConfidence,
    avgResponseTime,
    answeredRate: logs.length > 0 ? Math.round((answeredCount / logs.length) * 100) : 0,
    knowledgeGaps,
  };
}
