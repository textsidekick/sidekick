import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

export interface OperationsDigest {
  period: string;
  summary: string;
  metrics: {
    workOrdersCompleted: number;
    workOrdersCreated: number;
    avgMTTR: number;
    downtimeHours: number;
    knowledgeArticlesCaptured: number;
    issuesCaught: number;
  };
  highlights: string[];
  concerns: string[];
  aiInsights: string[];
}

export async function generateOperationsDigest(
  companyId: string,
  periodHours: number = 24
): Promise<OperationsDigest> {
  const since = new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();
  const periodLabel = periodHours <= 24 ? "Daily" : "Weekly";

  // Gather data
  const [
    { data: wosCreated },
    { data: wosCompleted },
    { data: allOpenWOs },
    { data: articles },
    { data: assets },
  ] = await Promise.all([
    supabase.from("work_orders").select("*").eq("company_id", companyId).gte("created_at", since),
    supabase.from("work_orders").select("*").eq("company_id", companyId).eq("status", "completed").gte("completed_at", since),
    supabase.from("work_orders").select("*").eq("company_id", companyId).not("status", "in", '("completed","cancelled")'),
    supabase.from("knowledge_articles").select("id").eq("company_id", companyId).gte("created_at", since),
    supabase.from("assets").select("id, name, health_score, status").eq("company_id", companyId),
  ]);

  const created = wosCreated || [];
  const completed = wosCompleted || [];
  const open = allOpenWOs || [];

  const avgMTTR = completed.length > 0
    ? completed.reduce((s: number, w: any) => s + (w.actual_time_minutes || 0), 0) / completed.length
    : 0;

  const downtimeMinutes = completed.reduce((s: number, w: any) => s + (w.actual_time_minutes || 0), 0);
  const criticalCount = created.filter((w: any) => w.priority === "critical").length;
  const degradedAssets = (assets || []).filter((a: any) => a.status === "degraded" || a.status === "down");

  // Generate AI summary
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: `Generate a concise ${periodLabel.toLowerCase()} operations digest for a manufacturing plant manager.

DATA:
- Work orders created: ${created.length} (${criticalCount} critical)
- Work orders completed: ${completed.length}
- Still open: ${open.length}
- Avg repair time: ${Math.round(avgMTTR)} minutes
- Total downtime: ${Math.round(downtimeMinutes / 60 * 10) / 10} hours
- Knowledge articles captured: ${(articles || []).length}
- Degraded/down assets: ${degradedAssets.map((a: any) => a.name).join(", ") || "none"}

Recent work orders:
${created.slice(0, 10).map((w: any) => `- ${w.title} (${w.priority}, ${w.status})`).join("\n")}

Return JSON:
{
  "summary": "2-3 sentence executive summary",
  "highlights": ["positive thing 1", "positive thing 2"],
  "concerns": ["concern needing attention 1", "concern 2"],
  "aiInsights": ["non-obvious insight from the data 1", "insight 2"]
}

JSON only.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let parsed: any = {};
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  } catch { /* defaults */ }

  return {
    period: periodLabel,
    summary: parsed.summary || `${completed.length} work orders completed in the last ${periodHours} hours.`,
    metrics: {
      workOrdersCompleted: completed.length,
      workOrdersCreated: created.length,
      avgMTTR: Math.round(avgMTTR),
      downtimeHours: Math.round(downtimeMinutes / 60 * 10) / 10,
      knowledgeArticlesCaptured: (articles || []).length,
      issuesCaught: created.length,
    },
    highlights: parsed.highlights || [],
    concerns: parsed.concerns || [],
    aiInsights: parsed.aiInsights || [],
  };
}

// Send digest via SMS to manager
export async function sendDigestSMS(companyId: string, periodHours: number = 24): Promise<boolean> {
  const { data: company } = await supabase.from("companies").select("manager_phone, name").eq("id", companyId).single();
  if (!company?.manager_phone) return false;

  const digest = await generateOperationsDigest(companyId, periodHours);

  const smsBody = `📊 ${digest.period} Ops Digest — ${company.name || "Your Plant"}

${digest.summary}

📈 Completed: ${digest.metrics.workOrdersCompleted} WOs
⏱️ Avg repair: ${digest.metrics.avgMTTR}m
⚠️ New issues: ${digest.metrics.workOrdersCreated}
🧠 Knowledge captured: ${digest.metrics.knowledgeArticlesCaptured}

${digest.concerns.length > 0 ? "⚠️ " + digest.concerns[0] : ""}
${digest.aiInsights.length > 0 ? "💡 " + digest.aiInsights[0] : ""}`.slice(0, 480);

  try {
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: company.manager_phone,
    });
    return true;
  } catch (e) {
    console.error("[digest] SMS send error:", e);
    return false;
  }
}
