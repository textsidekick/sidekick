"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";
import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wrench,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OpsResponse = {
  companyId: string;
  workOrders: {
    countsByStatus: Record<string, number>;
    countsByPriority: Record<string, number>;
    completedTodayCount: number;
    mttrMinutesThisWeek: number;
    mttrMinutesPrevWeek: number;
    overdueCount: number;
  };
  assets: {
    countsByStatus: Record<string, number>;
    avgHealthScore: number;
    total: number;
  };
  downtime: {
    downtimeMinutesToday: number;
  };
  recentActivity: Array<{
    id: string;
    short_id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    completed_at: string | null;
  }>;
  overduePMsCount: number;
};

type AIAlert = {
  id: string;
  type: "critical" | "warning" | "insight";
  title: string;
  description: string;
  workOrderShortId?: string;
};

function formatMinutes(min: number) {
  if (!min || min <= 0) return "—";
  if (min < 60) return `${Math.round(min)}m`;
  const h = min / 60;
  return `${h.toFixed(1)}h`;
}

function healthColor(score: number) {
  if (score >= 85) return "text-green-700";
  if (score >= 70) return "text-amber-700";
  return "text-red-700";
}

export default function OperationsDashboardPage() {
  const [data, setData] = useState<OpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<AIAlert[]>([
    {
      id: "a1",
      type: "critical",
      title: "Rising vibration signature detected",
      description: "Conveyor 3 bearing failure likely within 7 days. Consider preemptive swap during planned downtime.",
      workOrderShortId: "WO-0042",
    },
    {
      id: "a2",
      type: "warning",
      title: "Repeat failure pattern",
      description: "Machine 7 has 3 similar electrical faults this month. Recommend inspection of harness + breaker.",
      workOrderShortId: "WO-0039",
    },
    {
      id: "a3",
      type: "insight",
      title: "MTTR improving",
      description: "Average repair time is down vs last week. Keep current on-call technician coverage.",
    },
  ]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/dashboard/operations?companyId=" + (JSON.parse(localStorage.getItem("sidekick_auth") || "{}").companyId || ""), { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as OpsResponse;
        if (!ignore) setData(json);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    const t = setInterval(run, 30_000);
    return () => {
      ignore = true;
      clearInterval(t);
    };
  }, []);

  const plantHealthScore = useMemo(() => {
    if (!data) return 0;
    // simple composite: weighted asset health + WO pressure
    const open =
      (data.workOrders.countsByStatus.open || 0) +
      (data.workOrders.countsByStatus.assigned || 0) +
      (data.workOrders.countsByStatus.in_progress || 0);
    const penalty = Math.min(25, open * 1.5 + data.workOrders.overdueCount * 2.5);
    return Math.max(0, Math.min(100, Math.round(data.assets.avgHealthScore - penalty)));
  }, [data]);

  const mttrTrend = useMemo(() => {
    if (!data) return 0;
    const prev = data.workOrders.mttrMinutesPrevWeek || 0;
    const cur = data.workOrders.mttrMinutesThisWeek || 0;
    if (!prev) return 0;
    return Math.round(((cur - prev) / prev) * 100);
  }, [data]);

  const openWOs =
    (data?.workOrders.countsByStatus.open || 0) +
    (data?.workOrders.countsByStatus.assigned || 0) +
    (data?.workOrders.countsByStatus.in_progress || 0) +
    (data?.workOrders.countsByStatus.on_hold || 0);

  const criticalOpen = data?.workOrders.countsByPriority.critical || 0;

  const operational = data?.assets.countsByStatus.operational || 0;
  const totalAssets = data?.assets.total || 0;

  const downtimeHoursToday = data ? data.downtime.downtimeMinutesToday / 60 : 0;

  return (
    <div>
      <TopBar />
      <OpsNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
            <p className="text-sm text-black/50 mt-1">Real-time plant view — health, work orders, alerts, and activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => location.reload()}>
              Refresh
            </Button>
            <Button onClick={() => (window.location.href = "/work-orders")}>View Work Orders</Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white border border-black/5 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40">Plant Health Score</div>
              <div className={cn("mt-1 text-4xl font-semibold", healthColor(plantHealthScore))}>{plantHealthScore}/100</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-black/5 text-black hover:bg-black/5">Live</Badge>
              {!!data && (
                <Badge className={cn("hover:bg-black/5", mttrTrend <= 0 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                  {mttrTrend <= 0 ? (
                    <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  )}
                  MTTR {mttrTrend === 0 ? "—" : `${Math.abs(mttrTrend)}%`} vs last week
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active machines"
              value={loading ? "—" : `${operational}/${totalAssets}`}
              icon={Activity}
              accentColor="emerald"
            />
            <MetricCard
              label="Downtime today"
              value={loading ? "—" : `${downtimeHoursToday.toFixed(1)}h`}
              icon={Clock}
              accentColor="amber"
            />
            <MetricCard
              label="Open work orders"
              value={loading ? "—" : String(openWOs)}
              subtext={criticalOpen ? `${criticalOpen} critical` : undefined}
              icon={Wrench}
              accentColor={criticalOpen ? "red" : "amber"}
            />
            <MetricCard
              label="MTTR (this week)"
              value={loading ? "—" : formatMinutes(data?.workOrders.mttrMinutesThisWeek || 0)}
              icon={CheckCircle2}
              accentColor="amber"
            />
          </div>

          {!!error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-black/5 p-6">
            <SectionHeader title="AI Alerts" subtitle="Auto-generated risks, warnings, and insights" />

            <div className="mt-4 space-y-3">
              {alerts.map((a) => {
                const badge =
                  a.type === "critical"
                    ? "bg-red-100 text-red-800"
                    : a.type === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800";

                return (
                  <div key={a.id} className="rounded-xl border border-black/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badge)}>{a.type.toUpperCase()}</span>
                          {a.workOrderShortId && (
                            <span className="text-xs text-black/50">{a.workOrderShortId}</span>
                          )}
                        </div>
                        <div className="mt-2 font-medium">{a.title}</div>
                        <div className="mt-1 text-sm text-black/60">{a.description}</div>
                      </div>
                      <AlertTriangle className={cn("h-5 w-5", a.type === "critical" ? "text-red-500" : a.type === "warning" ? "text-amber-500" : "text-blue-500")} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
                      >
                        Dismiss
                      </Button>
                      {a.workOrderShortId && (
                        <Button size="sm" variant="ghost" className="text-black/60">
                          <Eye className="h-4 w-4 mr-1" /> View WO
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="text-sm text-black/50 border border-dashed border-black/10 rounded-xl p-6">
                  No alerts right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-black/5 p-6">
            <SectionHeader title="Recent activity" subtitle="Latest work orders and operational events" />

            <div className="mt-4 space-y-3">
              {(data?.recentActivity || []).slice(0, 15).map((ev) => {
                const isCompleted = ev.status === "completed";
                return (
                  <div key={ev.id} className="flex items-start justify-between gap-3 rounded-xl border border-black/5 p-4">
                    <div>
                      <div className="text-sm font-medium">
                        {ev.short_id} · {ev.title}
                      </div>
                      <div className="mt-1 text-xs text-black/50">
                        {new Date(ev.created_at).toLocaleString()} · {ev.priority.toUpperCase()} · {ev.status.replaceAll("_", " ")}
                      </div>
                    </div>
                    <div className={cn("text-xs px-2 py-1 rounded-full", isCompleted ? "bg-green-100 text-green-800" : "bg-black/5 text-black/70")}>
                      {isCompleted ? "Done" : "Active"}
                    </div>
                  </div>
                );
              })}

              {!loading && (data?.recentActivity || []).length === 0 && (
                <div className="text-sm text-black/50 border border-dashed border-black/10 rounded-xl p-6">
                  No recent activity.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-black/50">
              <span>Overdue PMs:</span>
              <span className={cn("font-medium", (data?.overduePMsCount || 0) ? "text-red-700" : "text-black/70")}>
                {loading ? "—" : data?.overduePMsCount || 0}
              </span>
              {(data?.overduePMsCount || 0) > 0 && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-700" onClick={() => setAlerts((prev) => prev)}>
                  <X className="h-4 w-4 mr-1" /> Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
