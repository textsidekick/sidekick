import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

function startOfDayISO(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function startOfWeekISO(d = new Date()) {
  // Monday start
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const weekStart = startOfWeekISO();
    const dayStart = startOfDayISO();

    const [{ data: workOrders, error: woError }, { data: assets, error: assetError }, { data: pmSchedules, error: pmError }] =
      await Promise.all([
        supabase.from("work_orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("assets").select("id, status, health_score").eq("company_id", companyId),
        supabase.from("pm_schedules").select("id, next_due_at, status").eq("company_id", companyId),
      ]);

    if (woError) throw woError;
    if (assetError) throw assetError;
    if (pmError) throw pmError;

    const wos = (workOrders || []) as any[];
    const as = (assets || []) as any[];
    const pms = (pmSchedules || []) as any[];

    const now = Date.now();

    const countsByStatus: Record<string, number> = {};
    const countsByPriority: Record<string, number> = {};

    for (const wo of wos) {
      countsByStatus[wo.status] = (countsByStatus[wo.status] || 0) + 1;
      countsByPriority[wo.priority] = (countsByPriority[wo.priority] || 0) + 1;
    }

    const completedToday = wos.filter((w) => w.status === "completed" && w.completed_at && new Date(w.completed_at).toISOString() >= dayStart);

    // Downtime today: sum actual_time_minutes of completed today
    const downtimeMinutesToday = completedToday.reduce((acc, w) => acc + (Number(w.actual_time_minutes) || 0), 0);

    const completedThisWeek = wos.filter(
      (w) => w.status === "completed" && w.completed_at && new Date(w.completed_at).toISOString() >= weekStart
    );

    const mttrMinutesThisWeek =
      completedThisWeek.length > 0
        ? completedThisWeek.reduce((acc, w) => acc + (Number(w.actual_time_minutes) || 0), 0) / completedThisWeek.length
        : 0;

    // For comparison: prior week
    const weekStartDate = new Date(weekStart);
    const prevWeekStart = new Date(weekStartDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = weekStartDate;

    const completedPrevWeek = wos.filter((w) => {
      if (w.status !== "completed" || !w.completed_at) return false;
      const t = new Date(w.completed_at).getTime();
      return t >= prevWeekStart.getTime() && t < prevWeekEnd.getTime();
    });

    const mttrMinutesPrevWeek =
      completedPrevWeek.length > 0
        ? completedPrevWeek.reduce((acc, w) => acc + (Number(w.actual_time_minutes) || 0), 0) / completedPrevWeek.length
        : 0;

    // Overdue work orders: naive rule: open/assigned/in_progress older than 48h
    const overdueWorkOrders = wos.filter((w) => {
      if (["completed", "cancelled"].includes(w.status)) return false;
      const created = new Date(w.created_at).getTime();
      return now - created > 48 * 60 * 60 * 1000;
    });

    const assetsByStatus: Record<string, number> = {};
    let healthSum = 0;
    for (const a of as) {
      assetsByStatus[a.status] = (assetsByStatus[a.status] || 0) + 1;
      healthSum += Number(a.health_score) || 0;
    }
    const avgHealthScore = as.length ? healthSum / as.length : 0;

    const overduePMsCount = pms.filter((p) => p.status === "active" && p.next_due_at && new Date(p.next_due_at).getTime() < now).length;

    const recentActivity = wos.slice(0, 20).map((w) => ({
      id: w.id,
      short_id: w.short_id,
      title: w.title,
      status: w.status,
      priority: w.priority,
      asset_id: w.asset_id,
      assigned_to: w.assigned_to,
      created_at: w.created_at,
      completed_at: w.completed_at,
    }));

    return NextResponse.json({
      companyId,
      workOrders: {
        countsByStatus,
        countsByPriority,
        completedTodayCount: completedToday.length,
        mttrMinutesThisWeek,
        mttrMinutesPrevWeek,
        overdueCount: overdueWorkOrders.length,
      },
      assets: {
        countsByStatus: assetsByStatus,
        avgHealthScore,
        total: as.length,
      },
      downtime: {
        downtimeMinutesToday,
      },
      recentActivity,
      overduePMsCount,
    });
  } catch (error) {
    console.error("[dashboard/operations]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
