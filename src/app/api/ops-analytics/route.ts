import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const locationId = req.nextUrl.searchParams.get("locationId");

  const days = parseInt(req.nextUrl.searchParams.get("days") || "30", 10);
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  let workOrdersQuery = supabase
    .from("work_orders")
    .select("id,status,priority,created_at,resolved_at,asset_id,location_id")
    .eq("company_id", companyId)
    .gte("created_at", since);
  let assetsQuery = supabase
    .from("assets")
    .select("id,name,health_score,status,location_id")
    .eq("company_id", companyId);
  let pmCompletionsQuery = supabase
    .from("pm_completions")
    .select("id,completed_at,scheduled_date,work_order_id")
    .eq("company_id", companyId)
    .gte("completed_at", since);
  let healthHistoryQuery = supabase
    .from("asset_health_history")
    .select("asset_id,health_score,recorded_at")
    .eq("company_id", companyId)
    .gte("recorded_at", new Date(Date.now() - 90 * 86400_000).toISOString())
    .order("recorded_at");

  if (locationId && locationId !== "all") {
    workOrdersQuery = workOrdersQuery.eq("location_id", locationId);
    assetsQuery = assetsQuery.eq("location_id", locationId);
  }

  const [woRes, assetsRes, pmRes, healthRes] = await Promise.all([
    workOrdersQuery,
    assetsQuery,
    pmCompletionsQuery,
    healthHistoryQuery,
  ]);

  const wos = woRes.data || [];
  const assets = assetsRes.data || [];
  const pmCompletions = (locationId && locationId !== "all")
    ? (pmRes.data || []).filter((pm: Record<string, unknown>) => wos.some((wo: Record<string, unknown>) => wo.id === pm.work_order_id))
    : (pmRes.data || []);
  const assetIds = new Set(assets.map((a: Record<string, unknown>) => a.id as string));
  const healthHistory = (healthRes.data || []).filter((h: Record<string, unknown>) => !locationId || locationId === "all" || assetIds.has(h.asset_id as string));

  // MTTR: mean time to resolve (hours)
  const resolved = wos.filter((w: Record<string, unknown>) => w.resolved_at && w.created_at);
  const mttr = resolved.length > 0
    ? resolved.reduce((sum: number, w: Record<string, unknown>) => {
        const ms = new Date(w.resolved_at as string).getTime() - new Date(w.created_at as string).getTime();
        return sum + ms / 3600000;
      }, 0) / resolved.length
    : 0;

  // WO completion rate
  const completed = wos.filter((w: Record<string, unknown>) => ["completed", "resolved", "closed"].includes(w.status as string)).length;
  const completionRate = wos.length > 0 ? (completed / wos.length) * 100 : 0;

  // Priority breakdown
  const byPriority: Record<string, number> = {};
  for (const w of wos) {
    const p = (w as Record<string, unknown>).priority as string || "unknown";
    byPriority[p] = (byPriority[p] || 0) + 1;
  }

  // Average health score
  const avgHealth = assets.length > 0
    ? assets.reduce((s: number, a: Record<string, unknown>) => s + ((a.health_score as number) || 0), 0) / assets.length
    : 0;

  // Assets by status
  const assetsByStatus: Record<string, number> = {};
  for (const a of assets) {
    const st = (a as Record<string, unknown>).status as string || "unknown";
    assetsByStatus[st] = (assetsByStatus[st] || 0) + 1;
  }

  // PM compliance (completions vs expected — simple: count completions in period)
  const pmCompliance = pmCompletions.length;

  // MTBF per asset: group resolved WOs by asset, compute avg gap
  const wosByAsset: Record<string, number[]> = {};
  for (const w of resolved) {
    const aid = (w as Record<string, unknown>).asset_id as string;
    if (!aid) continue;
    if (!wosByAsset[aid]) wosByAsset[aid] = [];
    wosByAsset[aid].push(new Date((w as Record<string, unknown>).created_at as string).getTime());
  }
  let mtbf = 0;
  let mtbfCount = 0;
  for (const times of Object.values(wosByAsset)) {
    if (times.length < 2) continue;
    times.sort((a, b) => a - b);
    for (let i = 1; i < times.length; i++) {
      mtbf += (times[i] - times[i - 1]) / 3600000;
      mtbfCount++;
    }
  }
  const avgMtbf = mtbfCount > 0 ? mtbf / mtbfCount : 0;

  // Health trends aggregated by week
  const weeklyHealth: Record<string, { total: number; count: number }> = {};
  for (const h of healthHistory) {
    const week = new Date((h as Record<string, unknown>).recorded_at as string);
    week.setHours(0, 0, 0, 0);
    week.setDate(week.getDate() - week.getDay()); // start of week
    const key = week.toISOString().slice(0, 10);
    if (!weeklyHealth[key]) weeklyHealth[key] = { total: 0, count: 0 };
    weeklyHealth[key].total += (h as Record<string, unknown>).health_score as number;
    weeklyHealth[key].count++;
  }
  const healthTrend = Object.entries(weeklyHealth).sort(([a], [b]) => a.localeCompare(b)).map(([week, v]) => ({
    week,
    avgHealth: v.total / v.count,
  }));

  return NextResponse.json({
    period: { days, since },
    workOrders: {
      total: wos.length,
      completed,
      completionRate: Math.round(completionRate * 10) / 10,
      byPriority,
      mttr: Math.round(mttr * 10) / 10,
    },
    assets: {
      total: assets.length,
      avgHealthScore: Math.round(avgHealth * 10) / 10,
      byStatus: assetsByStatus,
      mtbf: Math.round(avgMtbf * 10) / 10,
    },
    pm: { completions: pmCompliance },
    healthTrend,
  });
}
