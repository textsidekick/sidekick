"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, User, MessageSquare, CheckCircle2, Loader2, ChevronRight, Sparkles } from "lucide-react";

interface TransferQuestion {
  question: string;
  category: string;
  why: string;
}

export default function KnowledgeTransferPage() {
  const [workerName, setWorkerName] = useState("");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<TransferQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const startSession = async () => {
    if (!workerName.trim()) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/knowledge/transfer");
      const data = await res.json();
      setQuestions(data.questions || []);
      setStarted(true);
    } catch {
      alert("Failed to generate questions. Try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const saveAnswer = async () => {
    const answer = answers[currentQ];
    if (!answer?.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/knowledge/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerName: workerName.trim(),
          question: questions[currentQ].question,
          answer: answer.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved((prev) => new Set(prev).add(currentQ));
        if (currentQ < questions.length - 1) {
          setCurrentQ(currentQ + 1);
        }
      }
    } catch {
      alert("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const categoryColors: Record<string, string> = {
    troubleshooting: "bg-amber-50 text-amber-700",
    procedure: "bg-blue-50 text-blue-700",
    safety: "bg-red-50 text-red-700",
    quality: "bg-green-50 text-green-700",
    vendor: "bg-purple-50 text-purple-700",
    machine_quirk: "bg-orange-50 text-[#C96442]",
  };

  return (
    <>
      <TopBar />
      <OpsNav />
      <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          {!started ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#C96442]/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-[#C96442]" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Knowledge Transfer Session</h1>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Capture what your experienced workers know before they leave. Sidekick will ask smart questions and turn their answers into permanent knowledge articles.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who are we capturing knowledge from?
                </label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Mike Thompson"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30 focus:border-[#C96442]"
                />
                <Button
                  onClick={startSession}
                  disabled={!workerName.trim() || loadingQuestions}
                  className="w-full mt-4 bg-[#C96442] hover:bg-[#a84f35] text-white"
                >
                  {loadingQuestions ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating questions...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Start Knowledge Capture</>
                  )}
                </Button>
              </div>

              <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">How it works</h3>
                <div className="space-y-3">
                  {[
                    "Sidekick generates smart questions based on your equipment and existing knowledge gaps",
                    "Sit with the experienced worker and go through each question together",
                    "Type their answers — Sidekick converts them into searchable knowledge articles",
                    "Future workers can access this knowledge by texting Sidekick or browsing the Knowledge Base",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <SectionHeader
                title={`Knowledge Transfer: ${workerName}`}
                subtitle={`Question ${currentQ + 1} of ${questions.length} · ${saved.size} articles captured`}
              />

              {/* Progress */}
              <div className="mt-4 flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      saved.has(i)
                        ? "bg-green-400"
                        : i === currentQ
                        ? "bg-[#C96442]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Question card */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={categoryColors[questions[currentQ]?.category] || "bg-gray-50 text-gray-600"}>
                    {questions[currentQ]?.category?.replace("_", " ")}
                  </Badge>
                  {saved.has(currentQ) && (
                    <Badge className="bg-green-50 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Saved
                    </Badge>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {questions[currentQ]?.question}
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Why this matters: {questions[currentQ]?.why}
                </p>

                <textarea
                  value={answers[currentQ] || ""}
                  onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                  placeholder={`Type ${workerName}'s answer here... Be as detailed as possible.`}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30 focus:border-[#C96442] resize-none"
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    {currentQ > 0 && (
                      <Button variant="outline" onClick={() => setCurrentQ(currentQ - 1)} size="sm">
                        Previous
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentQ < questions.length - 1 && (
                      <Button variant="outline" onClick={() => setCurrentQ(currentQ + 1)} size="sm">
                        Skip <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                    <Button
                      onClick={saveAnswer}
                      disabled={!answers[currentQ]?.trim() || saving}
                      className="bg-[#C96442] hover:bg-[#a84f35] text-white"
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                      ) : saved.has(currentQ) ? (
                        "Update & Next"
                      ) : (
                        "Save & Next"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Completion */}
              {saved.size === questions.length && (
                <div className="mt-6 bg-green-50 rounded-xl border border-green-200 p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900 text-lg">Knowledge Transfer Complete!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    {saved.size} knowledge articles have been captured from {workerName}. These are now searchable by all workers via Sidekick.
                  </p>
                  <div className="flex justify-center gap-3 mt-4">
                    <Button variant="outline" onClick={() => window.location.href = "/knowledge"}>
                      View Knowledge Base
                    </Button>
                    <Button onClick={() => { setStarted(false); setWorkerName(""); setAnswers({}); setSaved(new Set()); setCurrentQ(0); }} className="bg-[#C96442] hover:bg-[#a84f35] text-white">
                      Start Another Session
                    </Button>
                  </div>
                </div>
              )}

              {/* Question navigator */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-medium text-gray-500 mb-2">All Questions</div>
                <div className="space-y-1">
                  {questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                        i === currentQ ? "bg-[#C96442]/10 text-[#C96442]" : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {saved.has(i) ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className="truncate">{q.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
