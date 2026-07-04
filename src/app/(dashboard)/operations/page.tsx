"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { AlertMetrics } from "@/components/dashboard/alerts/AlertMetrics";
import { AlertCharts } from "@/components/dashboard/alerts/AlertCharts";
import { AlertsTable } from "@/components/dashboard/alerts/AlertsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Wrench,
  X,
  Info,
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

interface Issue {
  id: string;
  company_id: string;
  worker_phone: string;
  worker_name?: string;
  description: string;
  equipment?: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}

function formatMinutes(min: number) {
  if (!min || min <= 0) return "—";
  if (min < 60) return `${Math.round(min)}m`;
  const h = min / 60;
  return `${h.toFixed(1)}h`;
}

function healthColor(score: number) {
  if (score >= 85) return "text-gray-700";
  if (score >= 70) return "text-gray-700";
  return "text-gray-700";
}

export default function OperationsDashboardPage() {
  const [data, setData] = useState<OpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);

  // Read company from localStorage
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (auth.companyId) setCompanyId(auth.companyId);
    } catch {}
    const handleStorage = () => {
      try {
        const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (auth.companyId) setCompanyId(auth.companyId);
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const cid = companyId || JSON.parse(localStorage.getItem("sidekick_auth") || "{}").companyId || "";
        const res = await fetch("/api/dashboard/operations?companyId=" + cid, { cache: "no-store" });
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
  }, [companyId]);

  useEffect(() => {
    const loadAlerts = async () => {
      const cid = companyId || JSON.parse(localStorage.getItem("sidekick_auth") || "{}").companyId || "";
      if (!cid) return;
      setLoadingAlerts(true);
      try {
        const res = await fetch(`/api/issues?companyId=${cid}`);
        const result = await res.json();
        setIssues(result.issues || []);
      } catch (e) {
        console.error("Failed to load alerts:", e);
      }
      setLoadingAlerts(false);
    };
    loadAlerts();
  }, [companyId]);

  const plantHealthBreakdown = useMemo(() => {
    if (!data) return null;
    const assetAvg = Math.round(data.assets.avgHealthScore);
    const open =
      (data.workOrders.countsByStatus.open || 0) +
      (data.workOrders.countsByStatus.assigned || 0) +
      (data.workOrders.countsByStatus.in_progress || 0);
    const woPenalty = Math.round(Math.min(15, open * 1.5));
    const overduePenalty = Math.round(Math.min(10, data.workOrders.overdueCount * 2.5));
    const total = Math.max(0, Math.min(100, assetAvg - woPenalty - overduePenalty));
    return { assetAvg, woPenalty, overduePenalty, openWOs: open, overdueCount: data.workOrders.overdueCount, total };
  }, [data]);

  const plantHealthScore = plantHealthBreakdown?.total ?? 0;

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

  const mappedAlerts = issues.map((i) => ({
    id: i.id,
    issue: i.description,
    worker: i.worker_name || "Unknown",
    severity: i.severity as "high" | "medium" | "low",
    status: i.status as "open" | "resolved",
    date: i.created_at.split("T")[0],
    category: (i.equipment ? "equipment" : "safety") as "safety" | "equipment" | "compliance" | "health",
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plant Metrics</h1>
          <p className="text-sm text-black/50 mt-1">Live equipment health, maintenance performance, and active alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => location.reload()}>Refresh</Button>
          <Button onClick={() => (window.location.href = "/work-orders")}>View Work Orders</Button>
        </div>
      </div>

      {/* 1. Plant Health Score + key metrics */}
      <div className="rounded-lg bg-white border border-black/5 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-black/40">Plant Health Score</div>
            <div className="flex items-end gap-2">
              <div className={cn("mt-1 text-4xl font-semibold", healthColor(plantHealthScore))}>{plantHealthScore}/100</div>
              <button
                onClick={() => setShowHealthBreakdown((v) => !v)}
                className="mb-1 text-black/30 hover:text-black/60 transition"
                title="Show breakdown"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {showHealthBreakdown && plantHealthBreakdown && (
              <div className="mt-2 text-xs text-black/50 bg-black/[0.03] rounded-xl p-3 space-y-1 max-w-xs">
                <div>Asset health avg: <span className="font-medium text-black/70">{plantHealthBreakdown.assetAvg}</span></div>
                <div>− Open WO penalty ({plantHealthBreakdown.openWOs} open): <span className="font-medium text-gray-700">−{plantHealthBreakdown.woPenalty}</span></div>
                <div>− Overdue PM penalty ({plantHealthBreakdown.overdueCount} overdue): <span className="font-medium text-gray-700">−{plantHealthBreakdown.overduePenalty}</span></div>
                <div className="border-t border-black/10 pt-1 font-medium text-black/70">= {plantHealthBreakdown.total}/100</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-black/5 text-black hover:bg-black/5">Live</Badge>
            {!!data && (
              <Badge className={cn("hover:bg-black/5", mttrTrend <= 0 ? "bg-green-100 text-gray-700" : "bg-amber-100 text-gray-700")}>
                {mttrTrend <= 0 ? <ArrowDownRight className="h-3.5 w-3.5 mr-1" /> : <ArrowUpRight className="h-3.5 w-3.5 mr-1" />}
                MTTR {mttrTrend === 0 ? "—" : `${Math.abs(mttrTrend)}%`} vs last week
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Active machines" value={loading ? "—" : `${operational}/${totalAssets}`} icon={Activity} accentColor="emerald" />
          <MetricCard label="Downtime today" value={loading ? "—" : `${downtimeHoursToday.toFixed(1)}h`} icon={Clock} accentColor="amber" />
          <MetricCard label="Open work orders" value={loading ? "—" : String(openWOs)} subtext={criticalOpen ? `${criticalOpen} critical` : undefined} icon={Wrench} accentColor={criticalOpen ? "red" : "amber"} />
          <MetricCard label="MTTR (this week)" value={loading ? "—" : formatMinutes(data?.workOrders.mttrMinutesThisWeek || 0)} icon={CheckCircle2} accentColor="amber" />
        </div>

        {!!error && (
          <div className="mt-4 text-sm text-gray-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
        )}
      </div>

      {/* 2. Alert Summary */}
      {!loadingAlerts && <AlertMetrics alerts={mappedAlerts} />}

      {/* 3. Alert Charts */}
      {!loadingAlerts && <AlertCharts alerts={mappedAlerts} />}

      {/* 4. Active Alerts */}
      {loadingAlerts ? (
        <div className="text-sm text-black/40 py-12 text-center">Loading alerts…</div>
      ) : (
        <AlertsTable alerts={mappedAlerts} />
      )}

      {/* 5. Overdue PMs + Recent Activity */}
      <div className="rounded-lg bg-white border border-black/5 p-6">
        <SectionHeader title="Recent activity" subtitle="Latest work orders and operational events" />
        <div className="mt-4 space-y-3">
          {(data?.recentActivity || []).slice(0, 15).map((ev) => {
            const isCompleted = ev.status === "completed";
            return (
              <div key={ev.id} className="flex items-start justify-between gap-3 rounded-xl border border-black/5 p-4">
                <div>
                  <div className="text-sm font-medium">{ev.short_id} · {ev.title}</div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-black/50">{new Date(ev.created_at).toLocaleString()}</span>
                    <PriorityBadge priority={ev.priority} />
                    <StatusBadge status={ev.status} />
                  </div>
                </div>
                <div className={cn("text-xs px-2 py-1 rounded-full", isCompleted ? "bg-green-100 text-gray-700" : "bg-black/5 text-black/70")}>
                  {isCompleted ? "Done" : "Active"}
                </div>
              </div>
            );
          })}
          {!loading && (data?.recentActivity || []).length === 0 && (
            <div className="text-sm text-black/45 border border-dashed border-black/10 rounded-xl p-8 text-center">
              <p className="font-medium text-black/60">No recent activity</p>
              <p className="mt-1 text-xs">Work orders and maintenance events will show up here as they happen.</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-black/50">
          <span>Overdue PMs:</span>
          <span className={cn("font-medium", (data?.overduePMsCount || 0) ? "text-gray-700" : "text-black/70")}>
            {loading ? "—" : data?.overduePMsCount || 0}
          </span>
          {(data?.overduePMsCount || 0) > 0 && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-700">
              <X className="h-4 w-4 mr-1" /> Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
