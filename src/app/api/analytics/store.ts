export interface QuestionLog {
  id: string;
  question: string;
  answer: string;
  language: string;
  confidence: number;
  sources: number;
  timestamp: string;
}

declare global {
  var analyticsStore: QuestionLog[] | undefined;
}

export function getAnalytics(): QuestionLog[] {
  return global.analyticsStore || [];
}

export function logQuestion(log: Omit<QuestionLog, "id">): void {
  if (!global.analyticsStore) {
    global.analyticsStore = [];
  }
  global.analyticsStore.push({
    ...log,
    id: Date.now().toString(),
  });
}

export function getStats() {
  const logs = getAnalytics();
  
  const byLanguage: Record<string, number> = {};
  logs.forEach(l => {
    byLanguage[l.language] = (byLanguage[l.language] || 0) + 1;
  });

  const byCategory: Record<string, number> = {};
  logs.forEach(l => {
    const q = l.question.toLowerCase();
    let cat = "Other";
    if (q.includes("park") || q.includes("estacion")) cat = "Parking";
    else if (q.includes("ppe") || q.includes("safety")) cat = "Safety/PPE";
    else if (q.includes("break") || q.includes("lunch")) cat = "Breaks";
    else if (q.includes("pay") || q.includes("salary")) cat = "Pay/Benefits";
    else if (q.includes("emergency")) cat = "Emergency";
    else if (q.includes("schedule")) cat = "Schedule";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  const recent = logs.slice(-20).reverse();
  const avgConfidence = logs.length > 0 
    ? Math.round(logs.reduce((sum, l) => sum + l.confidence, 0) / logs.length)
    : 0;
  const lowConfidence = logs.filter(l => l.confidence < 50).slice(-10);

  return {
    totalQuestions: logs.length,
    byLanguage,
    byCategory,
    recent,
    avgConfidence,
    lowConfidence,
    todayCount: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
  };
}
