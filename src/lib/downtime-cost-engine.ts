import { supabase } from "@/lib/supabase";

// ============================================
// Downtime Cost Engine
// Calculates real-time and historical cost impact of downtime
// ============================================

export interface DowntimeCostEstimate {
  downtimeMinutes: number;
  downtimeHours: number;
  productionImpact: {
    unitsLost: number;
    revenueImpact: number;
  };
  laborImpact: {
    idleWorkers: number;
    laborCost: number;
  };
  totalEstimatedCost: number;
  costPerMinute: number;
}

export interface CompanyCostConfig {
  revenuePerHour?: number;       // Total plant revenue per operating hour
  laborCostPerHour?: number;     // Total labor cost per hour (all workers)
  workersPerLine?: number;       // Average workers affected per line down
  unitsPerHour?: number;         // Production units per hour per line
  revenuePerUnit?: number;       // Revenue per unit produced
  operatingHoursPerDay?: number; // Hours plant operates per day
}

// Default cost assumptions for manufacturing (conservative)
const DEFAULT_CONFIG: CompanyCostConfig = {
  revenuePerHour: 5000,        // $5K/hr revenue for a small-mid manufacturer
  laborCostPerHour: 1500,      // ~$37.50/hr × 40 workers
  workersPerLine: 4,           // 4 workers idle per line down
  unitsPerHour: 100,           // 100 units/hr baseline
  revenuePerUnit: 50,          // $50/unit
  operatingHoursPerDay: 16,    // 2 shifts
};

// Get or create cost config for a company
export async function getCostConfig(companyId: string): Promise<CompanyCostConfig> {
  // Try to get from company metadata
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  // Check if company has cost_config in metadata or a dedicated field
  const stored = (company as any)?.cost_config || (company as any)?.metadata?.cost_config;
  if (stored && typeof stored === "object") {
    return { ...DEFAULT_CONFIG, ...stored };
  }

  return DEFAULT_CONFIG;
}

// Calculate downtime cost for a specific work order
export async function calculateDowntimeCost(
  workOrderId: string
): Promise<DowntimeCostEstimate | null> {
  const { data: wo } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", workOrderId)
    .single();

  if (!wo) return null;

  const config = await getCostConfig(wo.company_id);

  // Calculate downtime duration
  let downtimeMinutes = 0;
  if (wo.status === "completed" && wo.actual_time_minutes) {
    downtimeMinutes = wo.actual_time_minutes;
  } else if (wo.started_at) {
    // Still in progress — calculate elapsed time
    const started = new Date(wo.started_at).getTime();
    downtimeMinutes = Math.round((Date.now() - started) / (1000 * 60));
  } else if (wo.created_at) {
    // Not even started — total time since reported
    const created = new Date(wo.created_at).getTime();
    downtimeMinutes = Math.round((Date.now() - created) / (1000 * 60));
  }

  if (downtimeMinutes <= 0) downtimeMinutes = 0;

  const downtimeHours = downtimeMinutes / 60;

  // Production impact
  const unitsLost = Math.round((config.unitsPerHour || 100) * downtimeHours);
  const revenueImpact = Math.round((config.revenuePerHour || 5000) * downtimeHours);

  // Labor impact
  const idleWorkers = config.workersPerLine || 4;
  const avgWorkerHourlyCost = (config.laborCostPerHour || 1500) / 40; // Assume 40 workers
  const laborCost = Math.round(idleWorkers * avgWorkerHourlyCost * downtimeHours);

  const totalEstimatedCost = revenueImpact + laborCost;
  const costPerMinute = downtimeMinutes > 0 ? Math.round(totalEstimatedCost / downtimeMinutes) : 0;

  return {
    downtimeMinutes,
    downtimeHours: Math.round(downtimeHours * 10) / 10,
    productionImpact: { unitsLost, revenueImpact },
    laborImpact: { idleWorkers, laborCost },
    totalEstimatedCost,
    costPerMinute,
  };
}

// Calculate monthly ROI summary
export async function calculateMonthlyROI(companyId: string): Promise<{
  month: string;
  issuesResolved: number;
  totalDowntimeMinutes: number;
  totalDowntimeCost: number;
  avgResolutionMinutes: number;
  estimatedDowntimeAvoided: number;
  estimatedCostSaved: number;
  predictiveAlerts: number;
  knowledgeArticles: number;
}> {
  const config = await getCostConfig(companyId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long", year: "numeric" });

  const [
    { data: completedWOs },
    { data: predictiveWOs },
    { data: articles },
  ] = await Promise.all([
    supabase.from("work_orders").select("*").eq("company_id", companyId).eq("status", "completed").gte("completed_at", thirtyDaysAgo),
    supabase.from("work_orders").select("id").eq("company_id", companyId).eq("source", "ai_generated").gte("created_at", thirtyDaysAgo),
    supabase.from("knowledge_articles").select("id").eq("company_id", companyId).gte("created_at", thirtyDaysAgo),
  ]);

  const wos = completedWOs || [];
  const issuesResolved = wos.length;
  const totalDowntimeMinutes = wos.reduce((s: number, w: any) => s + (w.actual_time_minutes || 0), 0);
  const avgResolutionMinutes = issuesResolved > 0 ? Math.round(totalDowntimeMinutes / issuesResolved) : 0;

  const costPerMinute = (config.revenuePerHour || 5000) / 60;
  const totalDowntimeCost = Math.round(totalDowntimeMinutes * costPerMinute);

  // Estimate downtime avoided:
  // - Industry avg MTTR without CMMS: ~4 hours
  // - With Sidekick: actual avg MTTR
  // - Difference × number of issues = time saved
  const industryAvgMTTR = 240; // 4 hours in minutes (industry benchmark for unmanaged maintenance)
  const timeSavedPerIssue = Math.max(0, industryAvgMTTR - avgResolutionMinutes);
  const totalTimeSaved = timeSavedPerIssue * issuesResolved;
  const estimatedCostSaved = Math.round(totalTimeSaved * costPerMinute);

  // Add value from predictive alerts (each prevented failure = ~4 hours saved)
  const predictiveAlerts = (predictiveWOs || []).length;
  const predictiveSavings = predictiveAlerts * industryAvgMTTR * costPerMinute;

  return {
    month,
    issuesResolved,
    totalDowntimeMinutes,
    totalDowntimeCost,
    avgResolutionMinutes,
    estimatedDowntimeAvoided: totalTimeSaved + (predictiveAlerts * industryAvgMTTR),
    estimatedCostSaved: Math.round(estimatedCostSaved + predictiveSavings),
    predictiveAlerts,
    knowledgeArticles: (articles || []).length,
  };
}

// Format cost for SMS display
export function formatCost(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
