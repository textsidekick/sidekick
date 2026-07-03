"use client";

import { formatTimeAgo } from "@/lib/format";
import React, { useState, useEffect } from "react";
import {
  MessageSquare, AlertTriangle, Users, Clock, Info,
  AlertCircle, CheckCircle2, ClipboardList, TrendingUp,
  Download, BarChart3,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import DemoMode from "@/components/dashboard/DemoMode";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";
import {
  IssueDetailModal,
  AllQuestionsModal,
  UnansweredQuestionModal,
  DraftModal,
} from "@/components/dashboard/modals";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Question {
  id: string; question: string; answer: string; worker_phone: string;
  worker_name?: string; confidence: number; created_at: string; topic?: string;
}
interface Issue {
  id: string; company_id: string; worker_phone: string; worker_name?: string;
  description: string; equipment?: string; severity: "low" | "medium" | "high";
  status: "open" | "resolved"; created_at: string; resolved_at?: string;
  resolved_by?: string; notes?: string;
}
interface Stats {
  totalQuestions: number; todayCount: number; weekCount: number; lastWeekCount?: number;
  avgConfidence: number; avgResponseTime: number; answeredRate: number;
  byLanguage: Record<string, number>; byTopic: Record<string, number>;
  byHour: Record<number, number>; recentQuestions: Question[];
  knowledgeGaps: { question: string; count: number }[];
}
interface WorkOrder {
  id: string; short_id: string; title: string; status: string;
  priority: string; created_at: string; completed_at?: string | null;
  assigned_to?: string | null;
}
interface Company {
  id: string; name: string; access_code?: string;
}
interface Worker {
  phone: string; company_id: string; name?: string;
}
interface OpsAnalytics {
  period: { days: number; since: string };
  workOrders: {
    total: number; completed: number; completionRate: number;
    byPriority: Record<string, number>; mttr: number;
  };
  assets: {
    total: number; avgHealthScore: number;
    byStatus: Record<string, number>; mtbf: number;
  };
  pm: { completions: number };
  healthTrend: { week: string; avgHealth: number }[];
}

function healthColor(score: number) {
  if (score >= 85) return "text-gray-700";
  if (score >= 70) return "text-gray-600";
  return "text-gray-700";
}

export default function ManagerDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<any[]>([]);
  const [selectedUQ, setSelectedUQ] = useState<any>(null);
  const [uqAnswer, setUqAnswer] = useState("");
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [draftModal, setDraftModal] = useState<{ open: boolean; draft: string; topic: string } | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionFilter, setQuestionFilter] = useState<"all" | "answered" | "unanswered">("all");
  const [trialInfo, setTrialInfo] = useState<{ plan: string; questionsUsed: number; questionsLimit: number; trialEndsAt: string } | null>(null);
  const [showDemoMode, setShowDemoMode] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);
  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Analytics metrics state
  const [opsAnalytics, setOpsAnalytics] = useState<OpsAnalytics | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Demo mode
  useEffect(() => {
    setShowDemoMode(localStorage.getItem("sidekick_demo_mode") === "true");
  }, []);

  // Trial info
  useEffect(() => {
    try {
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (authData.plan) {
        setTrialInfo({
          plan: authData.plan,
          questionsUsed: authData.questionsUsed || 0,
          questionsLimit: authData.questionsLimit || 50,
          trialEndsAt: authData.trialEndsAt || "",
        });
      }
    } catch {}
  }, []);

  // Load companies + workers
  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      let allCompanies = d.companies || [];
      try {
        const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        const userPhone = authData.phone || "";
        const adminList = process.env.NEXT_PUBLIC_ADMIN_PHONES?.split(",") || [];
        const isAdmin = adminList.some(p => userPhone.includes(p.trim()));
        if (!isAdmin && userPhone) {
          allCompanies = allCompanies.filter((c: any) => c.manager_phone === userPhone || c.manager_phone === userPhone.replace("+1", "+"));
        } else if (authData.companyId && !isAdmin) {
          allCompanies = allCompanies.filter((c: any) => c.id === authData.companyId);
        }
      } catch {}
      setCompanies(allCompanies);
      const savedAuth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (savedAuth.companyId && allCompanies.some((c: any) => c.id === savedAuth.companyId)) {
        setSelectedCompany(savedAuth.companyId);
      } else if (allCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(allCompanies[0].id);
      }
      if (d.workers) setWorkers(d.workers);
    });
  }, []);

  // Sync company from sidebar
  useEffect(() => {
    const handleStorage = () => {
      try {
        const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (authData.companyId && authData.companyId !== selectedCompany) {
          setSelectedCompany(authData.companyId);
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [selectedCompany]);

  const loadStats = async () => {
    if (!selectedCompany) return;
    setLoadingStats(true);
    const res = await fetch(`/api/analytics?companyId=${selectedCompany}&timeRange=all`);
    const data = await res.json();
    setStats(data);
    setLoadingStats(false);
  };

  const loadIssues = async () => {
    if (!selectedCompany) return;
    setLoadingIssues(true);
    try {
      const res = await fetch(`/api/issues?companyId=${selectedCompany}`);
      const data = await res.json();
      setIssues(data.issues || []);
      const qRes = await fetch(`/api/analytics?companyId=${selectedCompany}&timeRange=all`);
      const qData = await qRes.json();
      setUnansweredQuestions((qData.recentQuestions || []).filter((q: any) => !q.answer));
    } catch (error) { console.error("Failed to load issues:", error); }
    setLoadingIssues(false);
  };

  const loadWorkOrders = async () => {
    if (!selectedCompany) return;
    setLoadingWorkOrders(true);
    try {
      const res = await fetch(`/api/operations/work-orders?companyId=${selectedCompany}`);
      const data = await res.json();
      setWorkOrders(data.workOrders || []);
    } catch (error) { console.error("Failed to load work orders:", error); }
    setLoadingWorkOrders(false);
  };

  const loadOpsAnalytics = async (days: number) => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/ops-analytics?days=${days}`, { cache: "no-store" });
      if (res.ok) setOpsAnalytics(await res.json());
    } catch {}
    setLoadingAnalytics(false);
  };

  const updateIssue = async (issueId: string, updates: { status?: string; notes?: string; resolved_by?: string }) => {
    try {
      const res = await fetch("/api/issues", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, ...updates }),
      });
      if (res.ok) { loadIssues(); setSelectedIssue(null); }
    } catch (error) { console.error("Failed to update issue:", error); }
  };

  function exportAnalyticsCSV() {
    if (!opsAnalytics) return;
    const rows = [
      ["Metric", "Value"],
      ["Period (days)", String(analyticsDays)],
      ["Total Work Orders", String(opsAnalytics.workOrders.total)],
      ["Completed WOs", String(opsAnalytics.workOrders.completed)],
      ["WO Completion Rate (%)", String(opsAnalytics.workOrders.completionRate)],
      ["MTTR (hours)", String(opsAnalytics.workOrders.mttr)],
      ["Total Assets", String(opsAnalytics.assets.total)],
      ["Avg Health Score", String(opsAnalytics.assets.avgHealthScore)],
      ["MTBF (hours)", String(opsAnalytics.assets.mtbf)],
      ["PM Completions", String(opsAnalytics.pm.completions)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${analyticsDays}d-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (selectedCompany) {
      loadStats();
      loadIssues();
      loadWorkOrders();
    }
  }, [selectedCompany]);

  useEffect(() => {
    loadOpsAnalytics(analyticsDays);
  }, [analyticsDays]);

  const currentCompany = companies.find(c => c.id === selectedCompany);
  const companyWorkers = workers.filter(w => w.company_id === selectedCompany);
  const healthScore = stats
    ? Math.round((stats.answeredRate * 0.4) + (stats.avgConfidence * 0.4) + (Math.min(100, (stats.totalQuestions / 10) * 100) * 0.2))
    : 0;
  const openIssuesCount = issues.filter(i => i.status === "open").length;
  const openHighPriorityCount = issues.filter(i => i.status === "open" && i.severity === "high").length;
  const weekTrend = stats?.lastWeekCount
    ? Math.round(((stats.weekCount - stats.lastWeekCount) / Math.max(stats.lastWeekCount, 1)) * 100)
    : 0;

  const openWOs = workOrders.filter(wo => ["open", "assigned", "in_progress", "on_hold"].includes(wo.status));
  const criticalHighWOs = openWOs.filter(wo => wo.priority === "critical" || wo.priority === "high");
  const overdueWOs = openWOs.filter(wo => {
    const daysSince = (Date.now() - new Date(wo.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  });
  const recentWOs = [...workOrders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const filteredQuestions = (stats?.recentQuestions || []).filter(q => {
    const matchesSearch = questionSearch === "" ||
      q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
      (q.worker_name && q.worker_name.toLowerCase().includes(questionSearch.toLowerCase()));
    const matchesFilter = questionFilter === "all" ||
      (questionFilter === "answered" && q.confidence >= 50) ||
      (questionFilter === "unanswered" && q.confidence < 50);
    return matchesSearch && matchesFilter;
  });

  const maxHealth = opsAnalytics ? Math.max(...opsAnalytics.healthTrend.map(h => h.avgHealth), 1) : 100;

  return (
    <div className="min-h-screen">
      {/* Modals */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={updateIssue}
        companyName={currentCompany?.name}
      />
      <AllQuestionsModal
        open={showAllQuestions}
        onClose={() => setShowAllQuestions(false)}
        filteredQuestions={filteredQuestions}
        questionSearch={questionSearch}
        setQuestionSearch={setQuestionSearch}
        questionFilter={questionFilter}
        setQuestionFilter={setQuestionFilter}
      />
      <DraftModal modal={draftModal} onClose={() => setDraftModal(null)} />
      <UnansweredQuestionModal
        question={selectedUQ}
        onClose={() => setSelectedUQ(null)}
        answer={uqAnswer}
        setAnswer={setUqAnswer}
        onSend={() => { setSelectedUQ(null); setUqAnswer(""); }}
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {showDemoMode && (
          <div className="flex items-center justify-end gap-4">
            <DemoMode companyId={selectedCompany} />
          </div>
        )}

        {trialInfo?.plan === "trial" && (
          <UpgradeBanner companyId={selectedCompany} plan={trialInfo.plan} />
        )}

        {/* ── Plant Health Score ─────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 font-medium">Plant Health Score</div>
              <div className="flex items-end gap-2 mt-1">
                <div className={cn("text-4xl font-semibold", healthColor(healthScore))}>{healthScore}/100</div>
                <button
                  onClick={() => setShowHealthBreakdown(v => !v)}
                  className="mb-1 text-black/30 hover:text-black/60 transition"
                  title="Show breakdown"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              {showHealthBreakdown && stats && (
                <div className="mt-2 text-xs text-black/50 bg-black/[0.03] rounded-xl p-3 space-y-1 max-w-xs">
                  <div>Answer rate: <span className="font-medium text-black/70">{stats.answeredRate}%</span></div>
                  <div>Avg confidence: <span className="font-medium text-black/70">{stats.avgConfidence}%</span></div>
                  <div>Question volume: <span className="font-medium text-black/70">{stats.totalQuestions} total</span></div>
                </div>
              )}
            </div>
            <div className="text-sm text-black/50">
              {currentCompany?.name && <span className="font-medium text-black/70">{currentCompany.name}</span>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Questions Answered"
              value={stats?.totalQuestions || 0}
              icon={MessageSquare}
              subtext={`${stats?.answeredRate || 0}% answer rate`}
              change={weekTrend || undefined}
            />
            <MetricCard
              label="Active Workers"
              value={companyWorkers.length}
              icon={Users}
              accentColor="emerald"
              subtext={companyWorkers.filter(w => w.name).length + " verified"}
            />
            <MetricCard
              label="Open Issues"
              value={openIssuesCount}
              icon={AlertTriangle}
              iconClassName="h-5 w-5 text-gray-400"
              accentColor="amber"
              subtext={openHighPriorityCount > 0 ? `${openHighPriorityCount} high priority` : "No urgent issues"}
            />
            <MetricCard
              label="Avg Response Time"
              value={stats?.avgResponseTime ? `${stats.avgResponseTime}s` : "—"}
              icon={Clock}
              subtext="per question"
            />
          </div>
        </div>

        {/* ── Two-column: Recent Activity + Needs Attention ─────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
            <SectionHeader
              title="Recent Activity"
              subtitle="Latest work orders"
              action={<a href="/work-orders" className="text-xs text-[#C96442] hover:underline font-medium">View all →</a>}
            />
            <div className="mt-4 space-y-2">
              {loadingWorkOrders && <div className="text-sm text-black/40 py-4 text-center">Loading…</div>}
              {!loadingWorkOrders && recentWOs.length === 0 && (
                <EmptyState icon={ClipboardList} title="No work orders yet" description="Work orders will appear here once created." />
              )}
              {!loadingWorkOrders && recentWOs.map(wo => (
                <div key={wo.id} className="flex items-start justify-between gap-3 rounded-xl border border-black/5 p-3 hover:bg-[#F7F3EC] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#1C1A16] truncate">{wo.short_id} · {wo.title}</div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-black/40">{formatTimeAgo(wo.created_at)}</span>
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
            <SectionHeader title="Needs Attention" subtitle="Critical, high-priority, and overdue items" />
            <div className="mt-4 space-y-2">
              {criticalHighWOs.length === 0 && overdueWOs.length === 0 && (
                <div className="text-sm text-black/40 border border-dashed border-black/10 rounded-xl p-6 text-center">
                  Nothing urgent right now
                </div>
              )}
              {criticalHighWOs.slice(0, 5).map(wo => (
                <div key={wo.id} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <AlertTriangle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#1C1A16] truncate">{wo.short_id} · {wo.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} />
                      <span className="text-xs text-black/40">{formatTimeAgo(wo.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {overdueWOs.filter(wo => !criticalHighWOs.includes(wo)).slice(0, 3).map(wo => (
                <div key={wo.id} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#1C1A16] truncate">
                      {wo.short_id} · {wo.title} <span className="text-xs font-normal text-gray-500 ml-1">overdue</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} />
                      <span className="text-xs text-black/40">{formatTimeAgo(wo.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {issues.filter(i => i.status === "open" && i.severity === "high").slice(0, 3).map(i => (
                <div
                  key={i.id}
                  className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-3 cursor-pointer hover:border-orange-200 transition-colors"
                  onClick={() => setSelectedIssue(i)}
                >
                  <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#1C1A16] truncate">{i.description}</div>
                    <div className="mt-1 text-xs text-black/40">{i.worker_name || "Worker"} · {formatTimeAgo(i.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Questions ──────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
          <SectionHeader
            title="Recent Questions"
            subtitle="What workers are asking and reporting"
            action={
              <button onClick={() => setShowAllQuestions(true)} className="text-xs text-[#C96442] hover:underline font-medium">
                View all →
              </button>
            }
          />
          <div className="mt-4 divide-y divide-[rgba(28,26,22,0.04)]">
            {loadingStats && <div className="text-sm text-black/40 py-6 text-center">Loading…</div>}
            {!loadingStats && (stats?.recentQuestions || []).length === 0 && (
              <EmptyState icon={MessageSquare} title="No questions yet" description="Worker questions will appear here as they come in." />
            )}
            {!loadingStats && (stats?.recentQuestions || []).slice(0, 10).map((q, i) => {
              const answered = q.confidence >= 50;
              return (
                <div
                  key={q.id || i}
                  className="py-3 flex items-start gap-3 hover:bg-[#F7F3EC] -mx-6 px-6 transition-colors cursor-pointer"
                  onClick={() => { if (!answered) { setSelectedUQ(q); setUqAnswer(""); } }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${answered ? "bg-green-100" : "bg-amber-100"}`}>
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1A16] line-clamp-2">{q.question}</p>
                    <p className="text-xs text-black/40 mt-0.5">{q.worker_name || "Worker"} · {formatTimeAgo(q.created_at)}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${answered ? "bg-green-100 text-gray-700" : "bg-amber-100 text-gray-700"}`}>
                    {answered ? "Answered" : "Needs answer"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Analytics Metrics (from /api/ops-analytics) ───────────────────── */}
        <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <SectionHeader
              title="Performance Analytics"
              subtitle="Operational metrics and asset health trends"
            />
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                value={analyticsDays}
                onChange={e => setAnalyticsDays(Number(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button variant="outline" onClick={exportAnalyticsCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>

          {loadingAnalytics ? (
            <div className="text-gray-400 py-8 text-center text-sm">Loading analytics…</div>
          ) : !opsAnalytics ? (
            <div className="text-gray-400 py-8 text-center text-sm">Failed to load analytics.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">MTTR</span>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{opsAnalytics.workOrders.mttr}h</p>
                  <p className="text-xs text-gray-400 mt-2">Mean time to resolve</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">MTBF</span>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{opsAnalytics.assets.mtbf}h</p>
                  <p className="text-xs text-gray-400 mt-2">Mean time between failures</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">WO Completion</span>
                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{opsAnalytics.workOrders.completionRate}%</p>
                  <p className="text-xs text-gray-400 mt-2">{opsAnalytics.workOrders.completed} / {opsAnalytics.workOrders.total} orders</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Avg Asset Health</span>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{opsAnalytics.assets.avgHealthScore}</p>
                  <p className="text-xs text-gray-400 mt-2">{opsAnalytics.assets.total} assets tracked</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Work Orders by Priority</h2>
                  <div className="space-y-3">
                    {Object.entries(opsAnalytics.workOrders.byPriority).map(([p, count]) => (
                      <div key={p} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 capitalize">{p}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#C96442]"
                            style={{ width: `${Math.min((count / Math.max(opsAnalytics.workOrders.total, 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    ))}
                    {Object.keys(opsAnalytics.workOrders.byPriority).length === 0 && (
                      <p className="text-sm text-gray-400">No work orders in this period.</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Asset Status</h2>
                  <div className="space-y-3">
                    {Object.entries(opsAnalytics.assets.byStatus).map(([status, count]) => {
                      const color = status === "operational" ? "bg-green-300"
                        : status === "degraded" ? "bg-amber-300"
                        : status === "down" ? "bg-red-300" : "bg-gray-300";
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 capitalize">{status}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min((count / Math.max(opsAnalytics.assets.total, 1)) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">PM Completions (period): <span className="font-semibold text-gray-800">{opsAnalytics.pm.completions}</span></p>
                  </div>
                </div>
              </div>

              {opsAnalytics.healthTrend.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Asset Health Trend (avg by week)</h2>
                  <div className="flex items-end gap-2 h-32">
                    {opsAnalytics.healthTrend.map((point) => (
                      <div key={point.week} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-400">{Math.round(point.avgHealth)}</span>
                        <div
                          className="w-full rounded-t bg-[#C96442] opacity-80 transition-all"
                          style={{ height: `${(point.avgHealth / maxHealth) * 100}px`, minHeight: "4px" }}
                        />
                        <span className="text-[9px] text-gray-400 truncate w-full text-center">{point.week.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
