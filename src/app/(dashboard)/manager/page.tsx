"use client";
import WalkthroughUpload from "@/components/WalkthroughUpload";
import GoogleDriveIntegration from "@/components/GoogleDriveIntegration";
import DropboxIntegration from "@/components/DropboxIntegration";
import GustoIntegration from "@/components/GustoIntegration";
import MicrosoftTeamsIntegration from "@/components/MicrosoftTeamsIntegration";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Upload, FileText, Trash2, BarChart3, Building2, Users, Phone, MapPin,
  TrendingUp, MessageSquare, Clock, AlertTriangle, Zap, Target,
  ChevronRight, RefreshCw, Lightbulb, Sparkles, ArrowUp, ArrowDown, FileCheck, X,
  Filter, Download, Settings, CheckCircle, User, Search, Plus, QrCode,
  Bell, Activity, ChevronDown, ExternalLink, Copy, Check, Moon, Sun, Home,
  Calendar, Hash, Globe, Award, TrendingDown, Minus, Car, CalendarDays, Shield, DollarSign, HeartPulse, GraduationCap, Coffee, Shirt, Palmtree,
  Wrench, AlertCircle, CheckCircle2, CircleDot, ClipboardList, Send, Edit2, XCircle
} from "lucide-react";

interface Document { id: string; name: string; uploadedAt: string; chunksCount?: number; classification?: { type: string; title: string; confidence: number }; }
interface Company { id: string; name: string; access_code?: string; locations?: { id: string; name: string; city: string; state: string }[]; }
interface Worker { phone: string; company_id: string; name?: string; photo_url?: string; registered_at?: string; }
interface Question { id: string; question: string; answer: string; worker_phone: string; worker_name?: string; confidence: number; created_at: string; topic?: string; }
interface Issue {
  id: string;
  company_id: string;
  worker_phone: string;
  worker_name?: string;
  description: string;
  equipment?: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}
interface IssueStats {
  total: number;
  open: number;
  resolved: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  byEquipment: Record<string, number>;
}
interface Checklist {
  id: string;
  company_id: string;
  worker_phone: string;
  worker_name?: string;
  ppe_ok: boolean | null;
  loto_ok: boolean | null;
  equipment_ok: boolean | null;
  shift_date: string;
  created_at: string;
}
interface ChecklistStats {
  totalToday: number;
  passedToday: number;
  failedToday: number;
  complianceRate: number;
  ppeFailures: number;
  lotoFailures: number;
  equipmentFailures: number;
  workerCompliance: { name: string; total: number; passed: number }[];
}
interface KnowledgeGap {
  id: string;
  cluster: string[];
  topic: string;
  suggestedPolicy: string;
  priority: number;
  frequency: number;
  uniqueWorkers: number;
  trend: "rising" | "stable" | "new";
}
interface Stats {
  totalQuestions: number;
  todayCount: number;
  weekCount: number;
  lastWeekCount?: number;
  avgConfidence: number;
  avgResponseTime: number;
  answeredRate: number;
  byLanguage: Record<string, number>;
  byTopic: Record<string, number>;
  byHour: Record<number, number>;
  recentQuestions: Question[];
  knowledgeGaps: { question: string; count: number }[];
}

interface ActivityItem {
  id: string;
  type: "join" | "question" | "gap" | "document" | "issue";
  message: string;
  time: string;
  icon: any;
  color: string;
}

const ICON_MAP: Record<string, any> = { Car, CalendarDays, Shield, DollarSign, HeartPulse, Coffee, Shirt, Phone, GraduationCap, Palmtree, MessageSquare };
const TOPIC_LABELS: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  parking: { label: "Parking", icon: "Car", color: "text-blue-700", bgColor: "bg-blue-100" },
  schedule: { label: "Schedule", icon: "CalendarDays", color: "text-purple-700", bgColor: "bg-purple-100" },
  safety: { label: "Safety", icon: "Shield", color: "text-orange-700", bgColor: "bg-orange-100" },
  compensation: { label: "Pay", icon: "DollarSign", color: "text-green-700", bgColor: "bg-green-100" },
  benefits: { label: "Benefits", icon: "HeartPulse", color: "text-pink-700", bgColor: "bg-pink-100" },
  breaks: { label: "Breaks", icon: "Coffee", color: "text-amber-700", bgColor: "bg-amber-100" },
  dress_code: { label: "Dress Code", icon: "Shirt", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  contacts: { label: "Contacts", icon: "Phone", color: "text-cyan-700", bgColor: "bg-cyan-100" },
  training: { label: "Training", icon: "GraduationCap", color: "text-violet-700", bgColor: "bg-violet-100" },
  pto: { label: "Time Off", icon: "Palmtree", color: "text-teal-700", bgColor: "bg-teal-100" },
  general: { label: "General", icon: "MessageSquare", color: "text-slate-700", bgColor: "bg-slate-100" },
};

