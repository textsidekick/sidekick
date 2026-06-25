"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Analytics = {
  period: { days: number; since: string };
  workOrders: {
    total: number;
    completed: number;
    completionRate: number;
    byPriority: Record<string, number>;
    mttr: number;
  };
  assets: {
    total: number;
    avgHealthScore: number;
    byStatus: Record<string, number>;
    mtbf: number;
  };
  pm: { completions: number };
  healthTrend: { week: string; avgHealth: number }[];
};

function MetricCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  async function load(d: number) {
    setLoading(true);
    const res = await fetch(`/api/ops-analytics?days=${d}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(days); }, [days]);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Period (days)", String(days)],
      ["Total Work Orders", String(data.workOrders.total)],
      ["Completed WOs", String(data.workOrders.completed)],
      ["WO Completion Rate (%)", String(data.workOrders.completionRate)],
      ["MTTR (hours)", String(data.workOrders.mttr)],
      ["Total Assets", String(data.assets.total)],
      ["Avg Health Score", String(data.assets.avgHealthScore)],
      ["MTBF (hours)", String(data.assets.mtbf)],
      ["PM Completions", String(data.pm.completions)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${days}d-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxHealth = data ? Math.max(...data.healthTrend.map((h) => h.avgHealth), 1) : 100;

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <TopBar />
      <OpsNav />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#C96442]" /> Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">Operational performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400 py-20 text-center">Loading analytics…</div>
        ) : !data ? (
          <div className="text-gray-400 py-20 text-center">Failed to load analytics.</div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="MTTR"
                value={`${data.workOrders.mttr}h`}
                sub="Mean time to resolve"
                icon={Clock}
                color="bg-blue-50 text-blue-600"
              />
              <MetricCard
                label="MTBF"
                value={`${data.assets.mtbf}h`}
                sub="Mean time between failures"
                icon={TrendingUp}
                color="bg-green-50 text-green-600"
              />
              <MetricCard
                label="WO Completion"
                value={`${data.workOrders.completionRate}%`}
                sub={`${data.workOrders.completed} / ${data.workOrders.total} orders`}
                icon={CheckCircle}
                color="bg-amber-50 text-amber-600"
              />
              <MetricCard
                label="Avg Asset Health"
                value={`${data.assets.avgHealthScore}`}
                sub={`${data.assets.total} assets tracked`}
                icon={AlertTriangle}
                color="bg-red-50 text-red-600"
              />
            </div>

            {/* Work Orders section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Work Orders by Priority</h2>
                <div className="space-y-3">
                  {Object.entries(data.workOrders.byPriority).map(([p, count]) => (
                    <div key={p} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 capitalize">{p}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-[#C96442]"
                          style={{ width: `${Math.min((count / data.workOrders.total) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  ))}
                  {Object.keys(data.workOrders.byPriority).length === 0 && (
                    <p className="text-sm text-gray-400">No work orders in this period.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Asset Status</h2>
                <div className="space-y-3">
                  {Object.entries(data.assets.byStatus).map(([status, count]) => {
                    const color = status === "operational" ? "bg-green-400" : status === "degraded" ? "bg-amber-400" : status === "down" ? "bg-red-400" : "bg-gray-400";
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24 capitalize">{status}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min((count / data.assets.total) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">PM Completions (period): <span className="font-semibold text-gray-800">{data.pm.completions}</span></p>
                </div>
              </div>
            </div>

            {/* Health trend chart */}
            {data.healthTrend.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Asset Health Trend (avg by week)</h2>
                <div className="flex items-end gap-2 h-32">
                  {data.healthTrend.map((point) => (
                    <div key={point.week} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400">{Math.round(point.avgHealth)}</span>
                      <div
                        className="w-full rounded-t bg-[#C96442] opacity-80 transition-all"
                        style={{ height: `${(point.avgHealth / maxHealth) * 100}px`, minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-gray-400 truncate w-full text-center">{point.week.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
