"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Upload, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Globe,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  chunks?: string[];
  classification?: {
    type: string;
    title: string;
    confidence: number;
  };
}

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
  recent: Question[];
  lowConfidence: Question[];
}

export default function ManagerDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then(r => r.json()),
      fetch("/api/analytics/stats").then(r => r.json()).catch(() => null)
    ]).then(([docsData, statsData]) => {
      setDocuments(docsData.documents || []);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  const typeIcons: Record<string, string> = {
    handbook: "📘",
    safety_manual: "🦺",
    shift_schedule: "📅",
    payroll_info: "💰",
    training_material: "🎓",
    equipment_manual: "⚙️",
    emergency_procedures: "🚨",
    other: "📄",
  };

  const langNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    zh: "Chinese",
    ko: "Korean",
    vi: "Vietnamese",
    tl: "Tagalog",
  };

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
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
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
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Welcome back</h1>
          <p className="text-zinc-500">Here's what's happening with your team today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats?.totalQuestions || 0}</p>
                <p className="text-sm text-zinc-500">Total Questions</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats?.todayCount || 0}</p>
                <p className="text-sm text-zinc-500">Today</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{documents.length}</p>
                <p className="text-sm text-zinc-500">Documents</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats?.avgConfidence || 0}%</p>
                <p className="text-sm text-zinc-500">Avg Confidence</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Questions - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl">
                <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-zinc-900">Recent Questions</h2>
                  </div>
                  <Link 
                    href="/manager/analytics" 
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="divide-y divide-zinc-100">
                  {stats?.recent && stats.recent.length > 0 ? (
                    stats.recent.slice(0, 5).map((q, i) => (
                      <div key={i} className="p-4 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-900 font-medium truncate">{q.question}</p>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{q.answer.slice(0, 100)}...</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              q.confidence >= 80 
                                ? "bg-green-100 text-green-700" 
                                : q.confidence >= 50 
                                  ? "bg-yellow-100 text-yellow-700" 
                                  : "bg-red-100 text-red-700"
                            }`}>
                              {q.confidence}%
                            </span>
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {langNames[q.language] || q.language}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500 text-sm">No questions yet</p>
                      <p className="text-zinc-400 text-xs mt-1">Questions will appear here when workers ask via SMS</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Documents */}
                <div className="bg-white border border-zinc-200 rounded-xl">
                  <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <h2 className="font-semibold text-zinc-900">Documents</h2>
                    </div>
                    <Link 
                      href="/manager/upload" 
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Link>
                  </div>
                  
                  <div className="divide-y divide-zinc-100">
                    {documents.length > 0 ? (
                      documents.slice(0, 4).map((doc) => (
                        <div key={doc.id} className="p-4 hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {typeIcons[doc.classification?.type || "other"]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-900 truncate">{doc.name}</p>
                              <p className="text-xs text-zinc-400">
                                {doc.classification?.title || "Processing..."}
                              </p>
                            </div>
                            {doc.classification && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-zinc-500 text-sm">No documents yet</p>
                        <Link 
                          href="/manager/upload"
                          className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Upload className="w-4 h-4" /> Upload your first document
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="p-5 border-b border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="font-semibold text-blue-900">AI Insights</h2>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    {stats?.lowConfidence && stats.lowConfidence.length > 0 ? (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Training Gap Detected</p>
                            <p className="text-xs text-blue-700 mt-1">
                              {stats.lowConfidence.length} question{stats.lowConfidence.length > 1 ? 's' : ''} had low confidence. Consider adding more documentation.
                            </p>
                          </div>
                        </div>
                        
                        {Object.keys(stats.byLanguage || {}).length > 1 && (
                          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                            <Globe className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Multilingual Team</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Questions received in {Object.keys(stats.byLanguage).length} languages
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-blue-700">Insights will appear as your team uses Sidekick</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5">
                  <h3 className="font-semibold text-zinc-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      href="/manager/upload"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Upload className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-zinc-700">Upload Documents</span>
                    </Link>
                    <Link
                      href="/manager/analytics"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-zinc-700">View Analytics</span>
                    </Link>
                    <Link
                      href="/qa"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-zinc-700">Test Q&A</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
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
