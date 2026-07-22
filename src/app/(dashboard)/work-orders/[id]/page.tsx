"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Clock3, Hash, MessageSquare, Save, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "@/components/dashboard/shared/PriorityBadge";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { formatTimeAgo } from "@/lib/format";
import type { WorkOrderPriority, WorkOrderStatus } from "@/types/operations";

type WorkOrderDetail = {
  id: string;
  company_id: string;
  short_id: string;
  asset_id: string | null;
  reported_by: string;
  assigned_to: string | null;
  title: string;
  description: string;
  original_message?: string | null;
  ai_triage?: Record<string, unknown> | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  category: string;
  source: string;
  started_at?: string | null;
  completed_at?: string | null;
  resolution_notes?: string | null;
  photos?: string[];
  downtime_cost_estimate?: number | null;
  created_at: string;
  updated_at: string;
  worker_phone?: string | null;
};

type Technician = { id: string; name: string | null; phone?: string; role?: string; skills?: string[]; shift?: string | null };
type Asset = { id: string; name: string; type?: string; location?: string; health_score?: number };

type AITriage = {
  priority?: string;
  reason?: string;
  suspected_cause?: string;
  suggested_parts?: string[];
  confidence?: number;
  issue?: {
    category?: string;
    symptomSummary?: string;
    rootCauseHypothesis?: string;
    partsLikelyNeeded?: string[];
  };
  manager_corrections?: Array<{
    at?: string;
    note?: string | null;
    changed?: Record<string, unknown>;
  }>;
};

