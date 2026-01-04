"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Upload, FileText, Trash2, BarChart3, Building2, Users, Phone, MapPin, Globe,
  TrendingUp, MessageSquare, Clock, AlertTriangle, Zap, Languages, Target,
  ChevronRight, RefreshCw, Lightbulb, Sparkles, ArrowUp, FileCheck, X
} from "lucide-react";

interface Document { id: string; name: string; uploadedAt: string; chunksCount?: number; classification?: { type: string; title: string; confidence: number }; }
interface Location { id: string; name: string; city: string; state: string; }
interface Company { id: string; name: string; locations: Location[]; }
interface Worker { phone: string; companyId: string; locationId: string; registeredAt: string; }

interface KnowledgeGap {
  id: string;
  cluster: string[];
  topic: string;
  suggestedPolicy: string;
  priority: number;
  frequency: number;
  uniqueWorkers: number;
  trend: "rising" | "stable" | "new";
  lastAsked: string;
  companyId: string;
}

interface Stats {
  totalQuestions: number;
  todayCount: number;
  weekCount: number;
  avgConfidence: number;
  avgResponseTime: number;
  answeredRate: number;
  byLanguage: Record<string, number>;
  byTopic: Record<string, number>;
  recentQuestions: any[];
  knowledgeGaps: { question: string; count: number }[];
}

const TOPIC_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  parking: { label: "Parking", emoji: "🚗", color: "bg-blue-100 text-blue-700" },
  schedule: { label: "Schedule", emoji: "📅", color: "bg-purple-100 text-purple-700" },
  safety: { label: "Safety", emoji: "🦺", color: "bg-orange-100 text-orange-700" },
  compensation: { label: "Pay", emoji: "💰", color: "bg-green-100 text-green-700" },
  benefits: { label: "Benefits", emoji: "🏥", color: "bg-pink-100 text-pink-700" },
  breaks: { label: "Breaks", emoji: "☕", color: "bg-amber-100 text-amber-700" },
  dress_code: { label: "Dress Code", emoji: "👔", color: "bg-indigo-100 text-indigo-700" },
  contacts: { label: "Contacts", emoji: "📞", color: "bg-cyan-100 text-cyan-700" },
  training: { label: "Training", emoji: "🎓", color: "bg-violet-100 text-violet-700" },
  general: { label: "General", emoji: "💬", color: "bg-slate-100 text-slate-700" },
};

