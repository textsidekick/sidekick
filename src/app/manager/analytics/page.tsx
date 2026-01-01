"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalQuestions: number;
  todayCount: number;
  avgConfidence: number;
  byLanguage: Record<string, number>;
  byCategory: Record<string, number>;
  recent: Array<{
    id: string;
    question: string;
    answer: string;
    language: string;
    confidence: number;
    timestamp: string;
  }>;
  lowConfidence: Array<{
    question: string;
    confidence: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const langFlags: Record<string, string> = { en: "US", es: "ES", zh: "CN", vi: "VN", ko: "KR", pt: "BR", fr: "FR" };
  const langNames: Record<string, string> = { en: "English", es: "Spanish", zh: "Chinese", vi: "Vietnamese", ko: "Korean", pt: "Portuguese", fr: "French" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor worker questions and identify training gaps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-blue-600">{stats?.totalQuestions || 0}</div>
            <div className="text-gray-600 text-sm">Total Questions</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600">{stats?.todayCount || 0}</div>
            <div className="text-gray-600 text-sm">Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-purple-600">{stats?.avgConfidence || 0}%</div>
            <div className="text-gray-600 text-sm">Avg Confidence</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-orange-600">{Object.keys(stats?.byLanguage || {}).length}</div>
            <div className="text-gray-600 text-sm">Languages Used</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Questions by Topic</h2>
            {stats?.byCategory && Object.keys(stats.byCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.byCategory).sort(([,a], [,b]) => b - a).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{cat}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(count / stats.totalQuestions) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm">No questions yet</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Questions by Language</h2>
            {stats?.byLanguage && Object.keys(stats.byLanguage).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.byLanguage).sort(([,a], [,b]) => b - a).map(([lang, count]) => (
                  <div key={lang}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">[{langFlags[lang]}] {langNames[lang] || lang}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(count / stats.totalQuestions) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm">No questions yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Questions</h2>
          {stats?.recent && stats.recent.length > 0 ? (
            <div className="space-y-3">
              {stats.recent.map((q) => (
                <div key={q.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-gray-800">{q.question}</p>
                  <p className="text-sm text-gray-500 mt-1">{q.answer.slice(0, 100)}...</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${q.confidence >= 80 ? "bg-green-100 text-green-700" : q.confidence >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {q.confidence}%
                    </span>
                    <span className="text-xs text-gray-400">{langNames[q.language] || q.language}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">No questions yet</p>}
        </div>
      </div>
    </div>
  );
}
