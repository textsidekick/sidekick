import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

export interface ManagerQueryResult {
  answer: string;
  suggestions: string[];
}

export async function handleManagerQuery(query: string, companyId: string): Promise<ManagerQueryResult> {
  // Step 1: Gather all relevant data from Supabase
  const [
    { data: workOrders },
    { data: assets },
    { data: workers },
    { data: pmSchedules },
  ] = await Promise.all([
    supabase.from("work_orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(200),
    supabase.from("assets").select("*").eq("company_id", companyId),
    supabase.from("workers").select("id, name, role, skills, shift").eq("company_id", companyId),
    supabase.from("pm_schedules").select("*").eq("company_id", companyId),
  ]);

  // Build context summary for Claude
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const wos = workOrders || [];
  const completedThisWeek = wos.filter((w: any) => w.status === "completed" && w.completed_at && new Date(w.completed_at) >= weekAgo);
  const completedThisMonth = wos.filter((w: any) => w.status === "completed" && w.completed_at && new Date(w.completed_at) >= monthAgo);
  const openWOs = wos.filter((w: any) => !["completed", "cancelled"].includes(w.status));

  const mttrThisWeek = completedThisWeek.length > 0
    ? completedThisWeek.reduce((sum: number, w: any) => sum + (w.actual_time_minutes || 0), 0) / completedThisWeek.length
    : 0;

  const downtimeThisMonth = completedThisMonth.reduce((sum: number, w: any) => sum + (w.actual_time_minutes || 0), 0);

  // Group work orders by asset
  const wosByAsset: Record<string, any[]> = {};
  for (const wo of wos) {
    const key = wo.asset_id || "unassigned";
    if (!wosByAsset[key]) wosByAsset[key] = [];
    wosByAsset[key].push(wo);
  }

  // Build asset summaries
  const assetSummaries = (assets || []).map((a: any) => {
    const assetWOs = wosByAsset[a.id] || [];
    const recentWOs = assetWOs.filter((w: any) => new Date(w.created_at) >= monthAgo);
    return {
      name: a.name,
      type: a.type,
      location: a.location,
      status: a.status,
      healthScore: a.health_score,
      totalWOsAllTime: assetWOs.length,
      wosLast30Days: recentWOs.length,
      commonCategories: countBy(recentWOs, "category"),
      recentIssues: recentWOs.slice(0, 5).map((w: any) => ({
        title: w.title,
        priority: w.priority,
        status: w.status,
        date: w.created_at,
        resolution: w.resolution_notes,
      })),
    };
  });

  // Technician summaries
  const techSummaries = (workers || [])
    .filter((w: any) => w.role === "technician")
    .map((tech: any) => {
      const techWOs = wos.filter((w: any) => w.assigned_to === tech.id && w.status === "completed");
      const avgTime = techWOs.length > 0
        ? techWOs.reduce((s: number, w: any) => s + (w.actual_time_minutes || 0), 0) / techWOs.length
        : 0;
      return {
        name: tech.name,
        skills: tech.skills,
        completedWOs: techWOs.length,
        avgRepairMinutes: Math.round(avgTime),
      };
    });

  const dataContext = JSON.stringify({
    summary: {
      totalAssets: (assets || []).length,
      openWorkOrders: openWOs.length,
      criticalWOs: openWOs.filter((w: any) => w.priority === "critical").length,
      completedThisWeek: completedThisWeek.length,
      completedThisMonth: completedThisMonth.length,
      mttrMinutesThisWeek: Math.round(mttrThisWeek),
      downtimeMinutesThisMonth: downtimeThisMonth,
      overduePMs: (pmSchedules || []).filter((p: any) => p.status === "active" && p.next_due_at && new Date(p.next_due_at) < now).length,
    },
    assets: assetSummaries,
    technicians: techSummaries,
    recentWorkOrders: wos.slice(0, 30).map((w: any) => ({
      shortId: w.short_id,
      title: w.title,
      asset: w.asset_name,
      priority: w.priority,
      status: w.status,
      category: w.category,
      createdAt: w.created_at,
      completedAt: w.completed_at,
      actualMinutes: w.actual_time_minutes,
      assignedTo: w.assigned_to,
      resolutionNotes: w.resolution_notes,
    })),
  }, null, 0);

  // Step 2: Ask Claude to answer the question using the data
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are the AI operations assistant for a manufacturing plant. A manager is asking you a question about their operations.

OPERATIONAL DATA:
${dataContext}

MANAGER'S QUESTION: "${query}"

Answer the question using SPECIFIC numbers from the data. Be direct and actionable. Include:
- The direct answer with specific numbers
- Any relevant comparisons or trends
- Actionable recommendations if appropriate
- Keep it concise but thorough (2-4 paragraphs max)

Also suggest 2-3 follow-up questions the manager might want to ask next.

Respond in this JSON format:
{
  "answer": "Your detailed answer here...",
  "suggestions": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"]
}

Respond ONLY with valid JSON.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: parsed.answer || "I couldn't generate an answer. Try rephrasing your question.",
        suggestions: parsed.suggestions || [],
      };
    }
  } catch {
    // Fall through
  }

  return {
    answer: text || "I couldn't process that query. Try asking something specific about your work orders, assets, or technicians.",
    suggestions: ["How many open work orders do we have?", "Which assets need attention?", "What's our MTTR this week?"],
  };
}

function countBy(arr: any[], key: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of arr) {
    const val = item[key] || "unknown";
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}
