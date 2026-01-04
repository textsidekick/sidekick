import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { put, list, del } from "@vercel/blob";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const GAPS_KEY = "knowledge-gaps.json";

interface KnowledgeGap {
  id: string;
  cluster: string[];
  topic: string;
  suggestedPolicy: string;
  priority: number;
  frequency: number;
  uniqueWorkers: number;
  trend: "rising" | "stable" | "new";
  lastAsked: string;
  companyId: string;
  createdAt: string;
}

interface GapsData {
  gaps: KnowledgeGap[];
  lastAnalyzed: string;
}

async function getGapsData(): Promise<GapsData> {
  try {
    const { blobs } = await list({ prefix: GAPS_KEY });
    if (blobs.length === 0) return { gaps: [], lastAnalyzed: "" };
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch {
    return { gaps: [], lastAnalyzed: "" };
  }
}

async function saveGapsData(data: GapsData): Promise<void> {
  try {
    const { blobs } = await list({ prefix: GAPS_KEY });
    for (const blob of blobs) await del(blob.url);
  } catch {}
  await put(GAPS_KEY, JSON.stringify(data), { access: "public", addRandomSuffix: false });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const data = await getGapsData();
  const gaps = companyId ? data.gaps.filter(g => g.companyId === companyId) : data.gaps;
  return NextResponse.json({ gaps: gaps.sort((a, b) => b.priority - a.priority), lastAnalyzed: data.lastAnalyzed });
}

export async function POST(request: NextRequest) {
  const { unansweredQuestions, companyId } = await request.json();
  if (!unansweredQuestions || unansweredQuestions.length === 0) {
    return NextResponse.json({ gaps: [], message: "No unanswered questions" });
  }

  const prompt = `Analyze these unanswered workplace questions and identify knowledge gaps.

Questions:
${unansweredQuestions.map((q: any, i: number) => `${i + 1}. "${q.question}" (asked ${q.count} times)`).join("\n")}

Return ONLY valid JSON array:
[{"clusterName":"Parking Policy","questions":["Where do I park?"],"topic":"parking","suggestedPolicy":"Create a parking guide covering employee lot locations.","priority":85}]`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const clusters = JSON.parse(cleaned);

    const gaps: KnowledgeGap[] = clusters.map((c: any, i: number) => ({
      id: `gap-${Date.now()}-${i}`,
      cluster: c.questions,
      topic: c.topic,
      suggestedPolicy: c.suggestedPolicy,
      priority: c.priority || 50,
      frequency: c.questions.length * 3,
      uniqueWorkers: c.questions.length,
      trend: c.priority > 70 ? "rising" : "new",
      lastAsked: new Date().toISOString(),
      companyId: companyId || "all",
      createdAt: new Date().toISOString(),
    }));

    const existingData = await getGapsData();
    await saveGapsData({
      gaps: [...gaps, ...existingData.gaps.filter(g => g.companyId !== companyId)],
      lastAnalyzed: new Date().toISOString()
    });

    return NextResponse.json({ gaps, analyzed: unansweredQuestions.length });
  } catch (error) {
    console.error("Gap analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
