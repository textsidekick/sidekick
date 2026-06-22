"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";
import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from "@/types/operations";

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

type Technician = { id: string; name: string };

const TECHS: Technician[] = [
  { id: "t1", name: "Mike T." },
  { id: "t2", name: "Carlos R." },
  { id: "t3", name: "Ayesha K." },
  { id: "t4", name: "Sam P." },
];

function priorityBadge(priority: WorkOrderPriority) {
  const cls =
    priority === "critical"
      ? "bg-red-100 text-red-800"
      : priority === "high"
        ? "bg-orange-100 text-orange-800"
        : priority === "medium"
          ? "bg-yellow-100 text-yellow-900"
          : "bg-gray-100 text-gray-700";
  return <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>{priority.toUpperCase()}</span>;
}

function statusBadge(status: WorkOrderStatus) {
  const cls =
    status === "open"
      ? "bg-blue-100 text-blue-800"
      : status === "assigned"
        ? "bg-purple-100 text-purple-800"
        : status === "in_progress"
          ? "bg-yellow-100 text-yellow-900"
          : status === "completed"
            ? "bg-green-100 text-green-800"
            : status === "on_hold"
              ? "bg-gray-100 text-gray-700"
              : "bg-gray-100 text-gray-700";

  return <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>{status.replaceAll("_", " ").toUpperCase()}</span>;
}

function formatTimeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86400_000) return `${Math.floor(ms / 3600_000)}h`;
  return `${Math.floor(ms / 86400_000)}d`;
}

function minutesOpen(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
}

export default function WorkOrdersPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [stats, setStats] = useState<OpsResponse | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assetsById, setAssetsById] = useState<Record<string, { name: string }>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [techFilter, setTechFilter] = useState<string | "all">("all");

  const [sortKey, setSortKey] = useState<"priority" | "status" | "created_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [expandedId, setExpandedId] = useState<string | null>(null);

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

        const [statsRes, woRes, assetRes] = await Promise.all([
          fetch("/api/dashboard/operations", { cache: "no-store" }),
          fetch(`/api/operations/work-orders?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
          fetch(`/api/operations/assets?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
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
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

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

      const patch: any = {
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
        // Notes are not modeled yet; store it in resolution_notes as an append for now.
        await fetch(`/api/operations/work-orders/${activeWO.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ patch: { resolution_notes: `${activeWO.resolution_notes || ""}\n\n[Manager note] ${actionNote}`.trim() } }),
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
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <TopBar />
      <OpsNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Work Orders</h1>
            <p className="text-sm text-black/50 mt-1">Track, assign, and resolve work across the plant.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/operations")}>Operations</Button>
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
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
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

            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
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

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
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

            <Select value={techFilter} onValueChange={(v) => setTechFilter(v as any)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All techs</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {TECHS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
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
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
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

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short ID</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Time Open</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((wo) => {
                  const expanded = expandedId === wo.id;
                  const assetName = wo.asset_id ? assetsById[wo.asset_id]?.name || "—" : "—";
                  const assignedName = wo.assigned_to
                    ? TECHS.find((t) => t.id === wo.assigned_to)?.name || "Tech"
                    : "Unassigned";

                  return (
                    <React.Fragment key={wo.id}>
                      <TableRow
                        className={cn("cursor-pointer", expanded && "bg-black/[0.02]")}
                        onClick={() => setExpandedId((cur) => (cur === wo.id ? null : wo.id))}
                      >
                        <TableCell className="font-medium">{wo.short_id}</TableCell>
                        <TableCell>{priorityBadge(wo.priority)}</TableCell>
                        <TableCell>{assetName}</TableCell>
                        <TableCell className="max-w-[340px] truncate">{wo.title}</TableCell>
                        <TableCell>{statusBadge(wo.status)}</TableCell>
                        <TableCell className="text-sm text-black/60">{assignedName}</TableCell>
                        <TableCell className="text-sm text-black/60">{formatTimeAgo(wo.created_at)} ago</TableCell>
                        <TableCell className="text-sm text-black/60">{Math.round(minutesOpen(wo.created_at) / 60)}h</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={(e) => (e.stopPropagation(), openActions(wo))}>
                            Quick actions
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow className="bg-black/[0.02]">
                          <TableCell colSpan={9} className="whitespace-normal">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-2">
                              <div className="lg:col-span-2">
                                <div className="text-sm font-medium">Description</div>
                                <div className="mt-1 text-sm text-black/60">{wo.description || "—"}</div>

                                <div className="mt-4 text-sm font-medium">AI triage</div>
                                <pre className="mt-1 text-xs bg-white border border-black/5 rounded-xl p-3 overflow-x-auto">{JSON.stringify(wo.ai_triage || {}, null, 2)}</pre>

                                <div className="mt-4 text-sm font-medium">Resolution notes</div>
                                <div className="mt-1 text-sm text-black/60">{wo.resolution_notes || "—"}</div>
                              </div>

                              <div>
                                <div className="rounded-xl border border-black/5 bg-white p-4">
                                  <div className="text-sm font-medium">Timeline</div>
                                  <div className="mt-2 space-y-2 text-sm text-black/60">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      Created: {new Date(wo.created_at).toLocaleString()}
                                    </div>
                                    {!!wo.started_at && (
                                      <div className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Started: {new Date(wo.started_at).toLocaleString()}
                                      </div>
                                    )}
                                    {!!wo.completed_at && (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Completed: {new Date(wo.completed_at).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-black/5 bg-white p-4">
                                  <div className="text-sm font-medium">Photos</div>
                                  <div className="mt-2 text-sm text-black/50">
                                    {(wo.photos || []).length ? `${wo.photos.length} attached` : "No photos"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}

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
              <Select value={actionAssignTo} onValueChange={(v) => setActionAssignTo(v as any)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {TECHS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Priority</div>
              <Select value={actionPriority} onValueChange={(v) => setActionPriority(v as any)}>
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
              <Select value={actionStatus} onValueChange={(v) => setActionStatus(v as any)}>
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
