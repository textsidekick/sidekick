"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Wrench,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Link2,
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
      ? "bg-red-100 text-gray-700 border-red-200"
      : level === "medium"
        ? "bg-amber-100 text-gray-700 border-amber-200"
        : "bg-green-100 text-gray-700 border-green-200";

  return (
    <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", cls)}>
      {level} risk
    </span>
  );
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [reviewItems, setReviewItems] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [reviewExpanded, setReviewExpanded] = useState(false);

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
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!companyId) return;
    setLoadingReview(true);
    fetch(`/api/knowledge/review?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setReviewItems(d.items || []))
      .catch(() => setReviewItems([]))
      .finally(() => setLoadingReview(false));
  }, [companyId]);

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

  const filtered = visibleArticles.filter((article) =>
    search.trim()
      ? article.title?.toLowerCase().includes(search.toLowerCase()) ||
        article.problem?.toLowerCase().includes(search.toLowerCase()) ||
        article.solution?.toLowerCase().includes(search.toLowerCase()) ||
        article.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      : true,
  );

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader
        title="Operational Knowledge"
        subtitle="Review the procedures, fixes, and operating memory Sidekick can use across your team."
      />

      {loadingReview ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-400 shadow-sm">
          Loading review queue…
        </div>
      ) : reviewItems.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          <button
            onClick={() => setReviewExpanded((value) => !value)}
            className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">Review auto-generated knowledge</h2>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {reviewItems.length} pending
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Approve auto-generated knowledge before it gets added to your team knowledge base.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/review-queue"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-amber-50"
              >
                Open full queue <ArrowRight className="h-4 w-4" />
              </a>
              {reviewExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </div>
          </button>

          {reviewExpanded && (
            <div className="space-y-3 border-t border-amber-100 bg-[#FFFCF6] p-4">
              {reviewItems.slice(0, 3).map((article) => {
                const risk = reviewRisk(article);
                return (
                  <div key={article.id} className={cn("rounded-xl border bg-white p-4", risk === "high" ? "border-red-200" : risk === "medium" ? "border-amber-200" : "border-gray-200")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900">{article.title}</div>
                          {reviewRiskBadge(risk)}
                          {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{article.problem}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Needs review
                          </span>
                          {article.asset_name && (
                            <span className="inline-flex items-center gap-1">
                              <Wrench className="h-3 w-3" /> {article.asset_name}
                            </span>
                          )}
                          <span>{timeAgo(article.created_at)}</span>
                          {article.source_work_order_id && (
                            <a
                              href={`/work-orders?id=${article.source_work_order_id}`}
                              className="inline-flex items-center gap-1 text-[#C96442] underline hover:text-[#B0532F]"
                            >
                              <Link2 className="h-3 w-3" /> Source WO
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search procedures, fixes, SOPs — e.g. 'spindle vibration', 'hydraulic leak'..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 focus:border-[#C96442] focus:outline-none focus:ring-2 focus:ring-[#C96442]/30"
        />
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading knowledge base...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-[#C96442]/30" />
            <p className="font-semibold text-gray-700">No approved procedures captured yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
              Once your team uploads docs, texts fixes in, or approves generated knowledge, it will show up here.
            </p>
          </div>
        ) : (
          filtered.map((article) => (
            <div key={article.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setExpanded(expanded === article.id ? null : article.id)}
                className="flex w-full items-start justify-between px-5 py-4 text-left"
              >
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
                    {article.source_work_order_id && (
                      <a
                        href={`/work-orders?id=${article.source_work_order_id}`}
                        className="text-[#C96442] underline hover:text-[#B0532F]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source WO
                      </a>
                    )}
                  </div>
                  {article.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {expanded === article.id ? (
                  <ChevronUp className="mt-1 h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="mt-1 h-5 w-5 text-gray-400" />
                )}
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
                      <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Parts Used</div>
                      <div className="flex flex-wrap gap-2">
                        {article.parts_used.map((part) => (
                          <span key={part} className="rounded bg-orange-50 px-2 py-1 text-xs text-gray-700">
                            {part}
                          </span>
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

      <GeneratedReports companyId={companyId} />
      <KnowledgeBaseViewer companyId={companyId} />
    </div>
  );
}
