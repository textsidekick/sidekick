"use client";
import { formatTimeAgo } from "@/lib/format";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
} from "lucide-react";

import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from "@/types/operations";
import { SkeletonTable } from "@/components/dashboard/shared/Skeleton";

function WORelatedKnowledge({ workOrderId, assetId }: { workOrderId: string; assetId: string | null }) {
  const [articles, setArticles] = useState<{ id: string; title: string; source_work_order_id?: string }[]>([]);
  useEffect(() => {
    fetch("/api/knowledge")
      .then(r => r.json())
      .then(d => {
        const all = d.articles || [];
        const related = all.filter((a: any) => a.source_work_order_id === workOrderId).slice(0, 5);
        setArticles(related);
      })
      .catch(() => {});
  }, [workOrderId]);
  if (articles.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-black/5 bg-white p-4">
      <div className="text-sm font-medium flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-[#C96442]" /> Generated Knowledge</div>
      <div className="mt-2 space-y-1.5">
        {articles.map(a => (
          <a key={a.id} href="/knowledge" className="block text-sm text-[#C96442] hover:underline truncate">{a.title}</a>
        ))}
      </div>
    </div>
  );
}

type OpsResponse = {
  companyId: string;
  workOrders: {
    countsByStatus: Record<string, number>;
    countsByPriority: Record<string, number>;
    completedTodayCount: number;
    mttrMinutesThisWeek: number;
    overdueCount: number;
  };
  assets: {
    avgHealthScore: number;
  };
};

type Technician = { id: string; name: string | null; phone?: string; role?: string };


function timeOpenMinutes(wo: WorkOrder): number {
  const start = new Date(wo.created_at).getTime();
  const end = wo.status === "completed" && wo.completed_at
    ? new Date(wo.completed_at).getTime()
    : Date.now();
  return Math.max(0, Math.floor((end - start) / 60_000));
}

type AITriage = {
  priority?: string;
  reason?: string;
  suspected_cause?: string;
  suggested_parts?: string[];
  confidence?: number;
  [key: string]: unknown;
};

function AITriageCard({ triage }: { triage: AITriage | null | undefined }) {
  if (!triage || Object.keys(triage).length === 0) return <div className="text-sm text-black/50">No AI triage data.</div>;
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 space-y-2 text-sm">
      {triage.priority && (
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-black/40 w-28">Priority</span>
          <PriorityBadge priority={triage.priority} />
          {triage.reason && <span className="text-black/60 text-xs">— {triage.reason}</span>}
        </div>
      )}
      {triage.suspected_cause && (
        <div className="flex items-start gap-2">
          <span className="text-xs uppercase tracking-wide text-black/40 w-28 shrink-0">Suspected cause</span>
          <span className="text-black/70">{triage.suspected_cause}</span>
        </div>
      )}
      {triage.suggested_parts && triage.suggested_parts.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-xs uppercase tracking-wide text-black/40 w-28 shrink-0">Suggested parts</span>
          <div className="flex flex-wrap gap-1">
            {triage.suggested_parts.map((p) => (
              <span key={p} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{p}</span>
            ))}
          </div>
        </div>
      )}
      {triage.confidence !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-black/40 w-28">Confidence</span>
          <span className="text-black/60">{Math.round(Number(triage.confidence) * 100)}%</span>
        </div>
      )}
    </div>
  );
}