function AITriageCard({ triage }: { triage: AITriage | null | undefined }) {
  if (!triage || Object.keys(triage).length === 0) {
    return <div className="text-sm text-black/45">No AI triage data saved for this work order.</div>;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-black/35">AI triage</span>
        {triage.priority && <PriorityBadge priority={triage.priority} />}
        {triage.confidence !== undefined && (
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-black/55">
            {Math.round(Number(triage.confidence) * 100)}% confidence
          </span>
        )}
      </div>
      {triage.reason && <p className="text-sm text-black/70">{triage.reason}</p>}
      {triage.suspected_cause && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-black/35">Suspected cause</div>
          <p className="mt-1 text-sm text-black/70">{triage.suspected_cause}</p>
        </div>
      )}
      {!!triage.suggested_parts?.length && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-black/35">Suggested parts</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {triage.suggested_parts.map((part) => (
              <span key={part} className="rounded-full bg-[#F4F7FA] px-3 py-1 text-xs font-medium text-black/60">
                {part}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [techs, setTechs] = useState<Technician[]>([]);
  const [relatedKnowledge, setRelatedKnowledge] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [correcting, setCorrecting] = useState(false);

  const [actionAssignTo, setActionAssignTo] = useState<string | "unassigned">("unassigned");
  const [actionPriority, setActionPriority] = useState<WorkOrderPriority>("medium");
  const [actionStatus, setActionStatus] = useState<WorkOrderStatus>("open");
  const [actionNote, setActionNote] = useState("");
  const [correctionSummary, setCorrectionSummary] = useState("");
  const [correctionCategory, setCorrectionCategory] = useState("");
  const [correctionRootCause, setCorrectionRootCause] = useState("");
  const [correctionParts, setCorrectionParts] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const workOrderRes = await fetch(`/api/operations/work-orders/${id}`, { cache: "no-store" });
        if (!workOrderRes.ok) throw new Error(`Failed to load work order (${workOrderRes.status})`);
        const workOrderJson = await workOrderRes.json();
        const wo = workOrderJson.workOrder as WorkOrderDetail;
        if (ignore) return;

        setWorkOrder(wo);
        setActionAssignTo(wo.assigned_to || "unassigned");
        setActionPriority(wo.priority);
        setActionStatus(wo.status);
        const triage = (wo.ai_triage || {}) as AITriage;
        setCorrectionSummary(triage.issue?.symptomSummary || wo.title || "");
        setCorrectionCategory(triage.issue?.category || wo.category || "");
        setCorrectionRootCause(triage.issue?.rootCauseHypothesis || triage.suspected_cause || "");
        setCorrectionParts((triage.issue?.partsLikelyNeeded || triage.suggested_parts || []).join(", "));

        const requests: Promise<Response>[] = [
          fetch(`/api/team`, { cache: "no-store" }),
          fetch(`/api/knowledge`, { cache: "no-store" }),
        ];

        if (wo.company_id) {
          requests.push(fetch(`/api/operations/assets?companyId=${encodeURIComponent(wo.company_id)}`, { cache: "no-store" }));
        }

        const responses = await Promise.all(requests);
        const [teamRes, knowledgeRes, assetsRes] = responses;

        if (teamRes.ok) {
          const teamJson = await teamRes.json();
          if (!ignore) setTechs(teamJson.workers || []);
        }

        if (knowledgeRes.ok) {
          const knowledgeJson = await knowledgeRes.json();
          const articles = (knowledgeJson.articles || []).filter((article: any) => article.source_work_order_id === wo.id).slice(0, 5);
          if (!ignore) setRelatedKnowledge(articles);
        }

        if (assetsRes?.ok) {
          const assetsJson = await assetsRes.json();
          const matchedAsset = (assetsJson.assets || []).find((item: Asset) => item.id === wo.asset_id) || null;
          if (!ignore) setAsset(matchedAsset);
        }
      } catch (err: any) {
        if (!ignore) setError(err?.message || "Failed to load work order");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [id]);

  const techName = (techId: string | null | undefined) => {
    if (!techId) return "Unassigned";
    const match = techs.find((tech) => tech.id === techId);
    return match?.name || match?.phone || "Technician";
  };

  const recommendedTech = useMemo(() => {
    if (!workOrder) return null;
    const desired = (correctionCategory || workOrder.category || "").toLowerCase();
    return techs
      .map((tech) => {
        const skills = (tech.skills || []).map((skill) => skill.toLowerCase());
        let score = 0;
        if (tech.role === "technician") score += 30;
        if (skills.some((skill) => skill === desired)) score += 45;
        else if (skills.some((skill) => skill.includes(desired) || desired.includes(skill))) score += 25;
        if (tech.shift) score += 5;
        return { tech, score };
      })
      .sort((a, b) => b.score - a.score)[0]?.tech || null;
  }, [correctionCategory, techs, workOrder]);

  const threadEvents = useMemo(() => {
    if (!workOrder) return [];
    const triage = (workOrder.ai_triage || {}) as AITriage;
    const events = [
      {
        id: "worker-message",
        author: "Worker",
        kind: "worker",
        time: workOrder.created_at,
        body: workOrder.original_message || workOrder.description || workOrder.title,
      },
      {
        id: "sidekick-triage",
        author: "Sidekick",
        kind: "assistant",
        time: workOrder.created_at,
        body: triage.reason
          ? `Created ${workOrder.short_id} as ${workOrder.priority.replaceAll("_", " ")} priority. ${triage.reason}`
          : `Created ${workOrder.short_id} and classified it as ${workOrder.priority.replaceAll("_", " ")} priority.`,
      },
      {
        id: "system-status",
        author: "System",
        kind: "system",
        time: workOrder.updated_at,
        body: `Current status: ${workOrder.status.replaceAll("_", " ")}${workOrder.assigned_to ? ` · Assigned to ${techName(workOrder.assigned_to)}` : ""}`,
      },
    ];

    if (workOrder.started_at) {
      events.push({
        id: "started",
        author: "System",
        kind: "system",
        time: workOrder.started_at,
        body: `${workOrder.short_id} was started by the assigned technician.`,
      });
    }

    if (workOrder.completed_at) {
      events.push({
        id: "completed",
        author: "System",
        kind: "system",
        time: workOrder.completed_at,
        body: `${workOrder.short_id} was marked completed.`,
      });
    }

    return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [techs, workOrder]);

  async function saveActions() {
    if (!workOrder) return;
    try {
      setSaving(true);
      setError(null);

      const patch: Record<string, unknown> = {
        assigned_to: actionAssignTo === "unassigned" ? null : actionAssignTo,
        priority: actionPriority,
        status: actionStatus,
      };

      const updateRes = await fetch(`/api/operations/work-orders/${workOrder.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patch }),
      });
      if (!updateRes.ok) throw new Error(`Update failed (${updateRes.status})`);
      const updatedJson = await updateRes.json();
      let updatedWorkOrder = updatedJson.workOrder as WorkOrderDetail;

      if (actionNote.trim()) {
        const timestamp = new Date().toLocaleString();
        const existing = updatedWorkOrder.resolution_notes?.trim() || "";
        const newNote = `[${timestamp}] ${actionNote.trim()}`;
        const combined = existing ? `${existing}\n\n${newNote}` : newNote;

        const noteRes = await fetch(`/api/operations/work-orders/${workOrder.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ patch: { resolution_notes: combined } }),
        });
        if (noteRes.ok) {
          const noteJson = await noteRes.json();
          updatedWorkOrder = noteJson.workOrder as WorkOrderDetail;
        }
      }

      setWorkOrder(updatedWorkOrder);
      setActionNote("");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveCorrection() {
    if (!workOrder) return;
    try {
      setCorrecting(true);
      setError(null);
      const res = await fetch(`/api/operations/work-orders/${workOrder.id}/manager-correction`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          note: correctionNote,
          correction: {
            summary: correctionSummary,
            category: correctionCategory,
            priority: actionPriority,
            rootCause: correctionRootCause,
            suggestedParts: correctionParts.split(",").map((part) => part.trim()).filter(Boolean),
            assigned_to: actionAssignTo === "unassigned" ? null : actionAssignTo,
          },
        }),
      });
      if (!res.ok) throw new Error(`Correction failed (${res.status})`);
      const json = await res.json();
      setWorkOrder(json.workOrder);
      setCorrectionNote("");
    } catch (err: any) {
      setError(err?.message || "Failed to save correction");
    } finally {
      setCorrecting(false);
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-12 text-sm text-black/45">Loading work order…</div>;
  }

  if (error || !workOrder) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button variant="outline" onClick={() => router.push("/work-orders")}>Back to Work Orders</Button>
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-gray-800">
          {error || "Work order not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => router.push("/work-orders")}
            className="inline-flex items-center gap-2 text-sm font-medium text-black/50 hover:text-black/70"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Work Orders
          </button>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#1C1A16]">{workOrder.short_id}</h1>
            <PriorityBadge priority={workOrder.priority} />
            <StatusBadge status={workOrder.status} />
          </div>
          <p className="mt-2 text-sm text-black/55">{workOrder.title}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-black/55">
          Updated {formatTimeAgo(workOrder.updated_at)} ago
        </div>
      </div>

      {!!error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-gray-800">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1A16]">
              <MessageSquare className="h-4 w-4 text-[#0060F0]" /> Work thread
            </div>
            <div className="mt-5 space-y-4">
              {threadEvents.map((event) => (
                <div key={event.id} className={`flex ${event.kind === "worker" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${event.kind === "worker" ? "bg-[#F4F7FA] text-[#1C1A16]" : event.kind === "assistant" ? "bg-white border border-[#0060F0]/15 text-[#1C1A16]" : "bg-black/[0.04] text-black/65"}`}>
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-black/35">
                      <span>{event.author}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(event.time)} ago</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6">{event.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AITriageCard triage={(workOrder.ai_triage || {}) as AITriage} />

          {((workOrder.ai_triage || {}) as AITriage).manager_corrections?.length ? (
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <div className="text-sm font-semibold text-[#1C1A16]">Manager correction history</div>
              <div className="mt-4 space-y-3">
                {(((workOrder.ai_triage || {}) as AITriage).manager_corrections || []).slice().reverse().map((entry, index) => (
                  <div key={`${entry.at || index}`} className="rounded-xl bg-[#F4F7FA] px-4 py-3 text-sm text-black/65">
                    <div className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      {entry.at ? new Date(entry.at).toLocaleString() : "Manager correction"}
                    </div>
                    {entry.note ? <p className="mt-1 text-sm text-[#1C1A16]">{entry.note}</p> : null}
                    {entry.changed && Object.keys(entry.changed).length > 0 ? (
                      <div className="mt-2 text-xs text-black/50">Updated: {Object.keys(entry.changed).join(", ")}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="text-sm font-semibold text-[#1C1A16]">Manager actions</div>
            <p className="mt-1 text-sm text-black/50">Update assignment, priority, and status from one place.</p>

            {recommendedTech && actionAssignTo === "unassigned" ? (
              <div className="mt-4 rounded-xl border border-[#0060F0]/15 bg-[#F8FBFF] p-3 text-sm text-black/65">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-[#1C1A16]">Suggested assignee: {recommendedTech.name || recommendedTech.phone || "Technician"}</div>
                    <div className="mt-1 text-xs text-black/50">
                      {recommendedTech.skills?.length ? `Skills: ${recommendedTech.skills.join(", ")}` : "Best available technician based on current team data."}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionAssignTo(recommendedTech.id)}
                    className="rounded-lg border border-[#0060F0]/20 bg-white px-3 py-2 text-xs font-medium text-[#1C1A16] hover:bg-[#EEF4FF]"
                  >
                    Use suggestion
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Assign</div>
                <Select value={actionAssignTo} onValueChange={(value) => setActionAssignTo(value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {techs.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>{tech.name || tech.phone || tech.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Priority</div>
                <Select value={actionPriority} onValueChange={(value) => setActionPriority(value as WorkOrderPriority)}>
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
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Status</div>
                <Select value={actionStatus} onValueChange={(value) => setActionStatus(value as WorkOrderStatus)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="on_hold">On hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Add note</div>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Add context for the next manager or tech…"
                  className="min-h-[92px] w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={saveActions} disabled={saving}>
                <Save className="mr-1 h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="text-sm font-semibold text-[#1C1A16]">Correct Sidekick</div>
            <p className="mt-1 text-sm text-black/50">Override the AI summary, cause, parts, priority, or assignment so future triage is grounded in the manager decision.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Corrected summary</div>
                <textarea value={correctionSummary} onChange={(e) => setCorrectionSummary(e.target.value)} className="min-h-[92px] w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20" />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Corrected category</div>
                <input value={correctionCategory} onChange={(e) => setCorrectionCategory(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20" placeholder="mechanical, electrical, safety..." />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Root cause</div>
                <textarea value={correctionRootCause} onChange={(e) => setCorrectionRootCause(e.target.value)} className="min-h-[92px] w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20" />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Suggested parts</div>
                <textarea value={correctionParts} onChange={(e) => setCorrectionParts(e.target.value)} className="min-h-[92px] w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20" placeholder="comma separated" />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/35">Why this correction matters</div>
              <textarea value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} placeholder="What Sidekick got wrong, what the manager decided, or what future triage should notice..." className="min-h-[92px] w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20" />
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={saveCorrection} disabled={correcting}>
                <Save className="mr-1 h-4 w-4" />
                {correcting ? "Saving…" : "Save AI correction"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="text-sm font-semibold text-[#1C1A16]">Details</div>
            <div className="mt-4 space-y-3 text-sm text-black/60">
              <div className="flex items-start gap-3"><User className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Reported by</div><div>{workOrder.reported_by || workOrder.worker_phone || "Worker"}</div></div></div>
              <div className="flex items-start gap-3"><Wrench className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Asset</div><div>{asset?.name || "No asset linked yet"}</div>{asset?.location && <div className="text-xs text-black/40">{asset.location}</div>}</div></div>
              <div className="flex items-start gap-3"><Hash className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Category</div><div className="capitalize">{workOrder.category.replaceAll("_", " ")}</div></div></div>
              <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Assigned to</div><div>{techName(workOrder.assigned_to)}</div></div></div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="text-sm font-semibold text-[#1C1A16]">Timeline</div>
            <div className="mt-4 space-y-3 text-sm text-black/60">
              <div className="flex items-start gap-3"><Calendar className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Created</div><div>{new Date(workOrder.created_at).toLocaleString()}</div></div></div>
              {workOrder.started_at && <div className="flex items-start gap-3"><Wrench className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Started</div><div>{new Date(workOrder.started_at).toLocaleString()}</div></div></div>}
              {workOrder.completed_at && <div className="flex items-start gap-3"><Calendar className="mt-0.5 h-4 w-4 text-black/30" /><div><div className="font-medium text-black/75">Completed</div><div>{new Date(workOrder.completed_at).toLocaleString()}</div></div></div>}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="text-sm font-semibold text-[#1C1A16]">Resolution notes</div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/60">
              {workOrder.resolution_notes || "No notes yet."}
            </p>
          </div>

          {relatedKnowledge.length > 0 && (
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1A16]">
                <BookOpen className="h-4 w-4 text-[#0060F0]" /> Related knowledge
              </div>
              <div className="mt-4 space-y-2">
                {relatedKnowledge.map((article) => (
                  <a key={article.id} href="/knowledge" className="block text-sm text-[#0060F0] hover:underline">
                    {article.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
