"use client";

import React, { useEffect, useState } from "react";
import { readDashboardScope } from "@/lib/dashboard-scope";
import {
  FileText, HelpCircle, AlertTriangle, GraduationCap, Building2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KmMetrics {
  totalSops: number;
  activeSops: number;
  totalQuestions: number;
  answeredQuestions: number;
  openGaps: number;
  closedGaps: number;
  trainingCompletionPct: number;
  totalEnrollments: number;
  completedEnrollments: number;
  departmentScores: {
    id: string;
    name: string;
    color: string;
    sopCount: number;
    openGapCount: number;
  }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-4 w-4", accent || "text-gray-400")} />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function KmMetricsSection({ companyId }: { companyId: string }) {
  const [metrics, setMetrics] = useState<KmMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/km/metrics?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading knowledge metrics...
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Knowledge Management Overview</h2>
        <p className="text-xs text-gray-400">Knowledge base status</p>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Active SOPs"
          value={metrics.activeSops}
          sub={`${metrics.totalSops} total procedures`}
          accent="text-[#0060F0]"
        />
        <StatCard
          icon={HelpCircle}
          label="Questions Answered"
          value={metrics.answeredQuestions}
          sub={`of ${metrics.totalQuestions} total`}
          accent="text-blue-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Knowledge Gaps"
          value={metrics.openGaps}
          sub={`${metrics.closedGaps} resolved`}
          accent="text-amber-500"
        />
        <StatCard
          icon={GraduationCap}
          label="Training Completion"
          value={`${metrics.trainingCompletionPct}%`}
          sub={`${metrics.completedEnrollments} / ${metrics.totalEnrollments} enrolled`}
          accent="text-green-600"
        />
      </div>

      {/* Department KM scores */}
      {metrics.departmentScores?.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Department Scores
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {(metrics.departmentScores || []).map((dept) => (
              <div
                key={dept.id}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-700 truncate">{dept.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <span className="font-bold text-gray-800">{dept.sopCount}</span> SOPs
                  </span>
                  {dept.openGapCount > 0 ? (
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {dept.openGapCount} gaps
                    </span>
                  ) : (
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      No gaps
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export the manager dashboard below the KM metrics
import ManagerDashboard from "../manager/page";

export default function TodayPage() {
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    try {
      const scope = readDashboardScope();
      if (scope.companyId) setCompanyId(scope.companyId);
    } catch {}
    const handleStorage = () => {
      try {
        const scope = readDashboardScope();
        if (scope.companyId) setCompanyId(scope.companyId);
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <>
      {/* KM Metrics injected above the main manager dashboard */}
      {companyId && (
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <KmMetricsSection companyId={companyId} />
        </div>
      )}
      <ManagerDashboard />
    </>
  );
}
