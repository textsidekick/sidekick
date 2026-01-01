"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

interface Analytics {
  summary: {
    totalQuestions: number;
    answeredQuestions: number;
    answerRate: number;
    avgConfidence: number;
    timeSaved: number;
    costSaved: number;
  };
  dailyData: Array<{ date: string; questions: number }>;
  topics: Array<{ topic: string; count: number; percent: number }>;
  gaps: Array<{ topic: string; count: number; avgConfidence: number }>;
  recentQuestions: Array<{
    id: string;
    question: string;
    confidence: number;
    topic: string;
    worker: string;
    timestamp: string;
    answered: boolean;
  }>;
}

const topicColors: Record<string, string> = {
  "Safety": "bg-red-500",
  "Schedule": "bg-blue-500",
  "HR & Benefits": "bg-green-500",
  "Equipment": "bg-yellow-500",
  "Reporting": "bg-purple-500",
  "Contacts": "bg-pink-500",
  "General": "bg-gray-400",
};

export default function ManagerDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "gaps">("overview");
  const [range, setRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    }
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const maxQuestions = Math.max(...analytics.dailyData.map(d => d.questions), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-gray-900 text-xl font-bold">Sidekick</span>
            <span className="text-gray-400 text-sm ml-2">Analytics</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/qa" className="text-gray-600 hover:text-gray-900 text-sm">Q&A Demo</Link>
            <Link href="/worker" className="text-gray-600 hover:text-gray-900 text-sm">Worker View</Link>
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-medium">JD</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time insights from worker questions</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: "overview", label: "Overview" },
            { id: "questions", label: "Questions" },
            { id: "gaps", label: "Training Gaps" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">💬</span>
                  <span className="text-sm font-medium text-green-600">Live</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.summary.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm font-medium text-green-600">{analytics.summary.answerRate}%</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.summary.answeredQuestions}</div>
                <div className="text-sm text-gray-600">Successfully Answered</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.summary.timeSaved} min</div>
                <div className="text-sm text-gray-600">Supervisor Time Saved</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">${analytics.summary.costSaved}</div>
                <div className="text-sm text-gray-600">Estimated Savings</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Questions This Week</h3>
                <div className="flex items-end justify-between h-48 gap-2">
                  {analytics.dailyData.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "160px" }}>
                        <div
                          className="absolute bottom-0 w-full bg-sky-500 rounded-t-lg transition-all hover:bg-sky-600"
                          style={{ height: `${(day.questions / maxQuestions) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{day.date}</span>
                      <span className="text-xs text-gray-400">{day.questions}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Topics</h3>
                <div className="space-y-4">
                  {analytics.topics.slice(0, 6).map((topic) => (
                    <div key={topic.topic}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{topic.topic}</span>
                        <span className="text-gray-500">{topic.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${topicColors[topic.topic] || "bg-gray-400"} rounded-full`}
                          style={{ width: `${topic.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Questions</h3>
                <button
                  onClick={() => setActiveTab("questions")}
                  className="text-sky-500 hover:text-sky-600 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {analytics.recentQuestions.slice(0, 5).map((q) => (
                  <div key={q.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{q.question}</p>
                      <p className="text-sm text-gray-500 mt-1">{q.worker} • {formatTime(q.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${topicColors[q.topic] || "bg-gray-400"} text-white`}>
                        {q.topic}
                      </span>
                      <span className={`text-sm font-medium ${q.confidence >= 80 ? "text-green-600" : q.confidence >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                        {q.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "questions" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Questions</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {analytics.recentQuestions.map((q) => (
                <div key={q.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{q.question}</p>
                    <p className="text-sm text-gray-500 mt-1">{q.worker} • {formatTime(q.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${topicColors[q.topic] || "bg-gray-400"} text-white`}>
                      {q.topic}
                    </span>
                    <span className={`text-sm font-medium ${q.confidence >= 80 ? "text-green-600" : q.confidence >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                      {q.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gaps" && (
          <div className="space-y-6">
            {analytics.gaps.length > 0 ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <h3 className="font-semibold text-amber-900">Training Gaps Detected</h3>
                      <p className="text-amber-800 text-sm mt-1">
                        These topics have low confidence scores, indicating missing or incomplete documentation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {analytics.gaps.map((gap, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <p className="text-gray-900 font-medium">{gap.topic}</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 ml-5">
                            {gap.count} low-confidence questions
                          </p>
                        </div>
                        <Link
                          href="/qa"
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Upload Docs
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="font-semibold text-green-900">No Training Gaps</h3>
                <p className="text-green-800 text-sm mt-1">
                  All questions are being answered with high confidence!
                </p>
              </div>
            )}

            {/* ROI Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{analytics.summary.timeSaved} min</div>
                  <div className="text-sm text-green-700 mt-1">Supervisor time saved</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">${analytics.summary.costSaved}</div>
                  <div className="text-sm text-blue-700 mt-1">Estimated cost savings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">{analytics.summary.avgConfidence}%</div>
                  <div className="text-sm text-purple-700 mt-1">Average confidence</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
