import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

export interface AssetHealthAnalysis {
  healthScore: number;
  trend: "improving" | "stable" | "declining" | "critical";
  failureProbability30Days: number;
  topRiskFactors: string[];
  recommendedActions: { action: string; priority: string; estimatedCost?: number }[];
  mtbf: number | null;
  mtbfTrend: "improving" | "stable" | "worsening" | null;
}

export interface PlantHealthReport {
  overallScore: number;
  assetScores: { assetId: string; assetName: string; score: number; trend: string }[];
  predictions: { assetId: string; assetName: string; prediction: string; probability: number; timeframe: string }[];
  recommendations: { priority: string; action: string; asset: string; reasoning: string }[];
  pmOptimizations: { pmScheduleId: string; currentInterval: number; recommendedInterval: number; reasoning: string }[];
}

export interface RecurringIssue {
  assetId: string;
  assetName: string;
  issuePattern: string;
  occurrences: number;
  averageIntervalDays: number;
  lastOccurrence: string;
  predictedNextOccurrence: string;
  rootCauseHypothesis: string;
  preventiveAction: string;
}

export async function analyzeAssetHealth(assetId: string, companyId: string): Promise<AssetHealthAnalysis> {
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: asset }, { data: workOrders }] = await Promise.all([
    supabase.from("assets").select("*").eq("id", assetId).single(),
    supabase.from("work_orders").select("*").eq("asset_id", assetId).eq("company_id", companyId).gte("created_at", yearAgo).order("created_at", { ascending: true }),
  ]);

  if (!asset) {
    return { healthScore: 0, trend: "critical", failureProbability30Days: 1, topRiskFactors: ["Asset not found"], recommendedActions: [], mtbf: null, mtbfTrend: null };
  }

  const wos = workOrders || [];
  const reactiveWOs = wos.filter((w: any) => w.source !== "pm_schedule" && w.status === "completed");

  // Calculate MTBF
  let mtbf: number | null = null;
  if (reactiveWOs.length >= 2) {
    const timestamps = reactiveWOs.map((w: any) => new Date(w.created_at).getTime());
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push((timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60)); // hours
    }
    mtbf = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  // Check MTBF trend (compare first half intervals to second half)
  let mtbfTrend: "improving" | "stable" | "worsening" | null = null;
  if (reactiveWOs.length >= 4) {
    const timestamps = reactiveWOs.map((w: any) => new Date(w.created_at).getTime());
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    const mid = Math.floor(intervals.length / 2);
    const firstHalfAvg = intervals.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondHalfAvg = intervals.slice(mid).reduce((a, b) => a + b, 0) / (intervals.length - mid);
    const ratio = secondHalfAvg / firstHalfAvg;
    if (ratio < 0.7) mtbfTrend = "worsening";
    else if (ratio > 1.3) mtbfTrend = "improving";
    else mtbfTrend = "stable";
  }

  // Prepare data for Claude analysis
  const woSummaries = wos.slice(-20).map((w: any) => ({
    date: w.created_at,
    title: w.title,
    category: w.category,
    priority: w.priority,
    resolution: w.resolution_notes,
    repairMinutes: w.actual_time_minutes,
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `Analyze this manufacturing asset's health:

Asset: ${asset.name} (${asset.type || "unknown type"})
Manufacturer: ${asset.manufacturer || "unknown"}, Model: ${asset.model || "unknown"}
Installed: ${asset.install_date || "unknown"}
Total work orders (12 months): ${wos.length} (${reactiveWOs.length} reactive)
MTBF: ${mtbf ? Math.round(mtbf) + " hours" : "insufficient data"}
MTBF Trend: ${mtbfTrend || "insufficient data"}

Recent work orders:
${JSON.stringify(woSummaries, null, 0)}

Respond with JSON:
{
  "healthScore": <0-100>,
  "trend": "<improving|stable|declining|critical>",
  "failureProbability30Days": <0.0-1.0>,
  "topRiskFactors": ["factor1", "factor2"],
  "recommendedActions": [{"action": "description", "priority": "high|medium|low"}]
}

Be specific about risk factors based on the actual work order patterns. JSON only.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        healthScore: parsed.healthScore ?? 50,
        trend: parsed.trend || "stable",
        failureProbability30Days: parsed.failureProbability30Days ?? 0.5,
        topRiskFactors: parsed.topRiskFactors || [],
        recommendedActions: parsed.recommendedActions || [],
        mtbf,
        mtbfTrend,
      };
    }
  } catch { /* fall through */ }

  // Fallback: simple heuristic
  const recentMonth = wos.filter((w: any) => new Date(w.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const score = Math.max(0, 100 - recentMonth.length * 15);
  return {
    healthScore: score,
    trend: score < 40 ? "critical" : score < 60 ? "declining" : "stable",
    failureProbability30Days: Math.min(1, recentMonth.length * 0.2),
    topRiskFactors: ["Insufficient AI analysis — using heuristic"],
    recommendedActions: [],
    mtbf,
    mtbfTrend,
  };
}

export async function runPlantHealthCheck(companyId: string): Promise<PlantHealthReport> {
  const { data: assets } = await supabase.from("assets").select("id, name").eq("company_id", companyId);
  if (!assets || assets.length === 0) {
    return { overallScore: 100, assetScores: [], predictions: [], recommendations: [], pmOptimizations: [] };
  }

  const assetScores: PlantHealthReport["assetScores"] = [];
  const predictions: PlantHealthReport["predictions"] = [];
  const recommendations: PlantHealthReport["recommendations"] = [];

  for (const asset of assets) {
    const analysis = await analyzeAssetHealth(asset.id, companyId);
    assetScores.push({ assetId: asset.id, assetName: asset.name, score: analysis.healthScore, trend: analysis.trend });

    if (analysis.failureProbability30Days > 0.5) {
      predictions.push({
        assetId: asset.id,
        assetName: asset.name,
        prediction: analysis.topRiskFactors[0] || "Elevated failure risk",
        probability: analysis.failureProbability30Days,
        timeframe: "30 days",
      });
    }

    for (const action of analysis.recommendedActions) {
      recommendations.push({
        priority: action.priority,
        action: action.action,
        asset: asset.name,
        reasoning: `Health score: ${analysis.healthScore}, Trend: ${analysis.trend}`,
      });
    }
  }

  // PM optimization check
  const pmOptimizations: PlantHealthReport["pmOptimizations"] = [];
  const { data: pmSchedules } = await supabase.from("pm_schedules").select("*").eq("company_id", companyId).eq("status", "active");

  for (const pm of pmSchedules || []) {
    const assetAnalysis = assetScores.find(a => a.assetId === pm.asset_id);
    if (assetAnalysis && assetAnalysis.trend === "declining" && pm.frequency_type === "calendar") {
      const currentInterval = pm.frequency_value;
      const recommendedInterval = Math.max(1, Math.round(currentInterval * 0.6));
      if (recommendedInterval < currentInterval) {
        pmOptimizations.push({
          pmScheduleId: pm.id,
          currentInterval,
          recommendedInterval,
          reasoning: `Asset ${assetAnalysis.assetName} health is declining (score: ${assetAnalysis.score}). Tightening PM interval from ${currentInterval} to ${recommendedInterval} days.`,
        });
      }
    }
  }

  const overallScore = assetScores.length > 0
    ? Math.round(assetScores.reduce((sum, a) => sum + a.score, 0) / assetScores.length)
    : 100;

  return { overallScore, assetScores, predictions, recommendations, pmOptimizations };
}

export async function detectRecurringIssues(companyId: string): Promise<RecurringIssue[]> {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("*, assets:asset_id(name)")
    .eq("company_id", companyId)
    .gte("created_at", sixMonthsAgo)
    .not("asset_id", "is", null)
    .order("created_at", { ascending: true });

  if (!workOrders || workOrders.length < 3) return [];

  // Group by asset
  const byAsset: Record<string, any[]> = {};
  for (const wo of workOrders) {
    const key = wo.asset_id;
    if (!byAsset[key]) byAsset[key] = [];
    byAsset[key].push(wo);
  }

  // Find assets with 3+ issues
  const candidates = Object.entries(byAsset).filter(([, wos]) => wos.length >= 3);
  if (candidates.length === 0) return [];

  const candidateSummaries = candidates.map(([assetId, wos]) => ({
    assetId,
    assetName: (wos[0] as any).assets?.name || "Unknown",
    issues: wos.map((w: any) => ({
      date: w.created_at,
      title: w.title,
      category: w.category,
      resolution: w.resolution_notes,
    })),
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Analyze these manufacturing assets for recurring issue patterns:

${JSON.stringify(candidateSummaries, null, 0)}

For each asset that has a clear recurring pattern, return:
{
  "recurringIssues": [
    {
      "assetId": "uuid",
      "assetName": "name",
      "issuePattern": "brief description of the recurring issue",
      "occurrences": <number>,
      "averageIntervalDays": <number>,
      "lastOccurrence": "ISO date",
      "predictedNextOccurrence": "ISO date",
      "rootCauseHypothesis": "what's likely causing this",
      "preventiveAction": "what should be done to prevent it"
    }
  ]
}

Only include assets with clear recurring patterns. JSON only.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.recurringIssues || [];
    }
  } catch { /* fall through */ }

  return [];
}
