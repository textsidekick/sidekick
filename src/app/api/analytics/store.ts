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
  // Keep last 500 entries
  const trimmed = logs.slice(-500);
  await put(ANALYTICS_KEY, JSON.stringify(trimmed), { access: "public", addRandomSuffix: false });
}

export async function logQuestion(log: Omit<QuestionLog, "id">): Promise<void> {
  const logs = await getAnalyticsData();
  logs.push({
    ...log,
    id: Date.now().toString(),
  });
  await saveAnalyticsData(logs);
}

export async function getStats(companyId?: string) {
  let logs = await getAnalyticsData();
  
  if (companyId) {
    logs = logs.filter(l => l.companyId === companyId || !l.companyId);
  }

  const byLanguage: Record<string, number> = {};
  logs.forEach(l => {
    byLanguage[l.language] = (byLanguage[l.language] || 0) + 1;
  });

  const byTopic: Record<string, number> = {};
  logs.forEach(l => {
    const q = l.question.toLowerCase();
    let topic = l.topic || "general";
    if (q.includes("park") || q.includes("estacion")) topic = "parking";
    else if (q.includes("ppe") || q.includes("safety") || q.includes("seguridad")) topic = "safety";
    else if (q.includes("break") || q.includes("lunch") || q.includes("almuerzo")) topic = "breaks";
    else if (q.includes("pay") || q.includes("salary") || q.includes("pago")) topic = "compensation";
    else if (q.includes("schedule") || q.includes("shift") || q.includes("horario")) topic = "schedule";
    else if (q.includes("dress") || q.includes("wear") || q.includes("uniform")) topic = "dress_code";
    else if (q.includes("benefit") || q.includes("insurance") || q.includes("health")) topic = "benefits";
    else if (q.includes("contact") || q.includes("phone") || q.includes("email")) topic = "contacts";
    else if (q.includes("train") || q.includes("orientation")) topic = "training";
    byTopic[topic] = (byTopic[topic] || 0) + 1;
  });

  const recent = logs.slice(-20).reverse();
  const avgConfidence = logs.length > 0 
    ? Math.round(logs.reduce((sum, l) => sum + l.confidence, 0) / logs.length)
    : 0;
  
  const today = new Date().toDateString();
  const todayCount = logs.filter(l => new Date(l.timestamp).toDateString() === today).length;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCount = logs.filter(l => new Date(l.timestamp) >= weekAgo).length;

  const knowledgeGaps = logs
    .filter(l => l.confidence < 0.5)
    .reduce((acc, l) => {
      const existing = acc.find(g => g.question.toLowerCase() === l.question.toLowerCase());
      if (existing) existing.count++;
      else acc.push({ question: l.question, count: 1 });
      return acc;
    }, [] as { question: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalQuestions: logs.length,
    todayCount,
    weekCount,
    byLanguage,
    byTopic,
    recentQuestions: recent,
    avgConfidence,
    avgResponseTime: 0,
    answeredRate: logs.length > 0 ? Math.round((logs.filter(l => l.confidence > 0.5).length / logs.length) * 100) : 0,
    knowledgeGaps,
  };
}