export default function WorkOrdersPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [stats, setStats] = useState<OpsResponse | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assetsById, setAssetsById] = useState<Record<string, { name: string }>>({});
  const [techs, setTechs] = useState<Technician[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [techFilter, setTechFilter] = useState<string | "all">("all");

  const [sortKey, setSortKey] = useState<"priority" | "status" | "created_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [activeWO, setActiveWO] = useState<WorkOrder | null>(null);
  const [actionAssignTo, setActionAssignTo] = useState<string | "unassigned">("unassigned");
  const [actionPriority, setActionPriority] = useState<WorkOrderPriority>("medium");
  const [actionStatus, setActionStatus] = useState<WorkOrderStatus>("open");
  const [actionNote, setActionNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadSession() {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) throw new Error("Not authenticated");
      const json = await res.json();
      return json.companyId as string;
    }

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const cid = await loadSession();
        if (!ignore) setCompanyId(cid);

        const [statsRes, woRes, assetRes, teamRes] = await Promise.all([
          fetch("/api/dashboard/operations", { cache: "no-store" }),
          fetch(`/api/operations/work-orders?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
          fetch(`/api/operations/assets?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
          fetch("/api/team", { cache: "no-store" }),
        ]);

        if (!statsRes.ok) throw new Error(`Stats failed (${statsRes.status})`);
        if (!woRes.ok) throw new Error(`Work orders failed (${woRes.status})`);
        if (!assetRes.ok) throw new Error(`Assets failed (${assetRes.status})`);

        const statsJson = (await statsRes.json()) as OpsResponse;
        const woJson = (await woRes.json()) as { workOrders: WorkOrder[] };
        const assetJson = (await assetRes.json()) as { assets: Array<{ id: string; name: string }> };

        if (ignore) return;
        setStats(statsJson);
        setWorkOrders(woJson.workOrders || []);
        const map: Record<string, { name: string }> = {};
        for (const a of assetJson.assets || []) map[a.id] = { name: a.name };
        setAssetsById(map);

        if (teamRes.ok) {
          const teamJson = (await teamRes.json()) as { workers: Technician[] };
          setTechs(teamJson.workers || []);
        }
      } catch (e: unknown) {
        if (!ignore) setError((e as Error)?.message || "Failed to load");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  const techName = (id: string | null | undefined) => {
    if (!id) return "Unassigned";
    const t = techs.find((t) => t.id === id);
    return t?.name || "Tech";
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const w of workOrders) set.add(w.category);
    return Array.from(set).sort();
  }, [workOrders]);

  const filtered = useMemo(() => {
    return workOrders
      .filter((w) => (statusFilter === "all" ? true : w.status === statusFilter))
      .filter((w) => (priorityFilter === "all" ? true : w.priority === priorityFilter))
      .filter((w) => (categoryFilter === "all" ? true : w.category === categoryFilter))
      .filter((w) => {
        if (techFilter === "all") return true;
        if (techFilter === "unassigned") return !w.assigned_to;
        return w.assigned_to === techFilter;
      });
  }, [workOrders, statusFilter, priorityFilter, categoryFilter, techFilter]);

  const sorted = useMemo(() => {
    const weightPriority: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const weightStatus: Record<string, number> = { open: 5, assigned: 4, in_progress: 3, on_hold: 2, completed: 1, cancelled: 0 };

    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (sortKey === "priority") {
        va = weightPriority[a.priority];
        vb = weightPriority[b.priority];
      } else if (sortKey === "status") {
        va = weightStatus[a.status];
        vb = weightStatus[b.status];
      } else {
        va = new Date(a.created_at).getTime();
        vb = new Date(b.created_at).getTime();
      }

      const dir = sortDir === "asc" ? 1 : -1;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return arr;
  }, [filtered, sortKey, sortDir]);

  const openCount = stats?.workOrders.countsByStatus.open || 0;
  const inProgressCount = stats?.workOrders.countsByStatus.in_progress || 0;
  const completedToday = stats?.workOrders.completedTodayCount || 0;
  const mttrWeek = stats?.workOrders.mttrMinutesThisWeek || 0;
  const overdueCount = stats?.workOrders.overdueCount || 0;

  function openActions(wo: WorkOrder) {
    setActiveWO(wo);
    setActionAssignTo(wo.assigned_to || "unassigned");
    setActionPriority(wo.priority);
    setActionStatus(wo.status);
    setActionNote("");
  }

  async function saveActions() {
    if (!activeWO) return;
    try {
      setSaving(true);

      const patch: Record<string, unknown> = {
        assigned_to: actionAssignTo === "unassigned" ? null : actionAssignTo,
        priority: actionPriority,
        status: actionStatus,
      };

      const res = await fetch(`/api/operations/work-orders/${activeWO.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patch }),
      });

      if (!res.ok) throw new Error(`Update failed (${res.status})`);

      if (actionNote.trim()) {
        const timestamp = new Date().toLocaleString();
        const existing = activeWO.resolution_notes?.trim() || "";
        const newNote = `[${timestamp}] ${actionNote.trim()}`;
        const combined = existing ? `${existing}\n\n${newNote}` : newNote;
        await fetch(`/api/operations/work-orders/${activeWO.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ patch: { resolution_notes: combined } }),
        });
      }

      // refresh list
      if (companyId) {
        const woRes = await fetch(`/api/operations/work-orders?companyId=${encodeURIComponent(companyId)}`, { cache: "no-store" });
        if (woRes.ok) {
          const woJson = (await woRes.json()) as { workOrders: WorkOrder[] };
          setWorkOrders(woJson.workOrders || []);
        }
      }

      setActiveWO(null);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Work Orders</h1>
            <p className="text-sm text-black/50 mt-1">Track, assign, and resolve work across the plant.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/today")}>Today</Button>
            <Button onClick={() => (window.location.href = "/assets")}>Assets</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Open" value={loading ? "—" : String(openCount)} icon={Wrench} accentColor="blue" />
          <MetricCard label="In Progress" value={loading ? "—" : String(inProgressCount)} icon={Clock} accentColor="amber" />
          <MetricCard label="Completed today" value={loading ? "—" : String(completedToday)} icon={Calendar} accentColor="emerald" />
          <MetricCard label="Avg MTTR (this week)" value={loading ? "—" : `${Math.round(mttrWeek)}m`} icon={Clock} accentColor="amber" />
          <MetricCard
            label="Overdue"
            value={loading ? "—" : String(overdueCount)}
            icon={AlertTriangle}
            accentColor={overdueCount ? "red" : undefined}
          />
        </div>

        {!!error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
        )}

        <div className="mt-8 rounded-2xl bg-white border border-black/5 p-6">
          <SectionHeader title="All work orders" subtitle="Filter, sort, and take quick actions" />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WorkOrderStatus | "all")}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as WorkOrderPriority | "all")}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={techFilter} onValueChange={(v) => setTechFilter(v)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All techs</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {techs.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name || t.phone || t.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-black/50">
              <span>{sorted.length} results</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as "priority" | "status" | "created_at")}>
                <SelectTrigger className="bg-white w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="h-10"
              >
                {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short ID</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Time Open</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((wo) => {
                  const assetName = wo.asset_id ? assetsById[wo.asset_id]?.name || "—" : "—";
                  const minutes = timeOpenMinutes(wo);

                  return (
                    <TableRow key={wo.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/work-orders/${wo.id}`}
                            className="text-[#C96442] hover:underline"
                          >
                            {wo.short_id}
                          </Link>
                        </TableCell>
                        <TableCell><PriorityBadge priority={wo.priority} /></TableCell>
                        <TableCell>{assetName}</TableCell>
                        <TableCell className="max-w-[340px] truncate">{wo.title}</TableCell>
                        <TableCell><StatusBadge status={wo.status} /></TableCell>
                        <TableCell className="text-sm text-black/60">{techName(wo.assigned_to)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-black/60">{formatTimeAgo(wo.created_at)} ago</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-black/60">{Math.round(minutes / 60)}h</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Link
                              href={`/work-orders/${wo.id}`}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground"
                            >
                              Details
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => openActions(wo)}>
                              Quick actions
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  );
                })}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="p-0">
                      <SkeletonTable rows={6} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-sm text-black/50">
                      No work orders match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={!!activeWO} onOpenChange={(o) => (!o ? setActiveWO(null) : null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Quick actions</DialogTitle>
            <DialogDescription>
              {activeWO ? `${activeWO.short_id} · ${activeWO.title}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Assign</div>
              <Select value={actionAssignTo} onValueChange={(v) => setActionAssignTo(v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {techs.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name || t.phone || t.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Priority</div>
              <Select value={actionPriority} onValueChange={(v) => setActionPriority(v as WorkOrderPriority)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Status</div>
              <Select value={actionStatus} onValueChange={(v) => setActionStatus(v as WorkOrderStatus)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="on_hold">On hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Add note</div>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Optional note…"
                className="w-full min-h-[42px] rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setActiveWO(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveActions} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
