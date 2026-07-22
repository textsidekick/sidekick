"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, Clock, Edit3, ChevronDown, ChevronUp,
  AlertTriangle, Shield, Wrench, Link2, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewArticle {
  id: string;
  title: string;
  problem: string;
  symptoms: string;
  solution: string;
  equipment_type: string;
  asset_name: string;
  parts_used: string[];
  tags: string[];
  time_estimate_minutes: number;
  times_referenced: number;
  source_work_order_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

function riskLevel(article: ReviewArticle): "high" | "medium" | "low" {
  if (!article.asset_name && !article.equipment_type) return "high";
  if (!article.symptoms || !article.parts_used?.length) return "medium";
  return "low";
}

function riskBadge(level: "high" | "medium" | "low") {
  const cls = level === "high" ? "bg-red-100 text-gray-700 border-red-200"
    : level === "medium" ? "bg-amber-100 text-gray-700 border-amber-200"
    : "bg-green-100 text-gray-700 border-green-200";
  return (
    <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border", cls)}>
      {level} risk
    </span>
  );
}

function flagExplanation(article: ReviewArticle) {
  const flags: string[] = [];
  if (!article.asset_name && !article.equipment_type) flags.push("No linked asset — cannot verify applies to real equipment");
  if (!article.symptoms) flags.push("Missing symptoms — may not be findable when searching for problems");
  if (!article.parts_used?.length) flags.push("No parts listed — technicians won't know what to bring");
  if (article.times_referenced === 0) flags.push("Never referenced — may not be useful or discoverable");
  return flags;
}

function ProvenanceLine({ article }: { article: ReviewArticle }) {
  const meta = article.metadata || {};
  const source = article.source_work_order_id ? "auto-extraction" : "manual";
  const parts: string[] = [];
  if (meta.verified_by) {
    parts.push(`Verified by ${meta.verified_by} · ${timeAgo(meta.verified_at as string)}`);
  } else {
    parts.push("Unverified");
  }
  parts.push(`from ${source}`);
  if (meta.last_edited_by) parts.push(`edited by ${meta.last_edited_by}`);

  return (
    <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1">
      <Shield className="w-3 h-3" />
      {parts.join(" · ")}
    </div>
  );
}

// ─── Reject Modal ───────────────────────────────────────────────────────────────
function RejectModal({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-900 mb-2">Reject Knowledge Item</h3>
        <p className="text-sm text-gray-500 mb-3">Why is this item incorrect or not useful?</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="e.g. Wrong procedure for this machine, outdated parts list..." />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">Reject</button>
        </div>
      </div>
    </div>
  );
}

// ─── Snooze Modal ───────────────────────────────────────────────────────────────
function SnoozeModal({ onConfirm, onCancel }: { onConfirm: (days: number) => void; onCancel: () => void }) {
  const [days, setDays] = useState(7);
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-900 mb-2">Snooze Review</h3>
        <p className="text-sm text-gray-500 mb-3">Come back to this item later.</p>
        <div className="flex gap-2">
          {[1, 3, 7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)} className={cn("px-3 py-1.5 text-sm rounded-lg border", days === d ? "border-[#0060F0]/20 bg-[#F4F7FA] text-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
              {d}d
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(days)} className="px-4 py-2 text-sm bg-[#0060F0] text-white rounded-lg hover:bg-[#004BB8]">Snooze {days}d</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ─────────────────────────────────────────────────────────────────
function EditVerifyModal({ article, onConfirm, onCancel }: { article: ReviewArticle; onConfirm: (edits: Record<string, string>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(article.title);
  const [problem, setProblem] = useState(article.problem);
  const [solution, setSolution] = useState(article.solution);
  const [symptoms, setSymptoms] = useState(article.symptoms || "");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-900 mb-4">Edit & Verify</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Problem</label>
            <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Symptoms</label>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Solution</label>
            <textarea value={solution} onChange={e => setSolution(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm({ title, problem, solution, symptoms })} className="px-4 py-2 text-sm bg-[#0060F0] text-white rounded-lg hover:bg-[#004BB8] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Save & Verify
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "reject" | "snooze" | "edit"; articleId: string; article?: ReviewArticle } | null>(null);

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (auth.companyId) setCompanyId(auth.companyId);
    } catch {}
  }, []);

  const loadItems = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/knowledge/review?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const reviewerName = "Manager"; // In production, pull from session

  const doAction = async (action: string, articleId: string, extra?: Record<string, unknown>) => {
    setActionLoading(articleId);
    try {
      await fetch("/api/knowledge/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, action, companyId, reviewerName, ...extra }),
      });
      setItems(prev => prev.filter(i => i.id !== articleId));
    } catch {}
    setActionLoading(null);
    setModal(null);
  };

  const lowRiskIds = items.filter(a => riskLevel(a) === "low").map(a => a.id);

  const bulkVerify = async () => {
    if (!lowRiskIds.length) return;
    setActionLoading("bulk");
    try {
      await fetch("/api/knowledge/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_verify", articleIds: lowRiskIds, companyId, reviewerName }),
      });
      setItems(prev => prev.filter(i => !lowRiskIds.includes(i.id)));
    } catch {}
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <SectionHeader title="Review Queue" subtitle="Verify auto-generated knowledge before it reaches your team" />

      {/* Stats bar */}
      <div className="mt-6 flex items-center gap-4 flex-wrap">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-xs text-gray-500">Pending review</div>
          </div>
        </div>
        {lowRiskIds.length >= 2 && (
          <button
            onClick={bulkVerify}
            disabled={actionLoading === "bulk"}
            className="rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 px-5 py-3 flex items-center gap-3 transition text-left disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 text-gray-700" />
            <div>
              <div className="text-sm font-semibold text-gray-800">Bulk Verify {lowRiskIds.length} Low-Risk</div>
              <div className="text-xs text-gray-600">Items with linked assets & complete info</div>
            </div>
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading review queue…</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500/40 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">All caught up!</p>
            <p className="text-gray-400 text-sm mt-1">No knowledge items need review right now.</p>
          </div>
        ) : (
          items.map(article => {
            const risk = riskLevel(article);
            const flags = flagExplanation(article);
            const isExpanded = expanded === article.id;
            const isLoading = actionLoading === article.id;

            return (
              <div key={article.id} className={cn("bg-white rounded-xl border overflow-hidden", risk === "high" ? "border-red-200" : risk === "medium" ? "border-amber-200" : "border-gray-200")}>
                {/* Header */}
                <button onClick={() => setExpanded(isExpanded ? null : article.id)} className="w-full px-5 py-4 flex items-start justify-between text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{article.title}</span>
                      {riskBadge(risk)}
                      {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{article.problem}</p>
                    <ProvenanceLine article={article} />
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {article.asset_name && <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{article.asset_name}</span>}
                      <span>{timeAgo(article.created_at)}</span>
                      {article.source_work_order_id && (
                        <a href={`/work-orders?id=${article.source_work_order_id}`} className="text-[#0060F0] underline hover:text-[#004BB8] flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Link2 className="w-3 h-3" /> Source WO
                        </a>
                      )}
                    </div>

                    {/* Inline flag explanations */}
                    {flags.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {flags.map((f, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                    {article.symptoms && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Symptoms</div>
                        <p className="text-sm text-gray-700">{article.symptoms}</p>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Solution</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{article.solution}</p>
                    </div>
                    {article.parts_used?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Parts Used</div>
                        <div className="flex gap-2 flex-wrap">
                          {article.parts_used.map(p => <span key={p} className="text-xs px-2 py-1 bg-orange-50 text-gray-700 rounded">{p}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => doAction("verify", article.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Verify
                      </button>
                      <button
                        onClick={() => setModal({ type: "edit", articleId: article.id, article })}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0060F0] text-white rounded-lg hover:bg-[#004BB8] disabled:opacity-50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" /> Edit & Verify
                      </button>
                      <button
                        onClick={() => setModal({ type: "reject", articleId: article.id })}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => setModal({ type: "snooze", articleId: article.id })}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        <Clock className="w-4 h-4" /> Snooze
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {modal?.type === "reject" && (
        <RejectModal onConfirm={(reason) => doAction("reject", modal.articleId, { reason })} onCancel={() => setModal(null)} />
      )}
      {modal?.type === "snooze" && (
        <SnoozeModal onConfirm={(days) => doAction("snooze", modal.articleId, { snoozeDuration: days })} onCancel={() => setModal(null)} />
      )}
      {modal?.type === "edit" && modal.article && (
        <EditVerifyModal article={modal.article} onConfirm={(edits) => doAction("edit_verify", modal.articleId, { edits })} onCancel={() => setModal(null)} />
      )}
    </div>
  );
}
