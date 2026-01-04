"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Upload, FileText, Trash2, BarChart3, Building2, Users, Phone, MapPin, Globe,
  TrendingUp, MessageSquare, Clock, AlertTriangle, Zap, Languages, Target,
  ChevronRight, RefreshCw
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  chunksCount?: number;
  classification?: { type: string; title: string; confidence: number };
}

interface Location { id: string; name: string; city: string; state: string; }
interface Company { id: string; name: string; locations: Location[]; }
interface Worker { phone: string; companyId: string; locationId: string; registeredAt: string; }
interface KnowledgeGap { question: string; count: number; companyId: string; locationId: string; lastAsked: string; }

interface RecentQuestion {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  companyName: string;
  locationCity: string;
  language: string;
  confidence: number;
  topic: string;
  answered: boolean;
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
  byCompany: Record<string, number>;
  byLocation: Record<string, number>;
  recentQuestions: RecentQuestion[];
  knowledgeGaps: KnowledgeGap[];
  topQuestions: { question: string; count: number }[];
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
  const [activeTab, setActiveTab] = useState<"documents" | "analytics" | "workers">("analytics");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("eds");
  const [selectedScope, setSelectedScope] = useState<string>("company-wide");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const currentCompany = companies.find(c => c.id === selectedCompany);

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
    const url = selectedCompany ? `/api/analytics?companyId=${selectedCompany}` : "/api/analytics";
    const res = await fetch(url);
    const data = await res.json();
    setStats(data);
    setLoadingStats(false);
  };

  useEffect(() => {
    if (activeTab === "analytics") loadStats();
    if (activeTab === "workers") fetch("/api/companies").then(r => r.json()).then(d => { if (d.workers) setWorkers(d.workers); });
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

  const companyWorkers = workers.filter(w => w.companyId === selectedCompany);
  const sortedTopics = stats?.byTopic ? Object.entries(stats.byTopic).sort((a, b) => b[1] - a[1]) : [];
  const maxTopicCount = sortedTopics.length > 0 ? sortedTopics[0][1] : 1;

  return (
    <div className="min-h-screen bg-slate-50">
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
          {[{ id: "analytics", label: "Analytics", icon: BarChart3 }, { id: "documents", label: "Documents", icon: FileText }, { id: "workers", label: "Workers", icon: Users }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

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
                <p className="text-sm text-slate-400 mt-1">Questions answered</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                  <span className="text-sm text-slate-500">Avg Confidence</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.avgConfidence || 0}%</p>
                <p className="text-sm text-slate-400 mt-1">Response accuracy</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                  <span className="text-sm text-slate-500">Response Time</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{((stats?.avgResponseTime || 0) / 1000).toFixed(1)}s</p>
                <p className="text-sm text-slate-400 mt-1">Average latency</p>
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
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {sortedTopics.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No data yet</p>}
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
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{count}</span>
                    </div>
                  ))}
                  {(!stats?.byLanguage || Object.keys(stats.byLanguage).length === 0) && <p className="text-slate-400 text-sm">No data yet</p>}
                </div>
              </div>
            </div>

            {stats?.knowledgeGaps && stats.knowledgeGaps.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
                <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />Knowledge Gaps
                  <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full ml-2">Action Required</span>
                </h3>
                <p className="text-sm text-amber-700 mb-4">These questions could not be answered. Consider adding documentation.</p>
                <div className="space-y-3">
                  {stats.knowledgeGaps.slice(0, 5).map((gap, i) => (
                    <div key={i} className="bg-white/80 rounded-lg p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-slate-900 font-medium">{gap.question}</p>
                        <p className="text-sm text-slate-500 mt-1">Asked {gap.count} time{gap.count > 1 ? "s" : ""}</p>
                      </div>
                      <button className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium">
                        Add docs <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />Recent Questions
              </h3>
              <div className="space-y-3">
                {stats?.recentQuestions?.slice(0, 10).map((q, i) => (
                  <div key={q.id || i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${q.answered ? "bg-green-500" : "bg-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 truncate">{q.question}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400">{new Date(q.timestamp).toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TOPIC_LABELS[q.topic]?.color || "bg-slate-100 text-slate-600"}`}>
                          {TOPIC_LABELS[q.topic]?.label || q.topic}
                        </span>
                        <span className="text-xs text-slate-400">{LANG_FLAGS[q.language] || "🌐"} {q.language}</span>
                        <span className={`text-xs ${q.confidence >= 80 ? "text-green-600" : q.confidence >= 50 ? "text-amber-600" : "text-red-600"}`}>{q.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!stats?.recentQuestions || stats.recentQuestions.length === 0) && (
                  <p className="text-slate-400 text-sm text-center py-8">No questions yet. Workers will appear here when they ask questions via SMS.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-3">Upload documents for:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedScope("company-wide")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedScope === "company-wide" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  <Globe className="w-4 h-4" />All Locations (Company-wide)
                </button>
                {currentCompany?.locations.map(loc => (
                  <button key={loc.id} onClick={() => setSelectedScope(loc.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedScope === loc.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                    <MapPin className="w-4 h-4" />{loc.city}, {loc.state}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
              <input type="file" id="upload" className="hidden" accept=".pdf,.txt,.doc,.docx" onChange={handleUpload} disabled={uploading} />
              <label htmlFor="upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-1">{uploading ? "Uploading..." : "Drop files here or click to upload"}</p>
                <p className="text-sm text-slate-400">
                  {selectedScope === "company-wide" ? `Documents will apply to ALL ${currentCompany?.name} locations` : `Documents will only apply to ${currentCompany?.locations.find(l => l.id === selectedScope)?.city}`}
                </p>
              </label>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-medium text-slate-900">
                  {selectedScope === "company-wide" ? `${currentCompany?.name} - Company-wide Documents` : `${currentCompany?.name} - ${currentCompany?.locations.find(l => l.id === selectedScope)?.city} Documents`}
                </h3>
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
                        <p className="text-sm text-slate-500">{doc.classification?.title || "Processing..."} • {doc.chunksCount || 0} sections</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Worker Self-Registration</h3>
              <p className="text-sm text-slate-500 mb-4">
                Workers can register themselves via SMS by texting:<br/>
                <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">JOIN {currentCompany?.name} [city]</code>
              </p>
              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">{companyWorkers.length} workers registered at {currentCompany?.name}</p>
                {currentCompany?.locations.map(loc => {
                  const locationWorkers = companyWorkers.filter(w => w.locationId === loc.id);
                  return (
                    <div key={loc.id} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{loc.city}, {loc.state}</span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{locationWorkers.length} workers</span>
                      </div>
                      {locationWorkers.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {locationWorkers.map((worker, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />{worker.phone}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