const LANG_FLAGS: Record<string, { flag: string; name: string }> = {
  English: { flag: "us", name: "English" },
  Spanish: { flag: "mx", name: "Spanish" },
  Chinese: { flag: "cn", name: "Chinese" },
  Vietnamese: { flag: "vn", name: "Vietnamese" },
  Korean: { flag: "kr", name: "Korean" },
  Tagalog: { flag: "ph", name: "Tagalog" },
  Hindi: { flag: "in", name: "Hindi" },
  Portuguese: { flag: "br", name: "Portuguese" },
};

function getAvatarColor(name: string): string {
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-cyan-500", "bg-orange-500", "bg-teal-500"];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const end = value;
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayed(current);
      ref.current = current;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{displayed}</>;
}

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "issues" | "documents" | "create" | "workers">("analytics");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueStats, setIssueStats] = useState<IssueStats | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistStats, setChecklistStats] = useState<ChecklistStats | null>(null);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [certStats, setCertStats] = useState<any>(null);
  const [certTypes, setCertTypes] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ workerPhone: "", certType: "", expiryDate: "" });
  const [uploading, setUploading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState<string | null>(null);
  const [draftModal, setDraftModal] = useState<{ open: boolean; draft: string; topic: string } | null>(null);
  const [timeRange, setTimeRange] = useState<"1day" | "1week" | "1month" | "1year" | "all">("all");
  const [darkMode, setDarkMode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issueFilter, setIssueFilter] = useState<"all" | "open" | "resolved">("open");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionFilter, setQuestionFilter] = useState<"all" | "answered" | "unanswered">("all");
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [checklistDate, setChecklistDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const currentCompany = companies.find(c => c.id === selectedCompany);
  const companyWorkers = workers.filter(w => w.company_id === selectedCompany);
  const healthScore = stats ? Math.round((stats.answeredRate * 0.4) + (stats.avgConfidence * 0.4) + (Math.min(100, (stats.totalQuestions / 10) * 100) * 0.2)) : 0;
  const openIssuesCount = issues.filter(i => i.status === "open").length;
  const openHighPriorityCount = issues.filter(i => i.status === "open" && i.severity === "high").length;

  const activityFeed: ActivityItem[] = [
    ...(stats?.recentQuestions || []).slice(0, 3).map(q => ({
      id: `q-${q.id}`, type: "question" as const,
      message: `${q.worker_name || "A worker"} asked about ${q.question.slice(0, 30)}...`,
      time: q.created_at, icon: MessageSquare, color: "text-blue-500"
    })),
    ...issues.filter(i => i.status === "open").slice(0, 2).map(i => ({
      id: `i-${i.id}`, type: "issue" as const,
      message: `${i.worker_name || "Worker"} reported: ${i.description.slice(0, 30)}...`,
      time: i.created_at, icon: AlertTriangle, color: i.severity === "high" ? "text-red-500" : "text-amber-500"
    })),
    ...companyWorkers.slice(0, 2).map(w => ({
      id: `w-${w.phone}`, type: "join" as const,
      message: `${w.name || "New worker"} joined the team`,
      time: w.registered_at || new Date().toISOString(), icon: Users, color: "text-green-500"
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const weekTrend = stats?.lastWeekCount ? Math.round(((stats.weekCount - stats.lastWeekCount) / Math.max(stats.lastWeekCount, 1)) * 100) : 0;

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      setCompanies(d.companies || []);
      if (d.companies?.length > 0 && !selectedCompany) setSelectedCompany(d.companies[0].id);
      if (d.workers) setWorkers(d.workers);
    });
  }, []);

  useEffect(() => {
    if (selectedCompany) fetch(`/api/documents?companyId=${selectedCompany}`).then(r => r.json()).then(d => setDocuments(d.documents || []));
  }, [selectedCompany]);

  const loadStats = async () => {
    if (!selectedCompany) return;
    setLoadingStats(true);
    const res = await fetch(`/api/analytics?companyId=${selectedCompany}&timeRange=${timeRange}`);
    const data = await res.json();
    setStats(data);
    setLoadingStats(false);
  };

  const loadIssues = async () => {
    if (!selectedCompany) return;
    setLoadingIssues(true);
    try {
      const res = await fetch(`/api/issues?companyId=${selectedCompany}`);
      const data = await res.json();
      setIssues(data.issues || []);
      setIssueStats(data.stats || null);
    } catch (error) { console.error("Failed to load issues:", error); }
    setLoadingIssues(false);
  };

  const updateIssue = async (issueId: string, updates: { status?: string; notes?: string; resolved_by?: string }) => {
    try {
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, ...updates })
      });
      if (res.ok) { loadIssues(); setSelectedIssue(null); }
    } catch (error) { console.error("Failed to update issue:", error); }
  };

  const loadGaps = async () => {
    if (!selectedCompany) return;
    const res = await fetch(`/api/analytics/gaps?companyId=${selectedCompany}`);
    const data = await res.json();
    setGaps(data.gaps || []);
  };

  const loadChecklists = async () => {
    if (!selectedCompany) return;
    setLoadingChecklists(true);
    try {
      const res = await fetch(`/api/checklists?companyId=${selectedCompany}`);
      const data = await res.json();
      setChecklists(data.checklists || []);
      setChecklistStats(data.stats || null);
    } catch (error) { console.error("Failed to load checklists:", error); }
    setLoadingChecklists(false);
  };

  const loadCertifications = async () => {
    if (!selectedCompany) return;
    setLoadingCerts(true);
    try {
      const res = await fetch(`/api/certifications?companyId=${selectedCompany}`);
      const data = await res.json();
      setCertifications(data.certifications || []);
      setCertStats(data.stats || null);
      setCertTypes(data.certTypes || []);
    } catch (error) { console.error("Failed to load certifications:", error); }
    setLoadingCerts(false);
  };

  const addCertification = async () => {
    if (!newCert.workerPhone || !newCert.certType || !newCert.expiryDate) return;
    const worker = companyWorkers.find(w => w.phone === newCert.workerPhone);
    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany,
          workerPhone: newCert.workerPhone,
          workerName: worker?.name,
          certType: newCert.certType,
          expiryDate: newCert.expiryDate,
        })
      });
      if (res.ok) {
        setShowAddCertModal(false);
        setNewCert({ workerPhone: "", certType: "", expiryDate: "" });
        loadCertifications();
      }
    } catch (error) { console.error("Failed to add certification:", error); }
  };

  const deleteCertification = async (certId: string) => {
    try {
      await fetch(`/api/certifications?certId=${certId}`, { method: "DELETE" });
      loadCertifications();
    } catch (error) { console.error("Failed to delete certification:", error); }
  };

  const analyzeGaps = async () => {
    if (!stats?.knowledgeGaps?.length) return;
    setAnalyzingGaps(true);
    const res = await fetch("/api/analytics/gaps", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unansweredQuestions: stats.knowledgeGaps.map(g => ({ question: g.question, count: g.count, topic: "general" })), companyId: selectedCompany })
    });
    const data = await res.json();
    setGaps(data.gaps || []);
    setAnalyzingGaps(false);
  };

  const generateDraft = async (gap: KnowledgeGap) => {
    setGeneratingDraft(gap.id);
    const res = await fetch("/api/analytics/gaps/draft", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gap, companyName: currentCompany?.name })
    });
    const data = await res.json();
    setGeneratingDraft(null);
    if (data.draft) setDraftModal({ open: true, draft: data.draft, topic: gap.topic });
  };

  const copyAccessCode = () => {
    if (currentCompany?.access_code) {
      navigator.clipboard.writeText(currentCompany.access_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      if (activeTab === "analytics") { loadStats(); loadGaps(); }
      if (activeTab === "issues" || activeTab === "analytics") { loadIssues(); }
      if (activeTab === "workers" || activeTab === "analytics") { loadChecklists(); }
      if (activeTab === "workers") { loadCertifications(); }
    }
  }, [activeTab, selectedCompany, timeRange]);

  useEffect(() => {
    if (selectedCompany && activeTab === "workers") fetch("/api/companies").then(r => r.json()).then(d => { if (d.workers) setWorkers(d.workers); });
  }, [activeTab, selectedCompany]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", selectedCompany);
    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setDocuments(prev => [...prev, { ...data.document, chunksCount: data.chunksCount, classification: data.classification }]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents?id=${id}&companyId=${selectedCompany}`, { method: "DELETE" });
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const filteredQuestions = (stats?.recentQuestions || []).filter(q => {
    const matchesSearch = questionSearch === "" || q.question.toLowerCase().includes(questionSearch.toLowerCase()) || (q.worker_name && q.worker_name.toLowerCase().includes(questionSearch.toLowerCase()));
    const matchesFilter = questionFilter === "all" || (questionFilter === "answered" && q.confidence >= 50) || (questionFilter === "unanswered" && q.confidence < 50);
    return matchesSearch && matchesFilter;
  });

  const filteredIssues = issues.filter(i => issueFilter === "all" || i.status === issueFilter);
  const workerQuestions = selectedWorker ? (stats?.recentQuestions || []).filter(q => q.worker_phone === selectedWorker.phone) : [];
  const byHour = stats?.byHour || {};
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxHourCount = Math.max(...hours.map(h => byHour[h] || 0), 1);
  const sortedTopics = Object.entries(stats?.byTopic || {}).sort((a, b) => b[1] - a[1]);
  const maxTopicCount = sortedTopics.length > 0 ? sortedTopics[0][1] : 1;
  const timeRangeLabels: Record<string, string> = { "1day": "1 day", "1week": "1 week", "1month": "1 month", "1year": "1 year", "all": "All Time" };
  const peakHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0];
  const peakHourLabel = peakHour ? `${parseInt(peakHour[0]) > 12 ? parseInt(peakHour[0]) - 12 : peakHour[0]}${parseInt(peakHour[0]) >= 12 ? 'PM' : 'AM'}` : null;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-[#fafafa]"}`}>
      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl max-w-lg w-full shadow-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedIssue.severity === "high" ? "bg-red-100" : selectedIssue.severity === "medium" ? "bg-amber-100" : "bg-green-100"}`}>
                  <AlertTriangle className={`w-5 h-5 ${selectedIssue.severity === "high" ? "text-red-600" : selectedIssue.severity === "medium" ? "text-amber-600" : "text-green-600"}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Issue #{selectedIssue.id.slice(0, 8).toUpperCase()}</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTimeAgo(selectedIssue.created_at)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Reported By</label><p className={darkMode ? "text-white" : "text-gray-900"}>{selectedIssue.worker_name || "Unknown Worker"}</p></div>
              {selectedIssue.equipment && <div><label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Equipment</label><p className={darkMode ? "text-white" : "text-gray-900"}>{selectedIssue.equipment}</p></div>}
              <div><label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Description</label><p className={darkMode ? "text-white" : "text-gray-900"}>{selectedIssue.description}</p></div>
              <div className="flex gap-4">
                <div><label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Severity</label><p className={`capitalize font-medium ${selectedIssue.severity === "high" ? "text-red-600" : selectedIssue.severity === "medium" ? "text-amber-600" : "text-green-600"}`}>{selectedIssue.severity}</p></div>
                <div><label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Status</label><p className={`capitalize font-medium ${selectedIssue.status === "open" ? "text-amber-600" : "text-green-600"}`}>{selectedIssue.status}</p></div>
              </div>
              {selectedIssue.resolved_at && <div><label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Resolved</label><p className={darkMode ? "text-gray-300" : "text-gray-700"}>{formatTimeAgo(selectedIssue.resolved_at)} {selectedIssue.resolved_by && `by ${selectedIssue.resolved_by}`}</p></div>}
            </div>
            <div className={`flex items-center justify-end gap-3 p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              {selectedIssue.status === "open" ? (
                <button onClick={() => updateIssue(selectedIssue.id, { status: "resolved", resolved_by: currentCompany?.name })} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"><CheckCircle2 className="w-4 h-4" /> Mark Resolved</button>
              ) : (
                <button onClick={() => updateIssue(selectedIssue.id, { status: "open" })} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"><CircleDot className="w-4 h-4" /> Reopen</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl max-w-md w-full p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Invite Workers</h3>
              <button onClick={() => setShowQrModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-xl inline-block mb-4"><div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center"><QrCode className="w-24 h-24 text-gray-400" /></div></div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4`}>Workers can scan this QR code or text the code below</p>
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-lg p-4 flex items-center justify-between`}>
                <code className={`text-xl font-bold font-mono ${darkMode ? "text-blue-400" : "text-blue-600"}`}>JOIN {currentCompany?.access_code}</code>
                <button onClick={copyAccessCode} className="p-2 hover:bg-gray-200 rounded-lg">{copiedCode ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}</button>
              </div>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} mt-3`}>Send to: +1 (888) 707-4659</p>
            </div>
          </div>
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(selectedWorker.name || "")}`}>{selectedWorker.name ? getInitials(selectedWorker.name) : <User className="w-6 h-6" />}</div>
                <div><h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedWorker.name || "Unknown Worker"}</h3><p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedWorker.phone}</p></div>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-3 text-center`}><p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{workerQuestions.length}</p><p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Questions</p></div>
                <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-3 text-center`}><p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{workerQuestions.length > 0 ? Math.round(workerQuestions.reduce((a, q) => a + q.confidence, 0) / workerQuestions.length) : 0}%</p><p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Avg Confidence</p></div>
                <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-3 text-center`}><p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedWorker.registered_at ? formatTimeAgo(selectedWorker.registered_at) : "N/A"}</p><p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Joined</p></div>
              </div>
              <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-3`}>Question History</h4>
              <div className="space-y-3">
                {workerQuestions.length === 0 ? <p className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No questions yet</p> : workerQuestions.map((q, i) => (
                  <div key={i} className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-3`}>
                    <div className="flex items-start justify-between mb-2"><p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{q.question}</p><span className={`text-xs px-2 py-0.5 rounded-full ${q.confidence >= 70 ? "bg-green-100 text-green-700" : q.confidence >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.confidence}%</span></div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>{q.answer}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{formatTimeAgo(q.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Questions Modal */}
      {showAllQuestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>All Questions</h3>
              <button onClick={() => setShowAllQuestions(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative"><Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} /><input type="text" placeholder="Search questions or workers..." value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`} /></div>
                <select value={questionFilter} onChange={(e) => setQuestionFilter(e.target.value as any)} className={`px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}><option value="all">All</option><option value="answered">Answered</option><option value="unanswered">Unanswered</option></select>
              </div>
              <div className="overflow-y-auto max-h-[60vh] space-y-3">
                {filteredQuestions.length === 0 ? <p className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No questions found</p> : filteredQuestions.map((q, i) => (
                  <div key={i} className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${getAvatarColor(q.worker_name || "")}`}>{q.worker_name ? getInitials(q.worker_name) : <User className="w-5 h-5" />}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1"><div><span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{q.worker_name || "Unknown"}</span><span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} ml-2`}>{formatTimeAgo(q.created_at)}</span></div><span className={`text-xs px-2 py-0.5 rounded-full ${q.confidence >= 70 ? "bg-green-100 text-green-700" : q.confidence >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.confidence}% confidence</span></div>
                        <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>{q.question}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{q.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Modal */}
      {draftModal?.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}><div className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-green-600" /><h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Generated Policy Draft</h3></div><button onClick={() => setDraftModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-6 overflow-y-auto max-h-[60vh]"><pre className={`whitespace-pre-wrap text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} font-sans leading-relaxed`}>{draftModal.draft}</pre></div>
            <div className={`flex items-center justify-end gap-3 p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}><button onClick={() => setDraftModal(null)} className={`px-4 py-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Close</button><button onClick={() => navigator.clipboard.writeText(draftModal.draft)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Copy to Clipboard</button></div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><img src="/images/logo/sidekick-logo-blue.png" alt="Sidekick" className="w-8 h-8" /><span className={`font-bold text-xl ${darkMode ? "text-white" : "text-gray-900"}`}>Sidekick</span><span className={`mx-3 ${darkMode ? "text-gray-600" : "text-gray-300"}`}>|</span><span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dashboard</span></Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-600"}`}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <Link href="/" className={`p-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}><Home className="w-5 h-5" /></Link>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border-b px-6 py-3`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>An overview of how your team is using Sidekick.</p>
          <div className="flex items-center gap-3">
            <Building2 className={`w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex gap-1 p-1 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            {[
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "issues", label: "Alerts", icon: AlertTriangle, badge: openIssuesCount, badgeColor: openHighPriorityCount > 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700" },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "create", label: "AI Studio", icon: Sparkles },
              { id: "workers", label: "Workers", icon: Users, badge: companyWorkers.length, badgeColor: "bg-blue-100 text-blue-700" }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? (darkMode ? "bg-gray-700 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm") : (darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
                {tab.badge !== undefined && tab.badge > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}>{tab.badge}</span>}
              </button>
            ))}
          </div>
          <button onClick={() => setShowQrModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-gray-700 text-white" : "bg-white border border-gray-200 text-gray-700"}`}><QrCode className="w-4 h-4" /> Invite Workers</button>
        </div>

        {/* ISSUES TAB */}
        {activeTab === "issues" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl border p-6`}><div className="flex items-center justify-between mb-1"><span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Open Issues</span><AlertCircle className="w-4 h-4 text-amber-500" /></div><span className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}><AnimatedNumber value={issueStats?.open || 0} /></span></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl border p-6`}><div className="flex items-center justify-between mb-1"><span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>High Priority</span><AlertTriangle className="w-4 h-4 text-red-500" /></div><span className="text-4xl font-bold text-red-500"><AnimatedNumber value={issueStats?.highPriority || 0} /></span></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl border p-6`}><div className="flex items-center justify-between mb-1"><span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Resolved</span><CheckCircle2 className="w-4 h-4 text-green-500" /></div><span className="text-4xl font-bold text-green-500"><AnimatedNumber value={issueStats?.resolved || 0} /></span></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl border p-6`}><div className="flex items-center justify-between mb-1"><span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Reported</span><Wrench className="w-4 h-4 text-blue-500" /></div><span className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}><AnimatedNumber value={issueStats?.total || 0} /></span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>{(["open", "resolved", "all"] as const).map(f => <button key={f} onClick={() => setIssueFilter(f)} className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize ${issueFilter === f ? (darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : (darkMode ? "text-gray-400" : "text-gray-500")}`}>{f}</button>)}</div>
              <button onClick={loadIssues} className={darkMode ? "text-gray-500" : "text-gray-400"}><RefreshCw className={`w-5 h-5 ${loadingIssues ? "animate-spin" : ""}`} /></button>
            </div>
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border`}>
              {filteredIssues.length === 0 ? (
                <div className={`p-12 text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}><Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">No {issueFilter !== "all" ? issueFilter : ""} issues</p><p className="text-sm mt-1">Issues reported by workers via SMS will appear here</p></div>
              ) : (
                <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                  {filteredIssues.map(issue => (
                    <div key={issue.id} onClick={() => setSelectedIssue(issue)} className={`p-4 flex items-center gap-4 cursor-pointer ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${issue.severity === "high" ? "bg-red-100" : issue.severity === "medium" ? "bg-amber-100" : "bg-green-100"}`}><AlertTriangle className={`w-5 h-5 ${issue.severity === "high" ? "text-red-600" : issue.severity === "medium" ? "text-amber-600" : "text-green-600"}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{issue.equipment || "General Issue"}</span><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${issue.severity === "high" ? "bg-red-100 text-red-700" : issue.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{issue.severity}</span>{issue.status === "resolved" && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>}</div>
                        <p className={`text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{issue.description}</p>
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Reported by {issue.worker_name || "Worker"} • {formatTimeAgo(issue.created_at)}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHECKLISTS TAB */}
        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}><div className="flex items-center justify-between mb-1"><span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Questions Today</span><MessageSquare className={`w-4 h-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} /></div><div className="flex items-baseline gap-2"><span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}><AnimatedNumber value={stats?.todayCount || 0} /></span>{weekTrend !== 0 && <span className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${weekTrend > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>{weekTrend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{Math.abs(weekTrend)}%</span>}</div><p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{stats?.weekCount || 0} this week</p></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}><div className="flex items-center justify-between mb-1"><span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Answer Accuracy</span><Target className={`w-4 h-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} /></div><span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}><AnimatedNumber value={stats?.avgConfidence || 0} />%</span><p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{stats?.answeredRate || 0}% answered</p></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}><div className="flex items-center justify-between mb-1"><span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Open Issues</span><AlertTriangle className={`w-4 h-4 ${openHighPriorityCount > 0 ? "text-red-500" : "text-amber-500"}`} /></div><div className="flex items-baseline gap-2"><span className={`text-2xl font-bold ${openHighPriorityCount > 0 ? "text-red-500" : darkMode ? "text-white" : "text-gray-900"}`}><AnimatedNumber value={openIssuesCount} /></span>{openHighPriorityCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{openHighPriorityCount} urgent</span>}</div><button onClick={() => setActiveTab("issues")} className="text-xs text-blue-600">View all →</button></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}><div className="flex items-center justify-between mb-1"><span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Health Score</span><Award className={`w-4 h-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} /></div><span className={`text-2xl font-bold ${healthScore >= 70 ? "text-green-500" : healthScore >= 40 ? "text-amber-500" : "text-red-500"}`}><AnimatedNumber value={healthScore} /></span><div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${healthScore >= 70 ? "bg-green-500" : healthScore >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${healthScore}%` }} /></div></div>
            </div>
            {/* Chart - Full Width */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}>
              <div className="flex items-center justify-between mb-2"><div><h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Questions per Hour</h3><p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{peakHourLabel ? `Peak: ${peakHourLabel}` : "Question volume"}</p></div><button onClick={loadStats} className={darkMode ? "text-gray-500" : "text-gray-400"}><RefreshCw className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} /></button></div>
              <div className="h-32 flex items-end gap-0.5 mb-2">{hours.map(hour => { const count = byHour[hour] || 0; const heightPercent = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0; const isHighlighted = count === maxHourCount && count > 0; return (<div key={hour} className="flex-1 flex flex-col items-center group"><div className="relative w-full flex justify-center h-28"><div className={`w-full max-w-[20px] rounded-t transition-all ${isHighlighted ? "bg-blue-600" : count > 0 ? (darkMode ? "bg-blue-500" : "bg-blue-400") : (darkMode ? "bg-gray-700" : "bg-blue-100")}`} style={{ height: `${Math.max(heightPercent, count > 0 ? 8 : 3)}%`, position: "absolute", bottom: 0 }} /></div><span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}</span></div>); })}</div>
              <div className={`flex gap-1 p-0.5 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>{(["1day", "1week", "1month", "1year", "all"] as const).map(range => <button key={range} onClick={() => setTimeRange(range)} className={`px-2 py-1 text-xs font-medium rounded ${timeRange === range ? (darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : (darkMode ? "text-gray-400" : "text-gray-500")}`}>{timeRangeLabels[range]}</button>)}</div>
            </div>
            {/* Questions + Activity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}><div className="flex items-center justify-between mb-3"><h3 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Questions</h3><button onClick={() => setShowAllQuestions(true)} className="text-blue-600 text-xs font-medium flex items-center gap-1">See All <ChevronRight className="w-3 h-3" /></button></div><div className="space-y-2">{(stats?.recentQuestions || []).slice(0, 4).map((q, i) => (<div key={i} className="flex items-start gap-2"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0 ${getAvatarColor(q.worker_name || "")}`}>{q.worker_name ? getInitials(q.worker_name) : <User className="w-3 h-3" />}</div><div className="flex-1 min-w-0"><p className={`font-medium text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{q.worker_name || "Unknown"}</p><p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{q.question}</p></div></div>))}{(!stats?.recentQuestions || stats.recentQuestions.length === 0) && <div className={`text-center py-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}><MessageSquare className="w-5 h-5 mx-auto mb-1 opacity-50" /><p className="text-xs">No questions yet</p></div>}</div></div>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}><div className="flex items-center justify-between mb-3"><h3 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>Activity</h3><Activity className={`w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} /></div><div className="space-y-2">{activityFeed.length === 0 ? <div className={`text-center py-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}><Bell className="w-5 h-5 mx-auto mb-1 opacity-50" /><p className="text-xs">No recent activity</p></div> : activityFeed.slice(0, 4).map(item => (<div key={item.id} className="flex items-start gap-2"><div className={`w-6 h-6 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}><item.icon className={`w-3 h-3 ${item.color}`} /></div><div className="flex-1 min-w-0"><p className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item.message}</p><p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{formatTimeAgo(item.time)}</p></div></div>))}</div></div>
            </div>
          </div>
        )}

        {/* GAPS TAB */}
        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Manual Upload */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} rounded-xl border-2 border-dashed p-8 text-center hover:border-blue-400 transition-colors`}>
              <input type="file" id="upload" className="hidden" accept=".pdf,.txt,.doc,.docx,.xlsx,.csv" onChange={handleUpload} disabled={uploading} />
              <label htmlFor="upload" className="cursor-pointer">
                <Upload className={`w-10 h-10 mx-auto mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                <p className={`font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{uploading ? "Uploading..." : "Drop files here or click to upload"}</p>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>PDF, Word, Excel, or text files</p>
              </label>
            </div>

            {/* Integrations Section */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-4`}>
              <h3 className={`font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Import from Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GoogleDriveIntegration companyId={selectedCompany} darkMode={darkMode} onDocumentImported={(doc) => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title } }])} />
                <DropboxIntegration companyId={selectedCompany} darkMode={darkMode} onDocumentImported={(doc) => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title } }])} />
                <GustoIntegration companyId={selectedCompany} darkMode={darkMode} onEmployeesImported={(count) => console.log("Imported employees:", count)} />
                <MicrosoftTeamsIntegration companyId={selectedCompany} darkMode={darkMode} />
              </div>
            </div>

            {/* Document List */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{documents.length} Documents</h3>
                <button onClick={() => fetch(`/api/documents?companyId=${selectedCompany}`).then(r => r.json()).then(d => setDocuments(d.documents || []))} className={darkMode ? "text-gray-500" : "text-gray-400"}><RefreshCw className="w-4 h-4" /></button>
              </div>
              <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {documents.length === 0 ? (
                  <div className={`p-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No documents uploaded yet</p>
                  </div>
                ) : documents.map(doc => (
                  <div key={doc.id} className={`p-4 flex items-center justify-between ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? "bg-blue-900" : "bg-blue-50"}`}>
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{doc.classification?.title || "Processing..."}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(doc.id)} className={`p-2 rounded-lg ${darkMode ? "text-gray-500 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Create Content
                </h2>
                <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Generate training materials, policies, and guides from your facility knowledge
                </p>
              </div>
            </div>

            {/* Video Walkthrough Upload */}
            <WalkthroughUpload 
              companyId={selectedCompany}
              darkMode={darkMode}
              onComplete={(result) => {
                console.log("Walkthrough processed:", result.locations, "locations,", result.faqs, "FAQs");
              }}
            />

            {/* Knowledge Gaps Section */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? "bg-amber-900" : "bg-amber-100"}`}>
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Generate from Knowledge Gaps</h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Create policies based on unanswered worker questions</p>
                  </div>
                </div>
                <button onClick={analyzeGaps} disabled={analyzingGaps || !stats?.knowledgeGaps?.length} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50">
                  <Sparkles className={`w-4 h-4 ${analyzingGaps ? "animate-spin" : ""}`} />
                  {analyzingGaps ? "Analyzing..." : "Analyze Gaps"}
                </button>
              </div>

              {gaps.length === 0 ? (
                <div className={`p-8 text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>{stats?.knowledgeGaps?.length ? "Click 'Analyze Gaps' to identify patterns" : "No knowledge gaps detected yet"}</p>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {gaps.slice(0, 3).map(gap => (
                    <div key={gap.id} className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TOPIC_LABELS[gap.topic]?.bgColor || "bg-gray-100"} ${TOPIC_LABELS[gap.topic]?.color || "text-gray-700"}`}>
                              {TOPIC_LABELS[gap.topic]?.label || gap.topic}
                            </span>
                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Asked {gap.frequency} times</span>
                          </div>
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{gap.suggestedPolicy}</p>
                        </div>
                        <button onClick={() => generateDraft(gap)} disabled={generatingDraft === gap.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 ml-4">
                          <FileCheck className={`w-4 h-4 ${generatingDraft === gap.id ? "animate-spin" : ""}`} />
                          {generatingDraft === gap.id ? "..." : "Generate"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {gaps.length > 3 && (
                    <button onClick={() => setActiveTab("create")} className="text-blue-600 text-sm font-medium">
                      View all {gaps.length} suggestions →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === "workers" && (
          <div className="space-y-6">
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>Worker Registration</h3>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Share this code with your workers to join Sidekick</p>
                </div>
                <button onClick={() => setShowQrModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  <QrCode className="w-4 h-4" /> Show QR Code
                </button>
              </div>
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Workers text this to join:</p>
                    <code className={`text-2xl font-bold font-mono ${darkMode ? "text-blue-400" : "text-blue-600"}`}>JOIN {currentCompany?.access_code || "XXXXXX"}</code>
                  </div>
                  <button onClick={copyAccessCode} className={`p-3 rounded-lg ${darkMode ? "bg-gray-600" : "bg-white"} border ${darkMode ? "border-gray-500" : "border-gray-200"}`}>
                    {copiedCode ? <Check className="w-5 h-5 text-green-500" /> : <Copy className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />}
                  </button>
                </div>
                <p className={`text-xs mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Send to: +1 (888) 707-4659</p>
              </div>
            </div>

            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{companyWorkers.length} Workers</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-green-900 text-green-400" : "bg-green-50 text-green-600"}`}>{companyWorkers.filter(w => w.name).length} verified</span>
              </div>
              <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {companyWorkers.length === 0 ? (
                  <div className={`p-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No workers registered yet</p>
                  </div>
                ) : companyWorkers.map((worker, i) => (
                  <div key={i} onClick={() => setSelectedWorker(worker)} className={`p-4 flex items-center gap-4 cursor-pointer ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(worker.name || "")}`}>
                      {worker.name ? getInitials(worker.name) : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{worker.name || "Unnamed Worker"}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{worker.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{(stats?.recentQuestions || []).filter(q => q.worker_phone === worker.phone).length} questions</span>
                      {worker.name ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Verified</span>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Pending</span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
