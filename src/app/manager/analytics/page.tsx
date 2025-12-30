"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  totalQuestions: number;
  questionsToday: number;
  avgResponseTime: number;
  timeSaved: number;
  topQuestions: Array<{ question: string; count: number }>;
  questionsByDay: Record<string, number>;
  questionsByHour: Record<number, number>;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetch(`/api/analytics/stats?companyId=demo&days=${days}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
        <div className="text-center text-white text-xl">Loading analytics...</div>
      </main>
    );
  }

  const hourlyData = stats?.questionsByHour || {};
  const maxHourly = Math.max(...Object.values(hourlyData), 1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-white/70">Worker engagement & ROI metrics</p>
          </div>
          <div className="flex gap-4">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <Link
              href="/manager"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              ← Back
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-2xl p-6">
            <div className="text-blue-400 text-sm font-semibold mb-2">TOTAL QUESTIONS</div>
            <div className="text-white text-4xl font-bold">{stats?.totalQuestions || 0}</div>
            <div className="text-white/60 text-sm mt-2">Last {days} days</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 rounded-2xl p-6">
            <div className="text-emerald-400 text-sm font-semibold mb-2">TIME SAVED</div>
            <div className="text-white text-4xl font-bold">
              {Math.floor((stats?.timeSaved || 0) / 60)}h {(stats?.timeSaved || 0) % 60}m
            </div>
            <div className="text-white/60 text-sm mt-2">@ 5 min per question</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-2xl p-6">
            <div className="text-purple-400 text-sm font-semibold mb-2">QUESTIONS TODAY</div>
            <div className="text-white text-4xl font-bold">{stats?.questionsToday || 0}</div>
            <div className="text-white/60 text-sm mt-2">
              {stats?.totalQuestions && stats.questionsToday
                ? `${Math.round((stats.questionsToday / stats.totalQuestions) * 100)}% of total`
                : "0% of total"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-400/30 rounded-2xl p-6">
            <div className="text-orange-400 text-sm font-semibold mb-2">AVG RESPONSE</div>
            <div className="text-white text-4xl font-bold">{stats?.avgResponseTime || 0}ms</div>
            <div className="text-white/60 text-sm mt-2">Ultra-fast AI responses</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">💰 ROI Calculator</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-white/70 text-sm mb-2">Manager Time Saved</div>
              <div className="text-white text-3xl font-bold">
                {Math.floor((stats?.timeSaved || 0) / 60)} hours
              </div>
            </div>
            <div>
              <div className="text-white/70 text-sm mb-2">Cost Savings (@ $50/hr)</div>
              <div className="text-emerald-400 text-3xl font-bold">
                ${Math.round(((stats?.timeSaved || 0) / 60) * 50)}
              </div>
            </div>
            <div>
              <div className="text-white/70 text-sm mb-2">Questions Answered</div>
              <div className="text-white text-3xl font-bold">{stats?.totalQuestions || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Most Asked Questions</h2>
          {stats?.topQuestions && stats.topQuestions.length > 0 ? (
            <div className="space-y-4">
              {stats.topQuestions.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-white/40 font-mono text-sm w-8">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-white mb-2">{item.question}</div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                        style={{
                          width: `${(item.count / stats.topQuestions[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-white/70 font-semibold">{item.count}x</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              No questions asked yet. Workers will start asking questions soon!
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">⏰ Activity by Hour</h2>
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 24 }, (_, hour) => {
              const count = hourlyData[hour] || 0;
              const height = maxHourly > 0 ? (count / maxHourly) * 100 : 0;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 flex items-end w-full">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-emerald-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${hour}:00 - ${count} questions`}
                    />
                  </div>
                  <div className="text-white/40 text-xs">{hour}</div>
                </div>
              );
            })}
          </div>
          <div className="text-white/50 text-sm text-center mt-4">
            Peak hours:{" "}
            {Object.entries(hourlyData).length > 0
              ? Object.entries(hourlyData)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([h]) => `${h}:00`)
                  .join(", ")
              : "N/A"}
          </div>
        </div>
      </div>
    </main>
  );
}
