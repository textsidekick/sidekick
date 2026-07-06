"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import GeneratedReports from "@/components/dashboard/documents/GeneratedReports";
import KnowledgeBaseViewer from "@/components/dashboard/documents/KnowledgeBaseViewer";

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

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
        Rejected
      </span>
    );
  }

  if (article.source_work_order_id) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
        Auto-generated · Needs Review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
      <CheckCircle2 className="h-3 w-3" /> Verified
    </span>
  );
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");

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

  const needsReview = articles.filter((article) => !!article.source_work_order_id);
  const filtered = articles.filter((article) =>
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

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F3EC]">
            <BookOpen className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{articles.length}</div>
            <div className="text-sm text-gray-500">Procedures & fixes documented</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/60 px-6 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
            <Sparkles className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{needsReview.length}</div>
            <div className="text-sm text-gray-500">Generated items waiting on review</div>
          </div>
        </div>
      </div>

      {needsReview.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{needsReview.length} items need review.</span> Auto-generated knowledge is reviewed separately before it reaches the team.
          </div>
          <a
            href="/review-queue"
            className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-amber-50"
          >
            Open Review Queue
          </a>
        </div>
      )}

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
            <p className="font-semibold text-gray-700">No procedures captured yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
              Once your team uploads docs, texts fixes in, or confirms generated knowledge, it will show up here.
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
