import { supabase } from "@/lib/supabase";

interface AssetInfo {
  type?: string;
  manufacturer?: string;
  model?: string;
}

interface WorkOrderInfo {
  category?: string;
  title?: string;
  description?: string;
  resolution_notes?: string;
  actual_time_minutes?: number;
  ai_triage?: any;
}

export async function recordFailurePattern(workOrder: WorkOrderInfo, asset: AssetInfo): Promise<void> {
  if (!asset.type) return; // Need at least equipment type

  const symptoms = workOrder.ai_triage?.issue?.symptomSummary || workOrder.title || "";
  const rootCause = workOrder.ai_triage?.issue?.rootCauseHypothesis || "";
  const fixApplied = workOrder.resolution_notes || "";

  try {
    await supabase.from("failure_patterns").insert({
      equipment_type: asset.type,
      manufacturer: asset.manufacturer || null,
      model: asset.model || null,
      failure_category: workOrder.category || null,
      symptoms: symptoms || null,
      root_cause: rootCause || null,
      fix_applied: fixApplied || null,
      repair_time_minutes: workOrder.actual_time_minutes || null,
    });
  } catch (err) {
    console.error("[cross-plant] Error recording failure pattern:", err);
  }
}

export async function findSimilarPatterns(
  equipmentType: string,
  manufacturer?: string,
  symptoms?: string
): Promise<any[]> {
  let query = supabase
    .from("failure_patterns")
    .select("*")
    .eq("equipment_type", equipmentType)
    .order("created_at", { ascending: false })
    .limit(20);

  if (manufacturer) {
    query = query.eq("manufacturer", manufacturer);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // If symptoms provided, sort by relevance (simple keyword overlap)
  if (symptoms) {
    const sympWords = new Set(symptoms.toLowerCase().split(/\s+/));
    return data
      .map((p: any) => {
        const pWords = (p.symptoms || "").toLowerCase().split(/\s+/);
        const overlap = pWords.filter((w: string) => sympWords.has(w)).length;
        return { ...p, relevance: overlap };
      })
      .sort((a: any, b: any) => b.relevance - a.relevance);
  }

  return data;
}

export interface Benchmark {
  companyMTTR: number;
  networkMTTR: number;
  topQuartileMTTR: number;
  companyDowntimePercent: number;
  networkAvgRepairMinutes: number;
  areas: { category: string; companyAvg: number; networkAvg: number; status: "above" | "at" | "below" }[];
}

export async function generateBenchmark(companyId: string): Promise<Benchmark> {
  // Company metrics
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: companyWOs } = await supabase
    .from("work_orders")
    .select("category, actual_time_minutes")
    .eq("company_id", companyId)
    .eq("status", "completed")
    .gte("created_at", threeMonthsAgo);

  const cWOs = companyWOs || [];
  const companyMTTR = cWOs.length > 0
    ? cWOs.reduce((s: number, w: any) => s + (w.actual_time_minutes || 0), 0) / cWOs.length
    : 0;

  // Network metrics (from failure_patterns — anonymized)
  const { data: networkPatterns } = await supabase
    .from("failure_patterns")
    .select("failure_category, repair_time_minutes")
    .gte("created_at", threeMonthsAgo);

  const nPs = networkPatterns || [];
  const networkMTTR = nPs.length > 0
    ? nPs.reduce((s: number, p: any) => s + (p.repair_time_minutes || 0), 0) / nPs.length
    : 0;

  // Top quartile (25th percentile of repair times)
  const repairTimes = nPs.map((p: any) => p.repair_time_minutes || 0).filter((t: number) => t > 0).sort((a: number, b: number) => a - b);
  const topQuartileMTTR = repairTimes.length > 0
    ? repairTimes[Math.floor(repairTimes.length * 0.25)]
    : 0;

  // Category breakdown
  const companyByCategory: Record<string, number[]> = {};
  for (const wo of cWOs) {
    const cat = (wo as any).category || "other";
    if (!companyByCategory[cat]) companyByCategory[cat] = [];
    companyByCategory[cat].push((wo as any).actual_time_minutes || 0);
  }

  const networkByCategory: Record<string, number[]> = {};
  for (const p of nPs) {
    const cat = (p as any).failure_category || "other";
    if (!networkByCategory[cat]) networkByCategory[cat] = [];
    networkByCategory[cat].push((p as any).repair_time_minutes || 0);
  }

  const allCategories = new Set([...Object.keys(companyByCategory), ...Object.keys(networkByCategory)]);
  const areas: Benchmark["areas"] = [];

  for (const cat of allCategories) {
    const cTimes = companyByCategory[cat] || [];
    const nTimes = networkByCategory[cat] || [];
    const cAvg = cTimes.length > 0 ? cTimes.reduce((a, b) => a + b, 0) / cTimes.length : 0;
    const nAvg = nTimes.length > 0 ? nTimes.reduce((a, b) => a + b, 0) / nTimes.length : 0;

    let status: "above" | "at" | "below" = "at";
    if (nAvg > 0) {
      if (cAvg < nAvg * 0.8) status = "above";
      else if (cAvg > nAvg * 1.2) status = "below";
    }

    areas.push({ category: cat, companyAvg: Math.round(cAvg), networkAvg: Math.round(nAvg), status });
  }

  return {
    companyMTTR: Math.round(companyMTTR),
    networkMTTR: Math.round(networkMTTR),
    topQuartileMTTR: Math.round(topQuartileMTTR),
    companyDowntimePercent: 0, // Would need production hours data to calculate
    networkAvgRepairMinutes: Math.round(networkMTTR),
    areas,
  };
}
