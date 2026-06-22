"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Wrench, Clock, Hash, ChevronDown, ChevronUp } from "lucide-react";

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
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? articles.filter(
        (a) =>
          a.title?.toLowerCase().includes(search.toLowerCase()) ||
          a.problem?.toLowerCase().includes(search.toLowerCase()) ||
          a.solution?.toLowerCase().includes(search.toLowerCase()) ||
          a.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : articles;

  return (
    <>
      <TopBar />
      <OpsNav />
      <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader title="Knowledge Base" subtitle="Auto-captured operational intelligence from resolved work orders" />

          {/* Hero stat */}
          <div className="mt-6 flex items-center gap-6">
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C96442]/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#C96442]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{articles.length}</div>
                <div className="text-sm text-gray-500">Knowledge articles captured</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge base — e.g. 'spindle vibration', 'hydraulic leak', 'conveyor belt'..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C96442]/30 focus:border-[#C96442]"
            />
          </div>

          {/* Articles */}
          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading knowledge base...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No knowledge articles yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Knowledge articles are automatically created when work orders are resolved. Complete some work orders and check back!
                </p>
              </div>
            ) : (
              filtered.map((article) => (
                <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === article.id ? null : article.id)}
                    className="w-full px-5 py-4 flex items-start justify-between text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{article.title}</span>
                        {article.equipment_type && (
                          <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">{article.problem}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {article.asset_name && (
                          <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{article.asset_name}</span>
                        )}
                        {article.time_estimate_minutes && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.time_estimate_minutes}m</span>
                        )}
                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" />Referenced {article.times_referenced || 0}x</span>
                        {article.source_work_order_id && (
                          <span className="text-[#C96442]">Auto-captured</span>
                        )}
                      </div>
                      {article.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {article.tags.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {expanded === article.id ? <ChevronUp className="w-5 h-5 text-gray-400 mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />}
                  </button>

                  {expanded === article.id && (
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
                            {article.parts_used.map((p) => (
                              <span key={p} className="text-xs px-2 py-1 bg-orange-50 text-[#C96442] rounded">{p}</span>
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
      </div>
    </>
  );
}
