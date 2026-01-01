import { NextRequest, NextResponse } from "next/server";

// In-memory analytics store
let analyticsData = {
  questions: [] as Array<{
    id: string;
    question: string;
    answer: string;
    confidence: number;
    topic: string;
    worker: string;
    timestamp: string;
    answered: boolean;
  }>,
  dailyStats: {} as Record<string, { questions: number; answered: number; avgConfidence: number }>,
};

// Auto-categorize questions
function categorizeQuestion(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("safety") || q.includes("ppe") || q.includes("incident") || q.includes("emergency")) return "Safety";
  if (q.includes("break") || q.includes("schedule") || q.includes("time") || q.includes("shift")) return "Schedule";
  if (q.includes("pay") || q.includes("benefit") || q.includes("pto") || q.includes("vacation") || q.includes("hr")) return "HR & Benefits";
  if (q.includes("equipment") || q.includes("machine") || q.includes("tool") || q.includes("forklift")) return "Equipment";
  if (q.includes("report") || q.includes("form") || q.includes("submit")) return "Reporting";
  if (q.includes("supervisor") || q.includes("manager") || q.includes("contact")) return "Contacts";
  return "General";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";

  // Calculate stats
  const now = new Date();
  const rangeMs = range === "30d" ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const startDate = new Date(now.getTime() - rangeMs);

  const recentQuestions = analyticsData.questions.filter(
    (q) => new Date(q.timestamp) >= startDate
  );

  const totalQuestions = recentQuestions.length;
  const answeredQuestions = recentQuestions.filter((q) => q.answered).length;
  const avgConfidence = recentQuestions.length > 0
    ? Math.round(recentQuestions.reduce((sum, q) => sum + q.confidence, 0) / recentQuestions.length)
    : 0;

  // Topic breakdown
  const topicCounts: Record<string, number> = {};
  for (const q of recentQuestions) {
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  }
  const topics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count, percent: Math.round((count / totalQuestions) * 100) || 0 }))
    .sort((a, b) => b.count - a.count);

  // Daily breakdown
  const dailyData: Array<{ date: string; questions: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayQuestions = recentQuestions.filter(
      (q) => q.timestamp.split("T")[0] === dateStr
    ).length;
    dailyData.push({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      questions: dayQuestions,
    });
  }

  // Training gaps (low confidence questions)
  const gaps = recentQuestions
    .filter((q) => q.confidence < 70)
    .reduce((acc, q) => {
      const existing = acc.find((g) => g.topic === q.topic);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ topic: q.topic, count: 1, avgConfidence: q.confidence });
      }
      return acc;
    }, [] as Array<{ topic: string; count: number; avgConfidence: number }>)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent questions
  const recent = recentQuestions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return NextResponse.json({
    summary: {
      totalQuestions,
      answeredQuestions,
      answerRate: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
      avgConfidence,
      timeSaved: Math.round(totalQuestions * 4.5), // 4.5 min saved per question
      costSaved: Math.round(totalQuestions * 4.5 * 0.83), // $50/hr supervisor rate
    },
    dailyData,
    topics,
    gaps,
    recentQuestions: recent,
  });
}

export async function POST(request: NextRequest) {
  const { question, answer, confidence, worker } = await request.json();

  const entry = {
    id: Date.now().toString(),
    question,
    answer,
    confidence: confidence || 0,
    topic: categorizeQuestion(question),
    worker: worker || "Floor " + String.fromCharCode(65 + Math.floor(Math.random() * 3)),
    timestamp: new Date().toISOString(),
    answered: confidence > 50,
  };

  analyticsData.questions.push(entry);

  // Keep only last 1000 questions in memory
  if (analyticsData.questions.length > 1000) {
    analyticsData.questions = analyticsData.questions.slice(-1000);
  }

  return NextResponse.json({ success: true, entry });
}

// Seed some demo data
function seedDemoData() {
  const demoQuestions = [
    { q: "What are the break times?", c: 95 },
    { q: "How do I report a safety incident?", c: 98 },
    { q: "What PPE is required for welding?", c: 92 },
    { q: "Who is my supervisor?", c: 88 },
    { q: "When is payday?", c: 94 },
    { q: "How do I request time off?", c: 91 },
    { q: "What's the emergency evacuation route?", c: 97 },
    { q: "How do I operate the forklift?", c: 65 },
    { q: "What's the overtime policy?", c: 78 },
    { q: "Where do I clock in?", c: 96 },
    { q: "How do I submit expense reports?", c: 62 },
    { q: "What's the dress code?", c: 89 },
    { q: "How do I contact HR?", c: 93 },
    { q: "What benefits do I have?", c: 72 },
    { q: "Where is the first aid kit?", c: 99 },
  ];

  const workers = ["Floor A", "Floor B", "Floor C", "Warehouse"];

  for (let i = 0; i < 50; i++) {
    const demo = demoQuestions[Math.floor(Math.random() * demoQuestions.length)];
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    analyticsData.questions.push({
      id: `demo-${i}`,
      question: demo.q,
      answer: "Demo answer",
      confidence: demo.c + Math.floor(Math.random() * 10) - 5,
      topic: categorizeQuestion(demo.q),
      worker: workers[Math.floor(Math.random() * workers.length)],
      timestamp: timestamp.toISOString(),
      answered: demo.c > 50,
    });
  }
}

seedDemoData();
