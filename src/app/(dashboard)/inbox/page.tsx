"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, AlertTriangle, ShieldAlert, ArrowRight, Clock3, Bot, Users, Wrench } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { IssueDetailModal } from "@/components/dashboard/modals";
import { formatTimeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  question: string;
  answer?: string;
  worker_name?: string;
  worker_phone?: string;
  confidence: number;
  created_at: string;
  topic?: string;
};

type Issue = {
  company_id: string;
  worker_phone: string;
  id: string;
  description: string;
  equipment?: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  worker_name?: string;
  created_at: string;
};

type WorkOrder = {
  id: string;
  short_id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to?: string | null;
  created_at: string;
};

type InboxView = "all" | "needs_manager" | "questions" | "issues" | "work_orders" | "blocked" | "critical" | "overdue" | "unassigned";

type InboxItem = {
  id: string;
  sourceId: string;
  kind: "issue" | "question" | "work_order";
  title: string;
  detail: string;
  workerLabel: string;
  createdAt: string;
  needsManager: boolean;
  priority?: string;
  status?: string;
  isBlocked?: boolean;
  isCritical?: boolean;
  isOverdue?: boolean;
  isUnassigned?: boolean;
};

export default function InboxPage() {
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<InboxView>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [managerAnswer, setManagerAnswer] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);

  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    const validViews: InboxView[] = ["all", "needs_manager", "questions", "issues", "work_orders", "blocked", "critical", "overdue", "unassigned"];
    if (requestedView && validViews.includes(requestedView as InboxView)) {
      setView(requestedView as InboxView);
    } else {
      setView("all");
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        if (!ignore && data?.authenticated && data?.companyId) {
          setCompanyId(data.companyId);
          setCompanyName(data.company?.name || "");
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    }
    loadSession();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!companyId) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const [analyticsRes, issuesRes, workOrdersRes] = await Promise.all([
          fetch(`/api/analytics?companyId=${companyId}&timeRange=all`, { cache: "no-store" }),
          fetch(`/api/issues?companyId=${companyId}`, { cache: "no-store" }),
          fetch(`/api/operations/work-orders?companyId=${companyId}`, { cache: "no-store" }),
        ]);

        const [analytics, issuesJson, workOrdersJson] = await Promise.all([
          analyticsRes.json(),
          issuesRes.json(),
          workOrdersRes.json(),
        ]);

        if (!ignore) {
          setQuestions(analytics.recentQuestions || []);
          setIssues(issuesJson.issues || []);
          setWorkOrders(workOrdersJson.workOrders || []);
        }
      } catch (error) {
        console.error("Failed to load inbox:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [companyId]);

  const items = useMemo<InboxItem[]>(() => {
    const questionItems = questions.map((q) => ({
      id: `q-${q.id}`,
      sourceId: q.id,
      kind: "question" as const,
      title: q.question,
      detail: q.answer ? "Answered from knowledge" : "Needs a manager answer or better knowledge",
      workerLabel: q.worker_name || q.worker_phone || "Worker",
      createdAt: q.created_at,
      needsManager: !q.answer || q.confidence < 50,
      status: q.answer && q.confidence >= 50 ? "resolved" : "open",
    }));

    const issueItems = issues.map((issue) => ({
      id: `i-${issue.id}`,
      sourceId: issue.id,
      kind: "issue" as const,
      title: issue.description,
      detail: issue.equipment ? `Reported on ${issue.equipment}` : "Field issue reported from the floor",
      workerLabel: issue.worker_name || "Worker",
      createdAt: issue.created_at,
      needsManager: issue.status === "open",
      priority: issue.severity,
      status: issue.status,
    }));

    const workOrderItems = workOrders.slice(0, 12).map((wo) => ({
      id: `wo-${wo.id}`,
      sourceId: wo.id,
      kind: "work_order" as const,
      title: `${wo.short_id} · ${wo.title}`,
      detail: wo.assigned_to ? `Assigned to ${wo.assigned_to}` : "Waiting for assignment",
      workerLabel: wo.assigned_to || "Unassigned",
      createdAt: wo.created_at,
      needsManager: !wo.assigned_to || ["open", "on_hold"].includes(wo.status),
      priority: wo.priority,
      status: wo.status,
      isBlocked: wo.status === "on_hold",
      isCritical: ["critical", "high"].includes(wo.priority),
      isOverdue: ["open", "assigned", "in_progress", "on_hold"].includes(wo.status) && ((Date.now() - new Date(wo.created_at).getTime()) / (1000 * 60 * 60 * 24) > 7),
      isUnassigned: !wo.assigned_to,
    }));

    return [...questionItems, ...issueItems, ...workOrderItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [issues, questions, workOrders]);

  const filteredItems = items.filter((item) => {
    switch (view) {
      case "needs_manager":
        return item.needsManager;
      case "questions":
        return item.kind === "question";
      case "issues":
        return item.kind === "issue";
      case "work_orders":
        return item.kind === "work_order";
      case "blocked":
        return item.kind === "work_order" && item.isBlocked;
      case "critical":
        return item.kind === "work_order" && item.isCritical;
      case "overdue":
        return item.kind === "work_order" && item.isOverdue;
      case "unassigned":
        return item.kind === "work_order" && item.isUnassigned;
      default:
        return true;
    }
  });

  const counts = {
    needsManager: items.filter((item) => item.needsManager).length,
    issues: items.filter((item) => item.kind === "issue").length,
    questions: items.filter((item) => item.kind === "question").length,
    workOrders: items.filter((item) => item.kind === "work_order").length,
    blocked: items.filter((item) => item.kind === "work_order" && item.isBlocked).length,
    critical: items.filter((item) => item.kind === "work_order" && item.isCritical).length,
    overdue: items.filter((item) => item.kind === "work_order" && item.isOverdue).length,
    unassigned: items.filter((item) => item.kind === "work_order" && item.isUnassigned).length,
  };

  const currentViewLabel: Record<InboxView, string> = {
    all: "All live activity",
    needs_manager: "Needs manager",
    questions: "Questions",
    issues: "Open field issues",
    work_orders: "Work orders",
    blocked: "Blocked work orders",
    critical: "Critical work orders",
    overdue: "Overdue work orders",
    unassigned: "Unassigned work orders",
  };

  const updateIssue = async (issueId: string, updates: { status?: string; notes?: string; resolved_by?: string }) => {
    try {
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update issue");
      setIssues((prev) => prev.map((issue) => issue.id === issueId ? { ...issue, ...updates, status: (updates.status as Issue["status"]) || issue.status } : issue));
      setSelectedIssue(null);
    } catch (error) {
      console.error("Failed to update issue:", error);
    }
  };

  const handleTeachSidekick = async () => {
    if (!selectedQuestion || !managerAnswer.trim() || !companyId) return;
    try {
      setSavingAnswer(true);
      const res = await fetch("/api/sms/learn-from-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          original_question: selectedQuestion.question,
          manager_answer: managerAnswer.trim(),
          worker_phone: selectedQuestion.worker_phone,
          source_conversation_id: selectedQuestion.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to save answer");
      setQuestions((prev) => prev.map((question) => question.id === selectedQuestion.id ? { ...question, answer: managerAnswer.trim(), confidence: 100 } : question));
      setSelectedQuestion(null);
      setManagerAnswer("");
    } catch (error) {
      console.error("Failed to teach Sidekick:", error);
    } finally {
      setSavingAnswer(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={updateIssue}
        companyName={companyName}
      />

      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedQuestion(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-black/5 px-6 py-4">
              <div className="text-sm font-semibold text-[#1C1A16]">Save answer</div>
              <div className="mt-1 text-sm text-black/45">Save the manager answer so this question is handled better next time.</div>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-black/35">Worker question</div>
                <p className="mt-2 text-sm text-[#1C1A16]">{selectedQuestion.question}</p>
                <p className="mt-1 text-xs text-black/40">{selectedQuestion.worker_name || selectedQuestion.worker_phone || "Worker"} · {formatTimeAgo(selectedQuestion.created_at)}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-black/35">Manager answer</div>
                <textarea
                  value={managerAnswer}
                  onChange={(e) => setManagerAnswer(e.target.value)}
                  placeholder="Write the answer Sidekick should learn from..."
                  className="mt-2 min-h-[140px] w-full rounded-xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[#C96442]/40"
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
              <div className="text-xs text-black/40">This saves the answer into Sidekick's knowledge for future questions.</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedQuestion(null)} className="rounded-lg px-4 py-2 text-sm text-black/55 hover:bg-black/[0.04]">Cancel</button>
                <button onClick={handleTeachSidekick} disabled={savingAnswer || !managerAnswer.trim()} className="rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {savingAnswer ? "Saving…" : "Save answer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHeader
        title="Inbox"
        subtitle="The one place managers should review questions, field issues, and work that still needs a decision"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <MessageSquare className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1C1A16]">{items.length}</div>
              <div className="text-sm text-black/45">Recent inbox items</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <ShieldAlert className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1C1A16]">{counts.needsManager}</div>
              <div className="text-sm text-black/45">Need manager input</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <Bot className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1C1A16]">{counts.questions}</div>
              <div className="text-sm text-black/45">Questions needing answers or better knowledge</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All", count: items.length },
          { id: "needs_manager", label: "Needs manager", count: counts.needsManager },
          { id: "questions", label: "Questions", count: counts.questions },
          { id: "issues", label: "Issues", count: counts.issues },
          { id: "work_orders", label: "Work orders", count: counts.workOrders },
        ].map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as InboxView)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-[#C96442]/20 bg-[#C96442]/10 text-[#1C1A16]"
                  : "border-black/10 bg-white text-black/55 hover:bg-black/[0.03]"
              )}
            >
              {tab.label} <span className="ml-1 text-black/40">{tab.count}</span>
            </button>
          );
        })}
      </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "blocked", label: "Blocked", count: counts.blocked },
            { id: "critical", label: "Critical", count: counts.critical },
            { id: "overdue", label: "Overdue", count: counts.overdue },
            { id: "unassigned", label: "Unassigned", count: counts.unassigned },
          ].filter((tab) => tab.count > 0 || view === tab.id).map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as InboxView)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-[#C96442]/20 bg-[#C96442]/10 text-[#1C1A16]"
                    : "border-black/10 bg-white text-black/55 hover:bg-black/[0.03]"
                )}
              >
                {tab.label} <span className="ml-1 text-black/40">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white">
        <div className="border-b border-black/[0.05] px-5 py-3 text-sm text-black/50">
          Showing <span className="font-medium text-[#1C1A16]">{currentViewLabel[view]}</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm text-black/40">Loading inbox…</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-black/20" />
            <p className="mt-3 text-sm font-medium text-black/60">No inbox items yet</p>
            <p className="mt-1 text-sm text-black/40">Worker texts, field issues, and knowledge questions will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05]">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-5 transition-colors hover:bg-[#FBF7F1]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black/55">
                        {item.kind === "work_order" ? "work order" : item.kind}
                      </span>
                      {item.priority && <PriorityBadge priority={item.priority} />}
                      {item.status && <StatusBadge status={item.status} />}
                      {item.needsManager && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                          Needs manager
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#1C1A16]">{item.title}</div>
                    <div className="mt-1 text-sm text-black/55">{item.detail}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-black/40">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {item.workerLabel}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatTimeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                  {item.kind === "work_order" ? (
                    <Link
                      href={`/work-orders/${item.sourceId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#1C1A16] hover:bg-black/[0.03]"
                    >
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : item.kind === "issue" ? (
                    <button
                      onClick={() => setSelectedIssue(issues.find((issue) => issue.id === item.sourceId) || null)}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#1C1A16] hover:bg-black/[0.03]"
                    >
                      Review <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const question = questions.find((entry) => entry.id === item.sourceId) || null;
                        setSelectedQuestion(question);
                        setManagerAnswer(question?.answer || "");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#1C1A16] hover:bg-black/[0.03]"
                    >
                      Teach <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
