"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, GraduationCap, Lightbulb, Loader2 } from "lucide-react";

interface SkillGapReport {
  topKnowledgeGaps: { topic: string; questionCount: number; sampleQuestions: string[] }[];
  documentationGaps: { topic: string; description: string; suggestedAction: string }[];
  workerTrainingNeeds: { workerName: string; topics: string[]; questionCount: number }[];
  recommendations: string[];
}

export default function SkillGapsPage() {
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/skill-gaps")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setReport(d);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar />
      <OpsNav />
      <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader title="Skill Gap Analysis" subtitle="AI-powered analysis of workforce knowledge gaps and training needs" />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#C96442]" />
              <span className="ml-3 text-gray-500">Analyzing worker questions and operational data...</span>
            </div>
          ) : error ? (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{error === "unauthorized" ? "Please log in to view skill gap analysis" : error}</p>
            </div>
          ) : report ? (
            <div className="mt-6 space-y-6">

              {/* Top Knowledge Gaps */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">Top Knowledge Gaps</h3>
                  <span className="text-xs text-gray-400">Topics workers ask about most</span>
                </div>
                {report.topKnowledgeGaps.length > 0 ? (
                  <div className="space-y-3">
                    {report.topKnowledgeGaps.map((gap, i) => (
                      <div key={i} className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                          {gap.questionCount}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{gap.topic}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {gap.sampleQuestions?.slice(0, 2).map((q, j) => (
                              <span key={j} className="block">"{q}"</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No significant knowledge gaps detected yet.</p>
                )}
              </div>

              {/* Documentation Gaps */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">Documentation Gaps</h3>
                  <span className="text-xs text-gray-400">Topics where Sidekick can&apos;t answer well</span>
                </div>
                {report.documentationGaps.length > 0 ? (
                  <div className="space-y-3">
                    {report.documentationGaps.map((gap, i) => (
                      <div key={i} className="py-3 border-b border-gray-50 last:border-0">
                        <div className="font-medium text-gray-900 text-sm">{gap.topic}</div>
                        <p className="text-xs text-gray-500 mt-1">{gap.description}</p>
                        <div className="mt-2">
                          <Badge className="bg-[#C96442]/10 text-[#C96442] text-xs">{gap.suggestedAction}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No documentation gaps found.</p>
                )}
              </div>

              {/* Worker Training Needs */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Worker Training Needs</h3>
                  <span className="text-xs text-gray-400">Workers who may benefit from additional training</span>
                </div>
                {report.workerTrainingNeeds.length > 0 ? (
                  <div className="space-y-3">
                    {report.workerTrainingNeeds.map((worker, i) => (
                      <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {worker.workerName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{worker.workerName}</div>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {worker.topics?.map((t, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">{worker.questionCount} questions</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No individual training needs identified yet.</p>
                )}
              </div>

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-[#C96442]" />
                    <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
                  </div>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <div className="w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
