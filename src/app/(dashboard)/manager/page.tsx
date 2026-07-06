"use client";

import { formatTimeAgo } from "@/lib/format";
import React, { useState, useEffect } from "react";
import {
  MessageSquare, AlertTriangle, Users, Clock, Info,
  AlertCircle, CheckCircle2, ClipboardList, TrendingUp,
  Download, BarChart3, Wrench, ArrowRight,
  ShieldAlert, CalendarClock,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import DemoMode from "@/components/dashboard/DemoMode";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";
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
  ai_triage?: Record<string, unknown> | null;
}
interface Company {
  id: string; name: string; access_code?: string;
}
interface Worker {
  phone: string; company_id: string; name?: string;
}

export default function ManagerDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [trialInfo, setTrialInfo] = useState<{ plan: string; questionsUsed: number; questionsLimit: number; trialEndsAt: string } | null>(null);
  const [showDemoMode, setShowDemoMode] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);

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
    // First get the session's company (source of truth), then load companies list
    Promise.all([
      fetch("/api/auth/session", { cache: "no-store" }).then(r => r.ok ? r.json() : null),
      fetch("/api/companies").then(r => r.json()),
    ]).then(([session, d]) => {
      const allCompanies = d.companies || [];
      setCompanies(allCompanies);

      // Use session company as source of truth
      const sessionCompanyId = session?.companyId;
      const savedAuth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      
      if (sessionCompanyId && allCompanies.some((c: any) => c.id === sessionCompanyId)) {
        setSelectedCompany(sessionCompanyId);
        savedAuth.companyId = sessionCompanyId;
      } else if (savedAuth.companyId && allCompanies.some((c: any) => c.id === savedAuth.companyId)) {
        setSelectedCompany(savedAuth.companyId);
      } else if (allCompanies.length > 0) {
        setSelectedCompany(allCompanies[0].id);
        savedAuth.companyId = allCompanies[0].id;
      }

      try { localStorage.setItem("sidekick_auth", JSON.stringify(savedAuth)); } catch {}
      setSelectedLocationId(session?.selectedLocationId || savedAuth.locationId || "all");
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
        if ((authData.locationId || "all") !== selectedLocationId) {
          setSelectedLocationId(authData.locationId || "all");
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [selectedCompany, selectedLocationId]);

  const scopedQuery = (path: string) => {
    const params = new URLSearchParams();
    params.set("companyId", selectedCompany);
    if (selectedLocationId && selectedLocationId !== "all") params.set("locationId", selectedLocationId);
    return `${path}?${params.toString()}`;
  };

  const loadStats = async () => {
    if (!selectedCompany) return;
    setLoadingStats(true);
    const analyticsUrl = scopedQuery("/api/analytics") + "&timeRange=all";
    const res = await fetch(analyticsUrl);
    const data = await res.json();
    setStats(data);
    setLoadingStats(false);
  };

  const loadIssues = async () => {
    if (!selectedCompany) return;
    setLoadingIssues(true);
    try {
      const res = await fetch(scopedQuery("/api/issues"));
      const data = await res.json();
      setIssues(data.issues || []);
      const qRes = await fetch(scopedQuery("/api/analytics") + "&timeRange=all");
      const qData = await qRes.json();
      setUnansweredQuestions((qData.recentQuestions || []).filter((q: any) => !q.answer));
    } catch (error) { console.error("Failed to load issues:", error); }
    setLoadingIssues(false);
  };

  const loadWorkOrders = async () => {
    if (!selectedCompany) return;
    setLoadingWorkOrders(true);
    try {
      const res = await fetch(scopedQuery("/api/operations/work-orders"));
      const data = await res.json();
      setWorkOrders(data.workOrders || []);
    } catch (error) { console.error("Failed to load work orders:", error); }
    setLoadingWorkOrders(false);
  };

  useEffect(() => {
    if (selectedCompany) {
      loadStats();
      loadIssues();
      loadWorkOrders();
    }
  }, [selectedCompany, selectedLocationId]);

  const currentCompany = companies.find(c => c.id === selectedCompany);
  const companyWorkers = workers.filter(w => w.company_id === selectedCompany);
  const openIssuesCount = issues.filter(i => i.status === "open").length;
  const openHighPriorityCount = issues.filter(i => i.status === "open" && i.severity === "high").length;

  const openWOs = workOrders.filter(wo => ["open", "assigned", "in_progress", "on_hold"].includes(wo.status));
  const criticalHighWOs = openWOs.filter(wo => wo.priority === "critical" || wo.priority === "high");
  const blockedWOs = openWOs.filter(wo => wo.status === "on_hold");
  const unassignedWOs = openWOs.filter(wo => !wo.assigned_to);
  const overdueWOs = openWOs.filter(wo => {
    const daysSince = (Date.now() - new Date(wo.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  });
  const recentWOs = [...workOrders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const unansweredCount = unansweredQuestions.length;
  const inboxQueues = [
    {
      label: "Needs manager",
      count: unansweredCount + openIssuesCount + unassignedWOs.length + blockedWOs.length,
      href: "/inbox?view=needs_manager",
      tone: "bg-amber-50 text-[#1C1A16] border-amber-100",
    },
    {
      label: "Questions",
      count: unansweredCount,
      href: "/inbox?view=questions",
      tone: "bg-[#F7F3EC] text-[#1C1A16] border-[#E8D6CC]",
    },
    {
      label: "Open issues",
      count: openIssuesCount,
      href: "/inbox?view=issues",
      tone: "bg-red-50 text-[#1C1A16] border-red-100",
    },
    {
      label: "Unassigned work orders",
      count: unassignedWOs.length,
      href: "/inbox?view=unassigned",
      tone: "bg-orange-50 text-[#1C1A16] border-orange-100",
    },
    {
      label: "Blocked work orders",
      count: blockedWOs.length,
      href: "/inbox?view=blocked",
      tone: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      label: "Critical work orders",
      count: criticalHighWOs.length,
      href: "/inbox?view=critical",
      tone: "bg-red-50 text-[#1C1A16] border-red-100",
    },
  ].filter((queue) => queue.count > 0);

  // Build the "attention items" list for the job-based view
  const attentionItems: { type: string; priority: number; label: string; detail: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string; count: number; href?: string }[] = [];

  if (blockedWOs.length > 0) {
    attentionItems.push({
      type: "blocked", priority: 1, label: "Blocked work orders",
      detail: `${blockedWOs.length} on hold — may need parts, approval, or reassignment`,
      icon: ShieldAlert, color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200",
      count: blockedWOs.length, href: "/inbox?view=blocked",
    });
  }
  if (criticalHighWOs.length > 0) {
    attentionItems.push({
      type: "critical", priority: 2, label: "Critical / high-priority work orders",
      detail: `${criticalHighWOs.length} open — review and assign if needed`,
      icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50/60", borderColor: "border-red-100",
      count: criticalHighWOs.length, href: "/inbox?view=critical",
    });
  }
  if (overdueWOs.length > 0) {
    attentionItems.push({
      type: "overdue", priority: 3, label: "Overdue work orders",
      detail: `${overdueWOs.length} open for 7+ days — check status or escalate`,
      icon: CalendarClock, color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200",
      count: overdueWOs.length, href: "/inbox?view=overdue",
    });
  }
  if (unassignedWOs.length > 0) {
    attentionItems.push({
      type: "unassigned", priority: 4, label: "Unassigned work orders",
      detail: `${unassignedWOs.length} work order${unassignedWOs.length > 1 ? "s" : ""} still need an owner`,
      icon: ClipboardList, color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200",
      count: unassignedWOs.length, href: "/inbox?view=unassigned",
    });
  }
  if (unansweredCount > 0) {
    attentionItems.push({
      type: "unanswered", priority: 5, label: "Unanswered worker questions",
      detail: `${unansweredCount} question${unansweredCount > 1 ? "s" : ""} waiting for your input`,
      icon: MessageSquare, color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200",
      count: unansweredCount, href: "/inbox?view=questions",
    });
  }
  if (openHighPriorityCount > 0) {
    attentionItems.push({
      type: "issues", priority: 6, label: "Open field issues",
      detail: `${openHighPriorityCount} high-severity issue${openHighPriorityCount > 1 ? "s" : ""} reported by workers`,
      icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-50/60", borderColor: "border-orange-100",
      count: openHighPriorityCount, href: "/inbox?view=issues",
    });
  }

  attentionItems.sort((a, b) => a.priority - b.priority);

  const totalAttentionCount = attentionItems.reduce((s, i) => s + i.count, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {showDemoMode && (
          <div className="flex items-center justify-end gap-4">
            <DemoMode companyId={selectedCompany} />
          </div>
        )}



        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1C1A16]">Today</h1>
          <p className="text-sm text-black/45 mt-1">
            What needs your attention right now
            {currentCompany?.name && <span className="text-black/60 font-medium"> · {currentCompany.name}</span>}
          </p>
        </div>

        {/* ══ 1. NEEDS ATTENTION — primary section ═══════════════════════════ */}
        <div className="rounded-2xl border border-[rgba(28,26,22,0.06)] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-[#1C1A16]">Needs Attention</h2>
              {totalAttentionCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-100 text-gray-700 text-xs font-bold">
                  {totalAttentionCount}
                </span>
              )}
            </div>
          </div>

          {attentionItems.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 p-5">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-800">All clear</div>
                <div className="text-xs text-gray-600 mt-0.5">No blocked work, overdue items, or unanswered questions right now.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {attentionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                      item.bgColor, item.borderColor,
                      item.href && "cursor-pointer hover:shadow-sm"
                    )}
                    onClick={() => item.href && (window.location.href = item.href)}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", item.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1C1A16]">{item.label}</span>
                        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full", item.bgColor, "text-gray-700")}>
                          {item.count}
                        </span>
                      </div>
                      <div className="text-xs text-black/50 mt-0.5">{item.detail}</div>
                    </div>
                    {item.href && <ArrowRight className="h-4 w-4 text-black/25 flex-shrink-0 mt-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ 2. STATUS STRIP — compact key metrics ══════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Open Work Orders"
            value={openWOs.length}
            icon={ClipboardList}
            accentColor={criticalHighWOs.length > 0 ? "red" : "amber"}
            subtext={criticalHighWOs.length > 0 ? `${criticalHighWOs.length} critical/high` : "None critical"}
          />
          <MetricCard
            label="Field Questions"
            value={stats?.totalQuestions || 0}
            icon={MessageSquare}
            subtext={`${stats?.answeredRate || 0}% resolved`}
          />
          <MetricCard
            label="Active Workers"
            value={companyWorkers.length}
            icon={Users}
            accentColor="emerald"
            subtext={`${companyWorkers.filter(w => w.name).length} verified`}
          />
          <MetricCard
            label="Open Issues"
            value={openIssuesCount}
            icon={AlertTriangle}
            accentColor={openHighPriorityCount > 0 ? "red" : "amber"}
            subtext={openHighPriorityCount > 0 ? `${openHighPriorityCount} high severity` : "None urgent"}
          />
        </div>

        {/* ══ 3. TWO-COLUMN: Recent Work Orders + Inbox Queues ═══════════════ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Work Orders */}
          <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
            <SectionHeader
              title="Recent Work Orders"
              subtitle="Latest maintenance and task activity"
              action={<a href="/work-orders" className="text-xs text-[#C96442] hover:underline font-medium">View all →</a>}
            />
            <div className="mt-2 space-y-2">
              {loadingWorkOrders && <div className="text-sm text-black/40 py-4 text-center">Loading…</div>}
              {!loadingWorkOrders && recentWOs.length === 0 && (
                <EmptyState
                  icon={ClipboardList}
                  title="No work orders yet"
                  description="Create your first work order, or have workers report issues via text to generate them automatically."
                  actionLabel="Create Work Order"
                  onAction={() => window.location.href = "/work-orders"}
                />
              )}
              {!loadingWorkOrders && recentWOs.map(wo => {
                return (
                  <a
                    key={wo.id}
                    href={`/work-orders/${wo.id}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-black/5 p-3 hover:bg-[#F7F3EC] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#1C1A16] truncate">{wo.short_id} · {wo.title}</div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-black/40">{formatTimeAgo(wo.created_at)}</span>
                        <PriorityBadge priority={wo.priority} />
                        <StatusBadge status={wo.status} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Inbox queues */}
          <div className="rounded-2xl bg-white border border-[rgba(28,26,22,0.06)] p-6">
            <SectionHeader title="Inbox Queues" subtitle="Use Inbox to work through questions, issues, and work that still needs a decision" action={<a href="/inbox" className="text-xs text-[#C96442] hover:underline font-medium">Open inbox →</a>} />
            <div className="mt-2 space-y-2">
              {inboxQueues.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Inbox is clear"
                  description="As workers text Sidekick, queues that need manager attention will stack up here."
                />
              ) : (
                inboxQueues.map((queue) => (
                  <a
                    key={queue.label}
                    href={queue.href}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-[#F7F3EC]",
                      queue.tone
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#1C1A16]">{queue.label}</div>
                      <div className="mt-1 text-xs text-black/45">Open this queue in Inbox and work through the items from there.</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-black/65">{queue.count}</span>
                      <ArrowRight className="h-4 w-4 text-black/25" />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