const LANG_FLAGS: Record<string, string> = {
  English: "🇺🇸", Spanish: "🇪🇸", Chinese: "🇨🇳", Japanese: "🇯🇵", Korean: "🇰🇷",
  Vietnamese: "🇻🇳", Hindi: "🇮🇳", Tagalog: "🇵🇭", Portuguese: "🇧🇷", Arabic: "🇸🇦",
};

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"documents" | "analytics" | "workers" | "gaps">("analytics");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("eds");
  const [selectedScope, setSelectedScope] = useState<string>("company-wide");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState<string | null>(null);
  const [draftModal, setDraftModal] = useState<{ open: boolean; draft: string; topic: string } | null>(null);

  const currentCompany = companies.find(c => c.id === selectedCompany);
  const companyWorkers = workers.filter(w => w.companyId === selectedCompany);

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      setCompanies(d.companies || []);
      if (d.workers) setWorkers(d.workers);
    });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const docKey = selectedScope === "company-wide" ? selectedCompany : selectedScope;
      fetch(`/api/documents?companyId=${docKey}`).then(r => r.json()).then(d => setDocuments(d.documents || []));
    }
  }, [selectedCompany, selectedScope]);

  const loadStats = async () => {
    setLoadingStats(true);
    const res = await fetch(`/api/analytics?companyId=${selectedCompany}`);
    const data = await res.json();
    setStats(data);
    setLoadingStats(false);
  };

  const loadGaps = async () => {
    const res = await fetch(`/api/analytics/gaps?companyId=${selectedCompany}`);
    const data = await res.json();
    setGaps(data.gaps || []);
  };

  const analyzeGaps = async () => {
    if (!stats?.knowledgeGaps?.length) return;
    setAnalyzingGaps(true);
    
    const res = await fetch("/api/analytics/gaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unansweredQuestions: stats.knowledgeGaps.map(g => ({ question: g.question, count: g.count, topic: "general" })),
        companyId: selectedCompany
      })
    });
    const data = await res.json();
    setGaps(data.gaps || []);
    setAnalyzingGaps(false);
  };

  const generateDraft = async (gap: KnowledgeGap) => {
    setGeneratingDraft(gap.id);
    const res = await fetch("/api/analytics/gaps/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gap, companyName: currentCompany?.name })
    });
    const data = await res.json();
    setGeneratingDraft(null);
    if (data.draft) {
      setDraftModal({ open: true, draft: data.draft, topic: gap.topic });
    }
  };

  useEffect(() => {
    if (activeTab === "analytics" || activeTab === "gaps") {
      loadStats();
      loadGaps();
    }
    if (activeTab === "workers") {
      fetch("/api/companies").then(r => r.json()).then(d => { if (d.workers) setWorkers(d.workers); });
    }
  }, [activeTab, selectedCompany]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", selectedScope === "company-wide" ? selectedCompany : selectedScope);
    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setDocuments(prev => [...prev, { ...data.document, chunksCount: data.chunksCount, classification: data.classification }]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const docKey = selectedScope === "company-wide" ? selectedCompany : selectedScope;
    await fetch(`/api/documents?id=${id}&companyId=${docKey}`, { method: "DELETE" });
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const sortedTopics = stats?.byTopic ? Object.entries(stats.byTopic).sort((a, b) => b[1] - a[1]) : [];
  const maxTopicCount = sortedTopics.length > 0 ? sortedTopics[0][1] : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Draft Modal */}
      {draftModal?.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-slate-900">Generated Policy Draft</h3>
              </div>
              <button onClick={() => setDraftModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{draftModal.draft}</pre>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setDraftModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-900">
                Close
              </button>
              <button 
                onClick={() => { navigator.clipboard.writeText(draftModal.draft); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-slate-900">Sidekick</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Manager Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <select value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setSelectedScope("company-wide"); }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white">
              {companies.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
          {[
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "gaps", label: "Gap Detection", icon: Lightbulb },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "workers", label: "Workers", icon: Users }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
              {tab.id === "gaps" && gaps.length > 0 && (
                <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{gaps.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* GAP DETECTION TAB */}
        {activeTab === "gaps" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                  Document Gap Detection
                </h2>
                <p className="text-slate-500 mt-1">AI-identified knowledge gaps with policy suggestions</p>
              </div>
              <button 
                onClick={analyzeGaps} 
                disabled={analyzingGaps || !stats?.knowledgeGaps?.length}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${analyzingGaps ? "animate-spin" : ""}`} />
                {analyzingGaps ? "Analyzing..." : "Analyze Gaps"}
              </button>
            </div>

            {gaps.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No gaps detected yet</h3>
                <p className="text-slate-500 mb-4">
                  {stats?.knowledgeGaps?.length 
                    ? `You have ${stats.knowledgeGaps.length} unanswered questions. Click "Analyze Gaps" to identify patterns.`
                    : "Once workers start asking questions, we'll identify knowledge gaps automatically."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {gaps.map(gap => (
                  <div key={gap.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${TOPIC_LABELS[gap.topic]?.color || "bg-slate-100 text-slate-700"}`}>
                            {TOPIC_LABELS[gap.topic]?.emoji} {TOPIC_LABELS[gap.topic]?.label || gap.topic}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            gap.priority >= 80 ? "bg-red-100 text-red-700" :
                            gap.priority >= 50 ? "bg-amber-100 text-amber-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            Priority: {gap.priority}
                          </span>
                          {gap.trend === "rising" && (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <ArrowUp className="w-3 h-3" /> Rising
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-slate-900 mb-2">Questions workers are asking:</h3>
                        <ul className="space-y-1 mb-4">
                          {gap.cluster.map((q, i) => (
                            <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              "{q}"
                            </li>
                          ))}
                        </ul>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-900 mb-1">AI Suggestion</p>
                              <p className="text-amber-800 text-sm">{gap.suggestedPolicy}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                          <span>Asked {gap.frequency} times</span>
                          <span>•</span>
                          <span>{gap.uniqueWorkers} workers</span>
                        </div>
                      </div>

                      <button
                        onClick={() => generateDraft(gap)}
                        disabled={generatingDraft === gap.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 ml-4"
                      >
                        <FileCheck className={`w-4 h-4 ${generatingDraft === gap.id ? "animate-spin" : ""}`} />
                        {generatingDraft === gap.id ? "Generating..." : "Generate Draft"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={loadStats} disabled={loadingStats} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
                <RefreshCw className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} />Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg"><MessageSquare className="w-5 h-5 text-blue-600" /></div>
                  <span className="text-sm text-slate-500">Total Questions</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalQuestions || 0}</p>
                <p className="text-sm text-slate-400 mt-1">{stats?.weekCount || 0} this week</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg"><Target className="w-5 h-5 text-green-600" /></div>
                  <span className="text-sm text-slate-500">Answer Rate</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.answeredRate || 0}%</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                  <span className="text-sm text-slate-500">Avg Confidence</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.avgConfidence || 0}%</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                  <span className="text-sm text-slate-500">Response Time</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{((stats?.avgResponseTime || 0) / 1000).toFixed(1)}s</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />Questions by Topic
                </h3>
                <div className="space-y-3">
                  {sortedTopics.slice(0, 6).map(([topic, count]) => {
                    const info = TOPIC_LABELS[topic] || TOPIC_LABELS.general;
                    const percentage = Math.round((count / maxTopicCount) * 100);
                    return (
                      <div key={topic}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm px-2 py-0.5 rounded-full ${info.color}`}>{info.emoji} {info.label}</span>
                          <span className="text-sm text-slate-500">{count}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-blue-500" />Languages Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats?.byLanguage && Object.entries(stats.byLanguage).sort((a, b) => b[1] - a[1]).map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-lg">{LANG_FLAGS[lang] || "🌐"}</span>
                      <span className="text-sm font-medium text-slate-700">{lang}</span>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Gap Alert */}
            {stats?.knowledgeGaps && stats.knowledgeGaps.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <div>
                      <h3 className="font-semibold text-amber-900">{stats.knowledgeGaps.length} Unanswered Questions</h3>
                      <p className="text-amber-700 text-sm">Go to Gap Detection to analyze and generate policies</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("gaps")} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
                    View Gaps <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-3">Upload documents for:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedScope("company-wide")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedScope === "company-wide" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  <Globe className="w-4 h-4" />All Locations
                </button>
                {currentCompany?.locations.map(loc => (
                  <button key={loc.id} onClick={() => setSelectedScope(loc.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedScope === loc.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                    <MapPin className="w-4 h-4" />{loc.city}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
              <input type="file" id="upload" className="hidden" accept=".pdf,.txt,.doc,.docx,.xlsx,.csv" onChange={handleUpload} disabled={uploading} />
              <label htmlFor="upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-1">{uploading ? "Uploading..." : "Drop files here or click to upload"}</p>
              </label>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-medium text-slate-900">{documents.length} Documents</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {documents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No documents uploaded yet</div>
                ) : documents.map(doc => (
                  <div key={doc.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-sm text-slate-500">{doc.classification?.title || "Processing..."}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === "workers" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Worker Self-Registration</h3>
            <p className="text-sm text-slate-500 mb-4">
              Workers text: <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">JOIN {currentCompany?.name} [city]</code>
            </p>
            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">{companyWorkers.length} workers at {currentCompany?.name}</p>
              {currentCompany?.locations.map(loc => {
                const locationWorkers = companyWorkers.filter(w => w.locationId === loc.id);
                return (
                  <div key={loc.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{loc.city}, {loc.state}</span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{locationWorkers.length}</span>
                    </div>
                    {locationWorkers.map((w, i) => (
                      <div key={i} className="ml-6 flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3 h-3" />{w.phone}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
