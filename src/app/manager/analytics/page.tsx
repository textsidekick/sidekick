"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  TrendingUp, 
  Globe,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Question {
  question: string;
  answer: string;
  language: string;
  confidence: number;
  timestamp: string;
}

interface Stats {
  totalQuestions: number;
  todayCount: number;
  avgConfidence: number;
  byLanguage: Record<string, number>;
  byCategory?: Record<string, number>;
  recent: Question[];
  lowConfidence: Question[];
}

export default function ManagerAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    const res = await fetch("/api/analytics/stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const langNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    zh: "Chinese",
    ko: "Korean",
    vi: "Vietnamese",
    tl: "Tagalog",
    hi: "Hindi",
    ar: "Arabic",
  };

  const langColors: Record<string, string> = {
    en: "bg-blue-500",
    es: "bg-amber-500",
    zh: "bg-red-500",
    ko: "bg-purple-500",
    vi: "bg-green-500",
    tl: "bg-pink-500",
    hi: "bg-orange-500",
    ar: "bg-teal-500",
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const totalLangQuestions = stats?.byLanguage 
    ? Object.values(stats.byLanguage).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-zinc-900">Sidekick</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href="/manager" 
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/manager/upload" 
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Documents
                </Link>
                <Link 
                  href="/manager/analytics" 
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                >
                  Analytics
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">M</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
              <Link href="/manager" className="hover:text-zinc-600">Dashboard</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-zinc-600">Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
            <p className="text-zinc-500 mt-1">Track worker questions, confidence levels, and language trends.</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-zinc-900">{stats.totalQuestions}</p>
                <p className="text-sm text-zinc-500">Total Questions</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-zinc-900">{stats.todayCount}</p>
                <p className="text-sm text-zinc-500">Today</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stats.avgConfidence >= 80 
                      ? "bg-green-100" 
                      : stats.avgConfidence >= 50 
                        ? "bg-yellow-100" 
                        : "bg-red-100"
                  }`}>
                    {stats.avgConfidence >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : stats.avgConfidence >= 50 ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
                <p className="text-3xl font-bold text-zinc-900">{stats.avgConfidence}%</p>
                <p className="text-sm text-zinc-500">Avg Confidence</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-zinc-900">
                  {Object.keys(stats.byLanguage || {}).length}
                </p>
                <p className="text-sm text-zinc-500">Languages</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Questions List - 2 columns */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl">
                <div className="p-5 border-b border-zinc-200">
                  <h2 className="font-semibold text-zinc-900">All Questions</h2>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-100">
                  {stats.recent && stats.recent.length > 0 ? (
                    stats.recent.map((q, i) => (
                      <div key={i} className="p-4 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            q.confidence >= 80 
                              ? "bg-green-500" 
                              : q.confidence >= 50 
                                ? "bg-yellow-500" 
                                : "bg-red-500"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900">{q.question}</p>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{q.answer}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                q.confidence >= 80 
                                  ? "bg-green-100 text-green-700" 
                                  : q.confidence >= 50 
                                    ? "bg-yellow-100 text-yellow-700" 
                                    : "bg-red-100 text-red-700"
                              }`}>
                                {q.confidence}% confidence
                              </span>
                              <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {langNames[q.language] || q.language}
                              </span>
                              <span className="text-xs text-zinc-400">
                                {formatTime(q.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                      <p className="text-zinc-500">No questions yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Language Breakdown */}
                <div className="bg-white border border-zinc-200 rounded-xl">
                  <div className="p-5 border-b border-zinc-200">
                    <h2 className="font-semibold text-zinc-900">Language Breakdown</h2>
                  </div>
                  
                  <div className="p-5">
                    {stats.byLanguage && Object.keys(stats.byLanguage).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(stats.byLanguage)
                          .sort(([,a], [,b]) => b - a)
                          .map(([lang, count]) => (
                            <div key={lang}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-zinc-700">
                                  {langNames[lang] || lang}
                                </span>
                                <span className="text-sm text-zinc-500">{count}</span>
                              </div>
                              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${langColors[lang] || "bg-zinc-400"} rounded-full transition-all`}
                                  style={{ width: `${(count / totalLangQuestions) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 text-center py-4">No data yet</p>
                    )}
                  </div>
                </div>

                {/* Low Confidence Alerts */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="p-5 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h2 className="font-semibold text-amber-900">Low Confidence Alerts</h2>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {stats.lowConfidence && stats.lowConfidence.length > 0 ? (
                      <div className="space-y-3">
                        {stats.lowConfidence.slice(0, 5).map((q, i) => (
                          <div key={i} className="p-3 bg-white/60 rounded-lg">
                            <p className="text-sm text-amber-900 line-clamp-2">{q.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                {q.confidence}%
                              </span>
                              <span className="text-xs text-amber-600">
                                {formatTime(q.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        <p className="text-xs text-amber-700 mt-4">
                          💡 Consider adding more documentation to improve answers for these topics.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-amber-800">All answers had good confidence!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-blue-900">AI Insights</h2>
                  </div>
                  
                  <div className="space-y-3 text-sm text-blue-800">
                    {stats.totalQuestions > 0 ? (
                      <>
                        <p>
                          📊 Your team has asked <strong>{stats.totalQuestions}</strong> questions
                          {stats.todayCount > 0 && <>, <strong>{stats.todayCount}</strong> today</>}.
                        </p>
                        
                        {Object.keys(stats.byLanguage || {}).length > 1 && (
                          <p>
                            🌍 Questions received in <strong>{Object.keys(stats.byLanguage).length}</strong> languages.
                            Your multilingual workforce is being supported.
                          </p>
                        )}
                        
                        {stats.avgConfidence >= 80 ? (
                          <p>
                            ✅ Great job! Your average confidence of <strong>{stats.avgConfidence}%</strong> indicates 
                            your documentation is comprehensive.
                          </p>
                        ) : stats.avgConfidence >= 50 ? (
                          <p>
                            ⚠️ Your average confidence of <strong>{stats.avgConfidence}%</strong> could be improved.
                            Consider adding more detailed documentation.
                          </p>
                        ) : (
                          <p>
                            🔴 Low average confidence of <strong>{stats.avgConfidence}%</strong>.
                            Your team needs better documentation to get accurate answers.
                          </p>
                        )}
                      </>
                    ) : (
                      <p>Insights will appear as your team uses Sidekick.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-600 font-medium">No analytics data yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Data will appear when workers start asking questions via SMS
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">© 2026 Sidekick AI</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-zinc-400 hover:text-zinc-600">Privacy</Link>
              <Link href="/terms" className="text-sm text-zinc-400 hover:text-zinc-600">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
