"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Upload, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Globe,
  BarChart3,
  Settings,
  Trash2,
  Loader2,
  FileUp,
  X,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  XCircle
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
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
  byCategory?: Record<string, number>;
  recent: Question[];
  lowConfidence: Question[];
}

type Tab = "overview" | "documents" | "analytics";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    const [docsRes, statsRes] = await Promise.all([
      fetch("/api/documents").then(r => r.json()).catch(() => ({ documents: [] })),
      fetch("/api/analytics/stats").then(r => r.json()).catch(() => null)
    ]);
    setDocuments(docsRes.documents || []);
    setStats(statsRes);
    setLoading(false);
    setRefreshing(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${file.name}...`);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/documents", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        setUploadProgress(`Processing ${file.name}...`);
        await new Promise(r => setTimeout(r, 500));
      } catch (err: any) {
        setError(err.message);
      }
    }
    setUploading(false);
    setUploadProgress(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const typeIcons: Record<string, string> = {
    handbook: "📘",
    safety_manual: "🦺",
    shift_schedule: "📅",
    payroll_info: "💰",
    training_material: "🎓",
    equipment_manual: "⚙️",
    emergency_procedures: "🚨",
    inventory_manifest: "📦",
    commission_sheet: "💵",
    repair_order: "🔧",
    vehicle_inventory: "🚗",
    supplier_invoice: "🧾",
    other: "📄",
  };

  const typeLabels: Record<string, string> = {
    handbook: "Employee Handbook",
    safety_manual: "Safety Manual",
    shift_schedule: "Shift Schedule",
    payroll_info: "Payroll Info",
    training_material: "Training Material",
    equipment_manual: "Equipment Manual",
    emergency_procedures: "Emergency Procedures",
    other: "Document",
  };

  const langNames: Record<string, string> = {
    en: "English", es: "Spanish", zh: "Chinese", ko: "Korean",
    vi: "Vietnamese", tl: "Tagalog", hi: "Hindi", ar: "Arabic",
  };

  const langColors: Record<string, string> = {
    en: "bg-blue-500", es: "bg-amber-500", zh: "bg-red-500", ko: "bg-purple-500",
    vi: "bg-green-500", tl: "bg-pink-500", hi: "bg-orange-500", ar: "bg-teal-500",
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
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

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "documents" as Tab, label: "Documents", icon: FileText, count: documents.length },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-zinc-900">Sidekick</span>
              </Link>
              
              <span className="text-zinc-200">|</span>
              <span className="text-sm font-medium text-zinc-600">Manager Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/qa"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Test Q&A →
              </Link>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">M</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* ==================== OVERVIEW TAB ==================== */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
                    <p className="text-zinc-500 mt-1">Here's what's happening with your team.</p>
                  </div>
                  <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{stats?.totalQuestions || 0}</p>
                    <p className="text-sm text-zinc-500">Total Questions</p>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{stats?.todayCount || 0}</p>
                    <p className="text-sm text-zinc-500">Today</p>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{documents.length}</p>
                    <p className="text-sm text-zinc-500">Documents</p>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{stats?.avgConfidence || 0}%</p>
                    <p className="text-sm text-zinc-500">Avg Confidence</p>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Recent Questions */}
                  <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl">
                    <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
                      <h2 className="font-semibold text-zinc-900">Recent Questions</h2>
                      <button 
                        onClick={() => setActiveTab("analytics")}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View all <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {stats?.recent && stats.recent.length > 0 ? (
                        stats.recent.slice(0, 5).map((q, i) => (
                          <div key={i} className="p-4 hover:bg-zinc-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-900 font-medium truncate">{q.question}</p>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{q.answer.slice(0, 80)}...</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  q.confidence >= 80 ? "bg-green-100 text-green-700" 
                                  : q.confidence >= 50 ? "bg-yellow-100 text-yellow-700" 
                                  : "bg-red-100 text-red-700"
                                }`}>
                                  {q.confidence}%
                                </span>
                                <span className="text-xs text-zinc-400">{formatTime(q.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                          <p className="text-sm text-zinc-500">No questions yet</p>
                          <p className="text-xs text-zinc-400 mt-1">Questions appear when workers text your Sidekick number</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-5">
                      <h3 className="font-semibold text-zinc-900 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab("documents")}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Upload className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-zinc-700">Upload Documents</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("analytics")}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm text-zinc-700">View Analytics</span>
                        </button>
                        <Link
                          href="/qa"
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-zinc-700">Test Q&A</span>
                        </Link>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">AI Insights</h3>
                      </div>
                      {stats?.lowConfidence && stats.lowConfidence.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 p-2 bg-white/60 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              {stats.lowConfidence.length} question{stats.lowConfidence.length > 1 ? 's' : ''} had low confidence. Consider adding more docs.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-700">Insights appear as your team uses Sidekick.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== DOCUMENTS TAB ==================== */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900">Documents</h1>
                  <p className="text-zinc-500 mt-1">Upload handbooks, safety manuals, and other documents. AI automatically classifies them.</p>
                </div>

                {/* Upload Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-10 transition-all ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-zinc-300 bg-white hover:border-blue-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                  />
                  <div className="text-center">
                    {uploading ? (
                      <>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                        <p className="text-lg font-medium text-zinc-900">{uploadProgress}</p>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                        <p className="text-lg font-medium text-zinc-900">
                          {dragActive ? "Drop files here" : "Drag and drop files"}
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                          or <span className="text-blue-600 font-medium">browse</span> to select
                        </p>
                        <p className="text-xs text-zinc-400 mt-3">PDF, TXT, DOC, DOCX • Max 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Document List */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-zinc-200">
                    <h2 className="font-semibold text-zinc-900">Uploaded Documents ({documents.length})</h2>
                  </div>
                  {documents.length > 0 ? (
                    <div className="divide-y divide-zinc-100">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-5 hover:bg-zinc-50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl">{typeIcons[doc.classification?.type || "other"]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium text-zinc-900">{doc.name}</p>
                                  {doc.classification ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm text-zinc-600">
                                        {typeLabels[doc.classification.type] || "Document"}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        doc.classification.confidence >= 0.8 ? "bg-green-100 text-green-700" 
                                        : doc.classification.confidence >= 0.5 ? "bg-yellow-100 text-yellow-700" 
                                        : "bg-zinc-100 text-zinc-600"
                                      }`}>
                                        {Math.round(doc.classification.confidence * 100)}% match
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                                      <span className="text-sm text-zinc-400">Classifying...</span>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                                <span>{formatSize(doc.size)}</span>
                                <span>•</span>
                                <span>{formatDate(doc.uploadedAt)}</span>
                                {doc.chunks && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      {doc.chunks.length} sections indexed
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                      <p className="text-zinc-600 font-medium">No documents uploaded yet</p>
                      <p className="text-sm text-zinc-400 mt-1">Upload your first document to get started</p>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for best results</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Upload your complete employee handbook</li>
                    <li>• Include safety manuals and SOPs</li>
                    <li>• PDF files with text (not scanned images) work best</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ==================== ANALYTICS TAB ==================== */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
                    <p className="text-zinc-500 mt-1">Track questions, confidence, and language trends.</p>
                  </div>
                  <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <p className="text-3xl font-bold text-zinc-900">{stats?.totalQuestions || 0}</p>
                    <p className="text-sm text-zinc-500">Total Questions</p>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <p className="text-3xl font-bold text-zinc-900">{stats?.todayCount || 0}</p>
                    <p className="text-sm text-zinc-500">Today</p>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <p className={`text-3xl font-bold ${
                      (stats?.avgConfidence || 0) >= 80 ? "text-green-600" 
                      : (stats?.avgConfidence || 0) >= 50 ? "text-yellow-600" 
                      : "text-red-600"
                    }`}>{stats?.avgConfidence || 0}%</p>
                    <p className="text-sm text-zinc-500">Avg Confidence</p>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5">
                    <p className="text-3xl font-bold text-zinc-900">{Object.keys(stats?.byLanguage || {}).length}</p>
                    <p className="text-sm text-zinc-500">Languages</p>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* All Questions */}
                  <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl">
                    <div className="p-5 border-b border-zinc-200">
                      <h2 className="font-semibold text-zinc-900">All Questions</h2>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto divide-y divide-zinc-100">
                      {stats?.recent && stats.recent.length > 0 ? (
                        stats.recent.map((q, i) => (
                          <div key={i} className="p-4 hover:bg-zinc-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                q.confidence >= 80 ? "bg-green-500" 
                                : q.confidence >= 50 ? "bg-yellow-500" 
                                : "bg-red-500"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900">{q.question}</p>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{q.answer}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    q.confidence >= 80 ? "bg-green-100 text-green-700" 
                                    : q.confidence >= 50 ? "bg-yellow-100 text-yellow-700" 
                                    : "bg-red-100 text-red-700"
                                  }`}>{q.confidence}%</span>
                                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                                    <Globe className="w-3 h-3" />{langNames[q.language] || q.language}
                                  </span>
                                  <span className="text-xs text-zinc-400">{formatTime(q.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                          <p className="text-sm text-zinc-500">No questions yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Language Breakdown */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-5">
                      <h3 className="font-semibold text-zinc-900 mb-4">Languages</h3>
                      {stats?.byLanguage && Object.keys(stats.byLanguage).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(stats.byLanguage).sort(([,a], [,b]) => b - a).map(([lang, count]) => (
                            <div key={lang}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-700">{langNames[lang] || lang}</span>
                                <span className="text-zinc-500">{count}</span>
                              </div>
                              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${langColors[lang] || "bg-zinc-400"} rounded-full`}
                                  style={{ width: `${(count / totalLangQuestions) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500">No data yet</p>
                      )}
                    </div>

                    {/* Low Confidence */}
                    {stats?.lowConfidence && stats.lowConfidence.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <h3 className="font-semibold text-amber-900">Low Confidence</h3>
                        </div>
                        <div className="space-y-2">
                          {stats.lowConfidence.slice(0, 3).map((q, i) => (
                            <div key={i} className="p-2 bg-white/60 rounded-lg">
                              <p className="text-sm text-amber-900 line-clamp-2">{q.question}</p>
                              <span className="text-xs text-amber-600">{q.confidence}%</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-amber-700 mt-3">
                          💡 Add more documentation to improve these answers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
