"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Wrench,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Link2,
  Loader2,
  Edit3,
  XCircle,
} from "lucide-react";
import GeneratedReports from "@/components/dashboard/documents/GeneratedReports";
import KnowledgeBaseViewer from "@/components/dashboard/documents/KnowledgeBaseViewer";
import { cn } from "@/lib/utils";

interface KnowledgeArticle {
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

type ReviewModalState =
  | { type: "reject"; articleId: string }
  | { type: "snooze"; articleId: string }
  | { type: "edit"; articleId: string; article: KnowledgeArticle }
  | null;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

function ProvenanceBadge({ article }: { article: KnowledgeArticle }) {
  const meta = article.metadata || {};
  const source = article.source_work_order_id ? "auto-extraction" : "manual";
  const status = meta.review_status as string | undefined;

  if (status === "verified") {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
        <span className="mt-0.5 text-[10px] text-gray-400">
          Verified by {(meta.verified_by as string) || "—"} · {meta.verified_at ? timeAgo(meta.verified_at as string) : ""} · from {source}
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
      <CheckCircle2 className="h-3 w-3" /> Verified
    </span>
  );
}

function reviewRisk(article: KnowledgeArticle): "high" | "medium" | "low" {
  if (!article.asset_name && !article.equipment_type) return "high";
  if (!article.symptoms || !article.parts_used?.length) return "medium";
  return "low";
}

function reviewRiskBadge(level: "high" | "medium" | "low") {
  const cls =
    level === "high"
      ? "border-red-200 bg-red-100 text-gray-700"
      : level === "medium"
        ? "border-amber-200 bg-amber-100 text-gray-700"
        : "border-green-200 bg-green-100 text-gray-700";

  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", cls)}>{level} risk</span>;
}

function flagExplanation(article: KnowledgeArticle) {
  const flags: string[] = [];
  if (!article.asset_name && !article.equipment_type) flags.push("No linked asset — cannot verify applies to real equipment");
  if (!article.symptoms) flags.push("Missing symptoms — may be harder to discover later");
  if (!article.parts_used?.length) flags.push("No parts listed — technicians may not know what to bring");
  if (article.times_referenced === 0) flags.push("Never referenced yet — usefulness is still unproven");
  return flags;
}

function RejectModal({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 font-semibold text-gray-900">Reject knowledge item</h3>
        <p className="mb-3 text-sm text-gray-500">Why is this item incorrect or not useful?</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30"
          placeholder="e.g. Wrong procedure for this machine, outdated parts list..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50">Reject</button>
        </div>
      </div>
    </div>
  );
}

function SnoozeModal({ onConfirm, onCancel }: { onConfirm: (days: number) => void; onCancel: () => void }) {
  const [days, setDays] = useState(7);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 font-semibold text-gray-900">Snooze review</h3>
        <p className="mb-3 text-sm text-gray-500">Come back to this item later.</p>
        <div className="flex gap-2">
          {[1, 3, 7, 14, 30].map((value) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm",
                days === value ? "border-[#C96442]/20 bg-[#F7F3EC] text-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {value}d
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(days)} className="rounded-lg bg-[#C96442] px-4 py-2 text-sm text-white hover:bg-[#B0532F]">Snooze {days}d</button>
        </div>
      </div>
    </div>
  );
}

function EditVerifyModal({ article, onConfirm, onCancel }: { article: KnowledgeArticle; onConfirm: (edits: Record<string, string>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(article.title);
  const [problem, setProblem] = useState(article.problem);
  const [solution, setSolution] = useState(article.solution);
  const [symptoms, setSymptoms] = useState(article.symptoms || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onCancel}>
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-semibold text-gray-900">Edit & verify</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Problem</label>
            <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Symptoms</label>
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Solution</label>
            <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm({ title, problem, solution, symptoms })} className="flex items-center gap-1.5 rounded-lg bg-[#C96442] px-4 py-2 text-sm text-white hover:bg-[#B0532F]">
            <CheckCircle2 className="h-4 w-4" /> Save & verify
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [reviewItems, setReviewItems] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewExpanded, setReviewExpanded] = useState(true);
  const [reviewOpenId, setReviewOpenId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<ReviewModalState>(null);
  const reviewerName = "Manager";

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

  const loadArticles = useCallback(() => {
    setLoading(true);
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const loadReviewItems = useCallback(() => {
    if (!companyId) return;
    setLoadingReview(true);
    fetch(`/api/knowledge/review?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setReviewItems(d.items || []))
      .catch(() => setReviewItems([]))
      .finally(() => setLoadingReview(false));
  }, [companyId]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    if (!companyId) return;
    loadReviewItems();
  }, [companyId, loadReviewItems]);

  const doAction = async (action: string, articleId: string, extra?: Record<string, unknown>) => {
    setActionLoading(articleId);
    try {
      await fetch("/api/knowledge/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, action, companyId, reviewerName, ...extra }),
      });
      await Promise.all([loadArticles(), loadReviewItems()]);
      setReviewOpenId((current) => (current === articleId ? null : current));
    } catch {
      // quiet failure for now; keep UI stable
    }
    setActionLoading(null);
    setModal(null);
  };

  const bulkVerify = async () => {
    const lowRiskIds = reviewItems.filter((article) => reviewRisk(article) === "low").map((article) => article.id);
    if (!lowRiskIds.length) return;

    setActionLoading("bulk");
    try {
      await fetch("/api/knowledge/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_verify", articleIds: lowRiskIds, companyId, reviewerName }),
      });
      await Promise.all([loadArticles(), loadReviewItems()]);
    } catch {
      // quiet failure for now; keep UI stable
    }
    setActionLoading(null);
  };

  const visibleArticles = useMemo(
    () =>
      articles.filter((article) => {
        const status = (article.metadata?.review_status as string | undefined) || null;
        if (status === "rejected") return false;
        if (article.source_work_order_id) return status === "verified";
        return true;
      }),
    [articles],
  );

  const lowRiskCount = reviewItems.filter((article) => reviewRisk(article) === "low").length;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader title="Operational Knowledge" subtitle="Everything Sidekick knows right now: imported docs, approved procedures, items waiting for review, and generated reports." />

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Knowledge base</h2>
            <p className="mt-1 text-sm text-gray-500">This is the main library: approved procedures plus the imported docs and source material Sidekick has from your company.</p>
          </div>
          {!loading && <div className="text-sm text-gray-400">{visibleArticles.length} approved procedures</div>}
        </div>

        <div className="mt-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Approved procedures</h3>
            <p className="mt-1 text-sm text-gray-500">Verified troubleshooting steps and SOPs Sidekick can confidently use across your team.</p>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-gray-400">Loading approved procedures…</div>
            ) : visibleArticles.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <BookOpen className="mx-auto mb-3 h-12 w-12 text-[#C96442]/30" />
                <p className="font-semibold text-gray-700">No approved procedures captured yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">Once your team uploads docs, texts fixes in, or approves generated knowledge, it will show up here.</p>
              </div>
            ) : (
              visibleArticles.map((article) => (
                <div key={article.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <button onClick={() => setExpanded(expanded === article.id ? null : article.id)} className="flex w-full items-start justify-between px-5 py-4 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{article.title}</span>
                        {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-500">{article.problem}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        {article.asset_name && (
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            {article.asset_name}
                          </span>
                        )}
                        {article.time_estimate_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.time_estimate_minutes}m
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Referenced {article.times_referenced || 0}x
                        </span>
                        <ProvenanceBadge article={article} />
                      </div>
                      {article.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {expanded === article.id ? <ChevronUp className="mt-1 h-5 w-5 text-gray-400" /> : <ChevronDown className="mt-1 h-5 w-5 text-gray-400" />}
                  </button>

                  {expanded === article.id && (
                    <div className="space-y-3 border-t border-gray-100 px-5 pb-5 pt-4">
                      {article.symptoms && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Symptoms</div>
                          <p className="text-sm text-gray-700">{article.symptoms}</p>
                        </div>
                      )}
                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Solution</div>
                        <p className="whitespace-pre-wrap text-sm text-gray-700">{article.solution}</p>
                      </div>
                      {article.parts_used?.length > 0 && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Parts used</div>
                          <div className="flex flex-wrap gap-2">
                            {article.parts_used.map((part) => (
                              <span key={part} className="rounded bg-orange-50 px-2 py-1 text-xs text-gray-700">{part}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Imported docs and source material</h3>
            <p className="mt-1 text-sm text-gray-500">The broader set of uploaded files and connected-source documents Sidekick can reference.</p>
          </div>
          <KnowledgeBaseViewer companyId={companyId} />
        </div>
      </section>

      {loadingReview ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-400 shadow-sm">Loading pending review…</div>
      ) : reviewItems.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          <button onClick={() => setReviewExpanded((value) => !value)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Pending review</h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-gray-700">{reviewItems.length} items</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Approve auto-generated knowledge here before it enters the main library.</p>
            </div>
            {reviewExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {reviewExpanded && (
            <div className="border-t border-amber-100 bg-[#FFFCF6] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">These items were generated from work orders and still need a manager pass before they become searchable team knowledge.</p>
                {lowRiskCount >= 2 && (
                  <button
                    onClick={bulkVerify}
                    disabled={actionLoading === "bulk"}
                    className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-green-100 disabled:opacity-50"
                  >
                    {actionLoading === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Bulk verify {lowRiskCount} low-risk items
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {reviewItems.map((article) => {
                  const risk = reviewRisk(article);
                  const flags = flagExplanation(article);
                  const isOpen = reviewOpenId === article.id;
                  const isLoading = actionLoading === article.id;

                  return (
                    <div key={article.id} className={cn("overflow-hidden rounded-xl border bg-white", risk === "high" ? "border-red-200" : risk === "medium" ? "border-amber-200" : "border-gray-200")}>
                      <button onClick={() => setReviewOpenId(isOpen ? null : article.id)} className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900">{article.title}</div>
                            {reviewRiskBadge(risk)}
                            {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{article.problem}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Auto-generated
                            </span>
                            {article.asset_name && (
                              <span className="inline-flex items-center gap-1">
                                <Wrench className="h-3 w-3" /> {article.asset_name}
                              </span>
                            )}
                            <span>{timeAgo(article.created_at)}</span>
                            {article.source_work_order_id && (
                              <span className="inline-flex items-center gap-1 text-[#C96442]">
                                <Link2 className="h-3 w-3" /> Source WO linked
                              </span>
                            )}
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="mt-1 h-5 w-5 text-gray-400" /> : <ChevronDown className="mt-1 h-5 w-5 text-gray-400" />}
                      </button>

                      {isOpen && (
                        <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-4">
                          {flags.length > 0 && (
                            <div className="space-y-1">
                              {flags.map((flag) => (
                                <div key={flag} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-500" />
                                  <span>{flag}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {article.symptoms && (
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Symptoms</div>
                              <p className="text-sm text-gray-700">{article.symptoms}</p>
                            </div>
                          )}

                          <div>
                            <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Solution</div>
                            <p className="whitespace-pre-wrap text-sm text-gray-700">{article.solution}</p>
                          </div>

                          {article.parts_used?.length > 0 && (
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Parts used</div>
                              <div className="flex flex-wrap gap-2">
                                {article.parts_used.map((part) => (
                                  <span key={part} className="rounded bg-orange-50 px-2 py-1 text-xs text-gray-700">{part}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                            <button
                              onClick={() => doAction("verify", article.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Verify
                            </button>
                            <button
                              onClick={() => setModal({ type: "edit", articleId: article.id, article })}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F] disabled:opacity-50"
                            >
                              <Edit3 className="h-4 w-4" /> Edit & verify
                            </button>
                            <button
                              onClick={() => setModal({ type: "reject", articleId: article.id })}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                            <button
                              onClick={() => setModal({ type: "snooze", articleId: article.id })}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Clock className="h-4 w-4" /> Snooze
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-gray-900">AI-generated reports</h2>
          <p className="mt-1 text-sm text-gray-500">Review generated summaries and reports after the main library and review queue.</p>
        </div>
        <div className="mt-5">
          <GeneratedReports companyId={companyId} />
        </div>
      </section>

      {modal?.type === "reject" && <RejectModal onConfirm={(reason) => doAction("reject", modal.articleId, { reason })} onCancel={() => setModal(null)} />}
      {modal?.type === "snooze" && <SnoozeModal onConfirm={(days) => doAction("snooze", modal.articleId, { snoozeDuration: days })} onCancel={() => setModal(null)} />}
      {modal?.type === "edit" && <EditVerifyModal article={modal.article} onConfirm={(edits) => doAction("edit_verify", modal.articleId, { edits })} onCancel={() => setModal(null)} />}
    </div>
  );
}
