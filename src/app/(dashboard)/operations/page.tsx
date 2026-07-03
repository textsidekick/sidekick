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
  AlertTriangle,
  Wrench,
  Eye,
  X,
  Info,
  MessageSquare,
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
  const [activeTab, setActiveTab] = useState<"operations" | "alerts">("operations");
  const [data, setData] = useState<OpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");

  // Alerts state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [selectedUQ, setSelectedUQ] = useState<any>(null);
  const [uqAnswer, setUqAnswer] = useState("");

  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);
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

  const loadAlerts = async () => {
    const cid = companyId || JSON.parse(localStorage.getItem("sidekick_auth") || "{}").companyId || "";
    if (!cid) return;
    setLoadingAlerts(true);
    try {
      const res = await fetch(`/api/issues?companyId=${cid}`);
      const data = await res.json();
      setIssues(data.issues || []);
      const qRes = await fetch(`/api/analytics?companyId=${cid}&timeRange=all`);
      const qData = await qRes.json();
      setUnansweredQuestions((qData.recentQuestions || []).filter((q: any) => !q.answer));
    } catch (e) {
      console.error("Failed to load alerts:", e);
    }
    setLoadingAlerts(false);
  };

  useEffect(() => {
    if (activeTab === "alerts") loadAlerts();
  }, [activeTab, companyId]);

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

  const TABS = [
    { id: "operations", label: "Operations" },
    { id: "alerts", label: "Alerts" },
  ] as const;

  return (
    <div>
      {/* Tab bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-[#C96442] text-[#C96442]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── OPERATIONS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "operations" && (
          <>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
                <p className="text-sm text-black/50 mt-1">Real-time plant view — health, work orders, alerts, and activity.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => location.reload()}>Refresh</Button>
                <Button onClick={() => (window.location.href = "/work-orders")}>View Work Orders</Button>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-black/5 p-6">
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

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-black/5 p-6">
                <SectionHeader title="AI Alerts" subtitle="Auto-generated risks, warnings, and insights" />
                <div className="mt-4 space-y-3">
                  {alerts.map((a) => {
                    const badge =
                      a.type === "critical" ? "bg-red-100 text-gray-700"
                      : a.type === "warning" ? "bg-amber-100 text-gray-700"
                      : "bg-blue-100 text-gray-700";
                    return (
                      <div key={a.id} className="rounded-xl border border-black/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badge)}>{a.type.toUpperCase()}</span>
                              {a.workOrderShortId && <span className="text-xs text-black/50">{a.workOrderShortId}</span>}
                            </div>
                            <div className="mt-2 font-medium">{a.title}</div>
                            <div className="mt-1 text-sm text-black/60">{a.description}</div>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}>Dismiss</Button>
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
                    <div className="text-sm text-black/50 border border-dashed border-black/10 rounded-xl p-6">No alerts right now.</div>
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
                    <div className="text-sm text-black/50 border border-dashed border-black/10 rounded-xl p-6">No recent activity.</div>
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
          </>
        )}

        {/* ── ALERTS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
              <p className="text-sm text-black/50 mt-1">Safety incidents, equipment issues, and unanswered worker questions.</p>
            </div>

            {loadingAlerts && (
              <div className="text-sm text-black/40 py-12 text-center">Loading…</div>
            )}

            {!loadingAlerts && (
              <>
                <AlertMetrics alerts={mappedAlerts} />
                <AlertCharts alerts={mappedAlerts} />
                <AlertsTable alerts={mappedAlerts} />

                {unansweredQuestions.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <SectionHeader
                      title="Unanswered Questions"
                      subtitle="Questions Sidekick could not answer — your response will be saved permanently"
                    />
                    <div className="divide-y divide-gray-100">
                      {unansweredQuestions.map((q: any, i: number) => (
                        <div
                          key={q.id || i}
                          onClick={() => { setSelectedUQ(q); setUqAnswer(""); }}
                          className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">{q.question}</p>
                            <p className="text-xs mt-1 text-gray-400">
                              Asked by {q.worker_name || "Worker"} · {q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-gray-700">Needs Answer</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
