"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Plus, ChevronRight } from "lucide-react";

interface Gap {
  question: string;
  count: number;
  lastAsked: string;
  examples: string[];
}

interface Props {
  companyId: string;
}

const DEMO_GAPS: Gap[] = [
  { question: "What's the overtime policy for weekends?", count: 12, lastAsked: new Date().toISOString(), examples: [] },
  { question: "How do I submit an expense report?", count: 8, lastAsked: new Date().toISOString(), examples: [] },
  { question: "Where are the Material Safety Data Sheets?", count: 6, lastAsked: new Date().toISOString(), examples: [] },
  { question: "What's the process for reporting a workplace injury?", count: 5, lastAsked: new Date().toISOString(), examples: [] },
  { question: "Can I swap shifts with another worker?", count: 4, lastAsked: new Date().toISOString(), examples: [] },
];

export default function KnowledgeGapAlerts({ companyId }: Props) {
  const [gaps, setGaps] = useState<Gap[]>(DEMO_GAPS);
  const [totalGaps, setTotalGaps] = useState(35);

  useEffect(() => {
    fetch(`/api/knowledge-gaps?companyId=${encodeURIComponent(companyId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.gaps?.length) {
          setGaps(d.gaps);
          setTotalGaps(d.totalGaps);
        }
      })
      .catch(() => {});
  }, [companyId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Knowledge Gaps</h3>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{totalGaps} unanswered</span>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {gaps.slice(0, 5).map((gap, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800 truncate">"{gap.question}"</p>
              <p className="text-xs text-gray-400 mt-0.5">Asked {gap.count}x</p>
            </div>
            <button className="flex items-center gap-1 px-2.5 py-1 bg-[#C96442] text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-3">
              <Plus className="h-3 w-3" /> Add Info
            </button>
          </div>
        ))}
      </div>
      {gaps.length > 5 && (
        <div className="px-4 py-3 border-t border-gray-100 text-center">
          <button className="text-xs text-[#C96442] font-medium flex items-center gap-1 mx-auto">
            View all {totalGaps} gaps <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
