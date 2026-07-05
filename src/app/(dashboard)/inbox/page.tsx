"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, AlertTriangle, ShieldAlert, ArrowRight, Clock3, Bot, Users } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
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
};

type Issue = {
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

type InboxItem = {
  id: string;
  kind: "issue" | "question" | "work_order";
  title: string;
  detail: string;
  workerLabel: string;
  createdAt: string;
  needsManager: boolean;
  priority?: string;
  status?: string;
};

export default function InboxPage() {
  const [companyId, setCompanyId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "needs_manager" | "issues" | "questions">("all");

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (auth.companyId) setCompanyId(auth.companyId);
    } catch {}
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
      kind: "work_order" as const,
      title: `${wo.short_id} · ${wo.title}`,
      detail: wo.assigned_to ? `Assigned to ${wo.assigned_to}` : "Waiting for assignment",
      workerLabel: wo.assigned_to || "Unassigned",
      createdAt: wo.created_at,
      needsManager: !wo.assigned_to || ["open", "on_hold"].includes(wo.status),
      priority: wo.priority,
      status: wo.status,
    }));

    return [...questionItems, ...issueItems, ...workOrderItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [issues, questions, workOrders]);

  const filteredItems = items.filter((item) => {
    if (filter === "needs_manager") return item.needsManager;
    if (filter === "issues") return item.kind === "issue" || item.kind === "work_order";
    if (filter === "questions") return item.kind === "question";
    return true;
  });

  const counts = {
    needsManager: items.filter((item) => item.needsManager).length,
    issues: items.filter((item) => item.kind === "issue" || item.kind === "work_order").length,
    questions: items.filter((item) => item.kind === "question").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <SectionHeader
        title="Inbox"
        subtitle="Every text Sidekick is handling — issues, questions, and work that needs manager eyes"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <MessageSquare className="h-5 w-5 text-[#C96442]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1C1A16]">{items.length}</div>
              <div className="text-sm text-black/45">Recent inbox items</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">
              <ShieldAlert className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1C1A16]">{counts.needsManager}</div>
              <div className="text-sm text-black/55">Need manager input</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <Bot className="h-5 w-5 text-[#C96442]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1C1A16]">{counts.questions}</div>
              <div className="text-sm text-black/45">Knowledge requests handled here</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All", count: items.length },
          { id: "needs_manager", label: "Needs manager", count: counts.needsManager },
          { id: "issues", label: "Issues & work", count: counts.issues },
          { id: "questions", label: "Questions", count: counts.questions },
        ].map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-[#C96442]/20 bg-[#C96442]/10 text-[#C96442]"
                  : "border-black/10 bg-white text-black/55 hover:bg-black/[0.03]"
              )}
            >
              {tab.label} <span className="ml-1 text-black/40">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white">
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
                  <a
                    href={item.kind === "work_order" ? `/work-orders/${item.id.replace("wo-", "")}` : item.kind === "question" ? "/today" : "/work-orders"}
                    className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#1C1A16] hover:bg-black/[0.03]"
                  >
                    Open <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#C96442]/15 bg-gradient-to-r from-orange-50/60 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#1C1A16]">What Inbox becomes</div>
            <p className="mt-1 max-w-3xl text-sm text-black/55">
              This is the live operating inbox for Sidekick: worker texts, AI replies, work-order creation, and anything that still needs a manager decision.
            </p>
          </div>
          <a href="/knowledge" className="text-sm font-medium text-[#C96442] hover:underline">Open Knowledge Sources →</a>
        </div>
      </div>
    </div>
  );
}
