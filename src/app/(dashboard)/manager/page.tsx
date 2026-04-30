"use client";

// ─── Existing integrations & utilities (unchanged) ────────────────────────────
import WalkthroughUpload from "@/components/WalkthroughUpload";
import GoogleDriveIntegration from "@/components/GoogleDriveIntegration";
import DropboxIntegration from "@/components/DropboxIntegration";
import GustoIntegration from "@/components/GustoIntegration";
import MicrosoftTeamsIntegration from "@/components/MicrosoftTeamsIntegration";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload, FileText, Video, Trash2, BarChart3, Building2, Users, Phone, MapPin,
  TrendingUp, MessageSquare, Clock, AlertTriangle, Zap, Target,
  ChevronRight, RefreshCw, Lightbulb, Sparkles, ArrowUp, ArrowDown, FileCheck, X,
  Filter, Download, Settings, CheckCircle, User, Search, Plus, QrCode,
  Bell, Activity, ChevronDown, ExternalLink, Copy, Check, Moon, Sun, Home,
  Calendar, Hash, Globe, Award, TrendingDown, Minus, Car, CalendarDays, Shield, DollarSign, HeartPulse, GraduationCap, Coffee, Shirt, Palmtree,
  Wrench, AlertCircle, CheckCircle2, CircleDot, ClipboardList, Send, Edit2, XCircle
} from "lucide-react";

// ─── New design components ────────────────────────────────────────────────────
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { SubHeader } from "@/components/dashboard/layout/SubHeader";
import { TabNav } from "@/components/dashboard/layout/TabNav";
import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { HealthScoreCard } from "@/components/dashboard/analytics/HealthScoreCard";
import { QuestionsPerHourChart } from "@/components/dashboard/analytics/QuestionsPerHourChart";
import { QuestionsChart } from "@/components/dashboard/analytics/QuestionsChart";
import { ResolutionChart } from "@/components/dashboard/analytics/ResolutionChart";
import { CategorySummary } from "@/components/dashboard/analytics/CategorySummary";
import { AnswerSourcesChart } from "@/components/dashboard/analytics/AnswerSourcesChart";
import { TopGapsTable } from "@/components/dashboard/analytics/TopGapsTable";
import { FeedCard } from "@/components/dashboard/analytics/FeedCard";
import { AlertMetrics } from "@/components/dashboard/alerts/AlertMetrics";
import { AlertCharts } from "@/components/dashboard/alerts/AlertCharts";
import { AlertsTable } from "@/components/dashboard/alerts/AlertsTable";
import { DocumentsTable } from "@/components/dashboard/documents/DocumentsTable";
import { DocumentsTab } from "@/components/dashboard/documents/DocumentsTab";
import { UploadZone } from "@/components/dashboard/documents/UploadZone";
import { VideoUpload } from "@/components/dashboard/ai-studio/VideoUpload";
import { KnowledgeGaps } from "@/components/dashboard/ai-studio/KnowledgeGaps";
import { ContentCards } from "@/components/dashboard/ai-studio/ContentCards";
import { StorageSidebar } from "@/components/dashboard/ai-studio/StorageSidebar";
import { WorkersTable } from "@/components/dashboard/workers/WorkersTable";
import { WorkersTab } from "@/components/dashboard/workers/WorkersTab";
import { RegistrationCard } from "@/components/dashboard/workers/RegistrationCard";
import { QRCodeModal } from "@/components/dashboard/workers/QRCodeModal";

// ─── Existing interfaces (unchanged) ─────────────────────────────────────────
interface Document { id: string; name: string; uploadedAt: string; chunksCount?: number; classification?: { type: string; title: string; confidence: number }; }
interface Company { id: string; name: string; access_code?: string; locations?: { id: string; name: string; city: string; state: string }[]; }
interface Worker { phone: string; company_id: string; name?: string; photo_url?: string; registered_at?: string; }
interface Question { id: string; question: string; answer: string; worker_phone: string; worker_name?: string; confidence: number; created_at: string; topic?: string; }
interface Issue {
  id: string; company_id: string; worker_phone: string; worker_name?: string;
  description: string; equipment?: string; severity: "low" | "medium" | "high";
  status: "open" | "resolved"; created_at: string; resolved_at?: string; resolved_by?: string; notes?: string;
}
interface IssueStats {
  total: number; open: number; resolved: number; highPriority: number;
  mediumPriority: number; lowPriority: number; byEquipment: Record<string, number>;
}
interface Checklist {
  id: string; company_id: string; worker_phone: string; worker_name?: string;
  ppe_ok: boolean | null; loto_ok: boolean | null; equipment_ok: boolean | null;
  shift_date: string; created_at: string;
}
interface ChecklistStats {
  totalToday: number; passedToday: number; failedToday: number; complianceRate: number;
  ppeFailures: number; lotoFailures: number; equipmentFailures: number;
  workerCompliance: { name: string; total: number; passed: number }[];
}
interface KnowledgeGapItem {
  id: string; cluster: string[]; topic: string; suggestedPolicy: string;
  priority: number; frequency: number; uniqueWorkers: number; trend: "rising" | "stable" | "new";
}
interface Stats {
  totalQuestions: number; todayCount: number; weekCount: number; lastWeekCount?: number;
  avgConfidence: number; avgResponseTime: number; answeredRate: number;
  byLanguage: Record<string, number>; byTopic: Record<string, number>;
  byHour: Record<number, number>; recentQuestions: Question[];
  knowledgeGaps: { question: string; count: number }[];
}
interface ActivityItem {
  id: string; type: "join" | "question" | "gap" | "document" | "issue";
  message: string; time: string; icon: any; color: string;
}

// ─── Existing helpers (unchanged) ─────────────────────────────────────────────
const ICON_MAP: Record<string, any> = { Car, CalendarDays, Shield, DollarSign, HeartPulse, Coffee, Shirt, Phone, GraduationCap, Palmtree, MessageSquare };
const TOPIC_LABELS: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  parking:      { label: "Parking",   icon: "Car",          color: "text-blue-700",   bgColor: "bg-blue-100" },
  schedule:     { label: "Schedule",  icon: "CalendarDays", color: "text-purple-700", bgColor: "bg-purple-100" },
  safety:       { label: "Safety",    icon: "Shield",       color: "text-orange-700", bgColor: "bg-orange-100" },
  compensation: { label: "Pay",       icon: "DollarSign",   color: "text-green-700",  bgColor: "bg-green-100" },
  benefits:     { label: "Benefits",  icon: "HeartPulse",   color: "text-pink-700",   bgColor: "bg-pink-100" },
  breaks:       { label: "Breaks",    icon: "Coffee",       color: "text-amber-700",  bgColor: "bg-amber-100" },
  dress_code:   { label: "Dress Code",icon: "Shirt",        color: "text-indigo-700", bgColor: "bg-indigo-100" },
  contacts:     { label: "Contacts",  icon: "Phone",        color: "text-cyan-700",   bgColor: "bg-cyan-100" },
  training:     { label: "Training",  icon: "GraduationCap",color: "text-violet-700", bgColor: "bg-violet-100" },
  pto:          { label: "Time Off",  icon: "Palmtree",     color: "text-teal-700",   bgColor: "bg-teal-100" },
  general:      { label: "General",   icon: "MessageSquare",color: "text-slate-700",  bgColor: "bg-slate-100" },
};

function getAvatarColor(name: string): string {
  const colors = ["bg-[#C96442]","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-cyan-500","bg-orange-500","bg-teal-500"];
  return colors[name ? name.charCodeAt(0) % colors.length : 0];
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
    const start = ref.current; const end = value; const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayed(current); ref.current = current;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{displayed}</>;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  // All existing state (unchanged)
  const [activeTab, setActiveTab] = useState<"analytics" | "alerts" | "documents" | "ai-studio" | "workers">("analytics");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGapItem[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<any[]>([]);
  const [selectedUQ, setSelectedUQ] = useState<any>(null);
  const [uqAnswer, setUqAnswer] = useState("");
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [walkthroughs, setWalkthroughs] = useState<any[]>([]);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issueFilter, setIssueFilter] = useState<"all" | "open" | "resolved">("open");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionFilter, setQuestionFilter] = useState<"all" | "answered" | "unanswered">("all");
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [checklistDate, setChecklistDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // All existing derived values (unchanged)
  const currentCompany = companies.find(c => c.id === selectedCompany);
  const companyWorkers = workers.filter(w => w.company_id === selectedCompany);
  const healthScore = stats ? Math.round((stats.answeredRate * 0.4) + (stats.avgConfidence * 0.4) + (Math.min(100, (stats.totalQuestions / 10) * 100) * 0.2)) : 0;
  const openIssuesCount = issues.filter(i => i.status === "open").length;
  const openHighPriorityCount = issues.filter(i => i.status === "open" && i.severity === "high").length;
  const weekTrend = stats?.lastWeekCount ? Math.round(((stats.weekCount - stats.lastWeekCount) / Math.max(stats.lastWeekCount, 1)) * 100) : 0;

  const activityFeed: ActivityItem[] = [
    ...(stats?.recentQuestions || []).slice(0, 3).map(q => ({
      id: `q-${q.id}`, type: "question" as const,
      message: `${q.worker_name || "A worker"} asked about ${q.question.slice(0, 30)}...`,
      time: q.created_at, icon: MessageSquare, color: "text-[#C96442]"
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

  // All existing API calls (unchanged)
  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      let allCompanies = d.companies || [];
      try {
        const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (authData.companyId) allCompanies = allCompanies.filter((c: any) => c.id === authData.companyId);
      } catch {}
      setCompanies(allCompanies);
      if (allCompanies.length > 0 && !selectedCompany) setSelectedCompany(allCompanies[0].id);
      if (d.workers) setWorkers(d.workers);
    });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetch(`/api/documents?companyId=${selectedCompany}`).then(r => r.json()).then(d => setDocuments(d.documents || []));
      fetch(`/api/walkthroughs?companyId=${selectedCompany}`).then(r => r.json()).then(d => setWalkthroughs(d.walkthroughs || []));
    }
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
      const qRes = await fetch(`/api/analytics?companyId=${selectedCompany}&timeRange=all`);
      const qData = await qRes.json();
      setUnansweredQuestions((qData.recentQuestions || []).filter((q: any) => !q.answer));
      setIssueStats(data.stats || null);
    } catch (error) { console.error("Failed to load issues:", error); }
    setLoadingIssues(false);
  };

  const updateIssue = async (issueId: string, updates: { status?: string; notes?: string; resolved_by?: string }) => {
    try {
      const res = await fetch("/api/issues", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: selectedCompany, workerPhone: newCert.workerPhone, workerName: worker?.name, certType: newCert.certType, expiryDate: newCert.expiryDate })
      });
      if (res.ok) { setShowAddCertModal(false); setNewCert({ workerPhone: "", certType: "", expiryDate: "" }); loadCertifications(); }
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

  const generateDraft = async (gap: KnowledgeGapItem) => {
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
      if (activeTab === "alerts" || activeTab === "analytics") { loadIssues(); }
      if (activeTab === "workers" || activeTab === "analytics") { loadChecklists(); }
      if (activeTab === "workers") { loadCertifications(); }
    }
  }, [activeTab, selectedCompany, timeRange]);

  useEffect(() => {
    if (selectedCompany && activeTab === "workers")
      fetch("/api/companies").then(r => r.json()).then(d => { if (d.workers) setWorkers(d.workers); });
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

  // ─── Adapters: map real data shapes to new component prop shapes ─────────────

  // Issues → AlertMetrics expects { id, issue, worker, severity, status, date, category }
  const mappedAlerts = issues.map(i => ({
    id: i.id,
    issue: i.description,
    worker: i.worker_name || "Unknown",
    severity: i.severity as "high" | "medium" | "low",
    status: i.status as "open" | "resolved",
    date: i.created_at.split("T")[0],
    category: (i.equipment ? "equipment" : "safety") as "safety" | "equipment" | "compliance" | "health",
  }));

  // Workers → WorkersTable expects { id, name, phone, joinDate, status }
  const mappedWorkers = companyWorkers.map(w => ({
    id: w.phone,
    name: w.name || "Unknown Worker",
    phone: w.phone,
    joinDate: w.registered_at ? w.registered_at.split("T")[0] : new Date().toISOString().split("T")[0],
    status: (w.name ? "verified" : "pending") as "verified" | "pending",
  }));

  // Certifications → table rows
  const mappedCerts = certifications.map((c, i) => ({
    id: c.id || String(i),
    workerName: c.worker_name || "Unknown",
    certName: c.cert_name || c.certType || "Certification",
    expiryDate: c.expiry_date || c.expiryDate || "",
  }));

  // Checklists → table rows
  const mappedChecklists = checklists.map((c, i) => ({
    id: c.id || String(i),
    workerName: c.worker_name || "Unknown",
    shiftDate: c.shift_date,
    ppeOk: c.ppe_ok,
    lotoOk: c.loto_ok,
    equipmentOk: c.equipment_ok,
  }));

  // Documents → DocumentsTable expects { id, name, type, size, uploadDate }
  const mappedDocuments = documents.map(d => ({
    id: d.id,
    name: d.name,
    type: d.classification?.type || "PDF",
    size: d.chunksCount ? `${d.chunksCount} chunks` : "—",
    uploadDate: d.uploadedAt ? d.uploadedAt.split("T")[0] : new Date().toISOString().split("T")[0],
  }));

  // Recent questions → FeedCard items
  const recentQuestionItems = (stats?.recentQuestions || []).slice(0, 7).map(q => ({
    id: q.id,
    text: q.question,
    timestamp: formatTimeAgo(q.created_at),
    category: q.topic || "General",
  }));

  // Activity → FeedCard items
  const activityItems = activityFeed.map(a => ({
    id: a.id,
    text: a.message,
    timestamp: formatTimeAgo(a.time),
  }));

  // Knowledge gaps → KnowledgeGaps component
  const mappedGaps = gaps.map(g => ({
    id: g.id,
    question: g.suggestedPolicy || g.cluster?.[0] || "Unknown gap",
    frequency: g.frequency,
    category: TOPIC_LABELS[g.topic]?.label || g.topic,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--page-bg,#f9fafb)]">

      {/* ── Existing modals preserved exactly ─────────────────────────────────── */}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-white rounded-2xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedIssue.severity === "high" ? "bg-red-100" : selectedIssue.severity === "medium" ? "bg-amber-100" : "bg-green-100"}`}>
                  <AlertTriangle className={`w-5 h-5 ${selectedIssue.severity === "high" ? "text-red-600" : selectedIssue.severity === "medium" ? "text-amber-600" : "text-green-600"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-900">Issue #{selectedIssue.id.slice(0, 8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(selectedIssue.created_at)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="text-xs font-medium text-gray-500">Reported By</label><p className="text-gray-900 dark:text-gray-900">{selectedIssue.worker_name || "Unknown Worker"}</p></div>
              {selectedIssue.equipment && <div><label className="text-xs font-medium text-gray-500">Equipment</label><p className="text-gray-900 dark:text-gray-900">{selectedIssue.equipment}</p></div>}
              <div><label className="text-xs font-medium text-gray-500">Description</label><p className="text-gray-900 dark:text-gray-900">{selectedIssue.description}</p></div>
              <div className="flex gap-4">
                <div><label className="text-xs font-medium text-gray-500">Severity</label><p className={`capitalize font-medium ${selectedIssue.severity === "high" ? "text-red-600" : selectedIssue.severity === "medium" ? "text-amber-600" : "text-green-600"}`}>{selectedIssue.severity}</p></div>
                <div><label className="text-xs font-medium text-gray-500">Status</label><p className={`capitalize font-medium ${selectedIssue.status === "open" ? "text-amber-600" : "text-green-600"}`}>{selectedIssue.status}</p></div>
              </div>
              {selectedIssue.resolved_at && <div><label className="text-xs font-medium text-gray-500">Resolved</label><p className="text-gray-700 dark:text-gray-600">{formatTimeAgo(selectedIssue.resolved_at)} {selectedIssue.resolved_by && `by ${selectedIssue.resolved_by}`}</p></div>}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-200">
              {selectedIssue.status === "open" ? (
                <button onClick={() => updateIssue(selectedIssue.id, { status: "resolved", resolved_by: currentCompany?.name })} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-900 rounded-lg font-medium hover:bg-green-700"><CheckCircle2 className="w-4 h-4" /> Mark Resolved</button>
              ) : (
                <button onClick={() => updateIssue(selectedIssue.id, { status: "open" })} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg font-medium hover:bg-amber-700"><CircleDot className="w-4 h-4" /> Reopen</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-900 font-medium ${getAvatarColor(selectedWorker.name || "")}`}>{selectedWorker.name ? getInitials(selectedWorker.name) : <User className="w-6 h-6" />}</div>
                <div><h3 className="font-semibold text-gray-900 dark:text-gray-900">{selectedWorker.name || "Unknown Worker"}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{selectedWorker.phone}</p></div>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-gray-900">{workerQuestions.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Questions</p></div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-gray-900">{workerQuestions.length > 0 ? Math.round(workerQuestions.reduce((a, q) => a + q.confidence, 0) / workerQuestions.length) : 0}%</p><p className="text-xs text-gray-500 dark:text-gray-400">Avg Confidence</p></div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-gray-900">{selectedWorker.registered_at ? formatTimeAgo(selectedWorker.registered_at) : "N/A"}</p><p className="text-xs text-gray-500 dark:text-gray-400">Joined</p></div>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-900 mb-3">Question History</h4>
              <div className="space-y-3">
                {workerQuestions.length === 0 ? <p className="text-center py-8 text-gray-400">No questions yet</p> : workerQuestions.map((q, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2"><p className="font-medium text-gray-900 dark:text-gray-900">{q.question}</p><span className={`text-xs px-2 py-0.5 rounded-full ${q.confidence >= 70 ? "bg-green-100 text-green-700" : q.confidence >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.confidence}%</span></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{q.answer}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(q.created_at)}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-900 mb-3 mt-6">Certifications</h4>
              <div className="space-y-2">
                {certifications.filter(c => c.worker_phone === selectedWorker?.phone).length === 0 ? (
                  <p className="text-center py-4 text-gray-400">No certifications</p>
                ) : certifications.filter(c => c.worker_phone === selectedWorker?.phone).map((cert, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 ${new Date(cert.expiry_date) > new Date() ? "text-green-500" : "text-red-500"}`} />
                      <div><p className="font-medium text-gray-900 dark:text-gray-900">{cert.cert_name}</p><p className="text-xs text-gray-500 dark:text-gray-400">Expires: {new Date(cert.expiry_date).toLocaleDateString()}</p></div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${new Date(cert.expiry_date) > new Date() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{new Date(cert.expiry_date) > new Date() ? "Valid" : "Expired"}</span>
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
          <div className="bg-white dark:bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-200">
              <h3 className="font-semibold text-gray-900 dark:text-gray-900">All Questions</h3>
              <button onClick={() => setShowAllQuestions(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search questions or workers..." value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C96442]" /></div>
                <select value={questionFilter} onChange={(e) => setQuestionFilter(e.target.value as any)} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C96442]"><option value="all">All</option><option value="answered">Answered</option><option value="unanswered">Unanswered</option></select>
              </div>
              <div className="overflow-y-auto max-h-[60vh] space-y-3">
                {filteredQuestions.length === 0 ? <p className="text-center py-8 text-gray-400">No questions found</p> : filteredQuestions.map((q, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-900 font-medium text-sm flex-shrink-0 ${getAvatarColor(q.worker_name || "")}`}>{q.worker_name ? getInitials(q.worker_name) : <User className="w-5 h-5" />}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1"><span className="font-medium text-gray-900">{q.worker_name || "Unknown"}</span><span className={`text-xs px-2 py-0.5 rounded-full ${q.confidence >= 70 ? "bg-green-100 text-green-700" : q.confidence >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.confidence}% confidence</span></div>
                        <p className="text-gray-700 mb-2">{q.question}</p>
                        <p className="text-sm text-gray-500">{q.answer}</p>
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
          <div className="bg-white dark:bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-200"><div className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-gray-900 dark:text-gray-900">Generated Policy Draft</h3></div><button onClick={() => setDraftModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-6 overflow-y-auto max-h-[60vh]"><pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-600 font-sans leading-relaxed">{draftModal.draft}</pre></div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-200"><button onClick={() => setDraftModal(null)} className="px-4 py-2 text-gray-600">Close</button><button onClick={() => navigator.clipboard.writeText(draftModal.draft)} className="px-4 py-2 bg-[#C96442] text-gray-900 rounded-lg font-medium hover:bg-blue-700">Copy to Clipboard</button></div>
          </div>
        </div>
      )}

      {/* Unanswered Question Modal */}
      {selectedUQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedUQ(null)}>
          <div className="bg-white dark:bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100"><MessageSquare className="w-5 h-5 text-[#C96442]" /></div>
                  <div><p className="font-semibold text-gray-900 dark:text-gray-900">{selectedUQ.worker_name || "Worker"}</p><p className="text-xs text-gray-400">{selectedUQ.created_at ? new Date(selectedUQ.created_at).toLocaleString() : ""}</p></div>
                </div>
                <button onClick={() => setSelectedUQ(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium mb-1 text-gray-500">Question</p>
              <p className="text-base mb-4 text-gray-900 dark:text-gray-900">{selectedUQ.question}</p>
              <p className="text-sm font-medium mb-2 text-gray-500">Your Answer</p>
              <textarea value={uqAnswer} onChange={e => setUqAnswer(e.target.value)} placeholder="Type your answer here..." rows={4} className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C96442]" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-400">Response will be sent via SMS and saved permanently</p>
              <div className="flex gap-2">
                <button onClick={() => setSelectedUQ(null)} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-100">Cancel</button>
                <button onClick={() => { setSelectedUQ(null); setUqAnswer(""); }} className="px-4 py-2 text-sm rounded-lg bg-[#C96442] text-gray-900 hover:bg-blue-700 font-medium">Send Answer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New design layout ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30">
        <TopBar />
      </div>

      {/* SubHeader with real company selector */}
      <div className="bg-white dark:bg-white border-b border-gray-200 dark:border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">An overview of how your team is using Sidekick.</p>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border border-gray-200 dark:border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C96442]"
            >
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TabNav wired to real tab state */}
      <div className="border-b border-gray-200 dark:border-gray-200 bg-white dark:bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex gap-0 overflow-x-auto">
            {([
              { id: "analytics",  label: "Analytics",  Icon: BarChart3 },
              { id: "alerts",     label: "Alerts",     Icon: AlertTriangle },
              { id: "documents",  label: "Documents",  Icon: FileText },
              { id: "ai-studio",  label: "AI Studio",  Icon: Sparkles },
              { id: "workers",    label: "Workers",    Icon: Users },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#C96442] text-gray-900 dark:text-gray-900"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-600"
                }`}
              >
                <tab.Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "alerts" && openIssuesCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${openHighPriorityCount > 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{openIssuesCount}</span>
                )}
                {tab.id === "workers" && companyWorkers.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{companyWorkers.length}</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={() => setShowQrModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#C96442] text-gray-900 text-sm font-medium rounded-lg hover:bg-blue-700">
            <QrCode className="h-4 w-4" /> Invite Workers
          </button>
        </div>
      </div>

      {/* QR Code Modal (existing logic, new component) */}
      {showQrModal && currentCompany?.access_code && (
        <QRCodeModal
          joinCode={currentCompany.access_code}
          open={showQrModal}
          onOpenChange={setShowQrModal}
        />
      )}

      {/* ── Tab content ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Questions Today" value={stats?.todayCount || 0} icon={MessageSquare} subtext={`${stats?.weekCount || 0} this week`} change={weekTrend || undefined} />
              <MetricCard label="Answer Accuracy" value={`${stats?.avgConfidence || 0}%`} icon={Target} subtext={`${stats?.answeredRate || 0}% answered`} />
              <MetricCard label="Open Issues" value={openIssuesCount} icon={AlertTriangle} iconClassName="h-5 w-5 text-amber-500" accentColor="amber" subtext={openHighPriorityCount > 0 ? `${openHighPriorityCount} urgent` : "View all →"} />
              <HealthScoreCard score={healthScore} />
            </div>
            <QuestionsPerHourChart />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <CategorySummary />
              <AnswerSourcesChart />
              <TopGapsTable />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <QuestionsChart />
              <ResolutionChart />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FeedCard
                title="Recent Questions"
                icon={MessageSquare}
                items={recentQuestionItems}
                emptyTitle="No questions yet"
                emptyDescription="Questions from workers will appear here."
                showSeeAll
                onSeeAll={() => setShowAllQuestions(true)}
              />
              <FeedCard
                title="Activity"
                icon={Activity}
                items={activityItems}
                emptyTitle="No recent activity"
                emptyDescription="Team activity will show up here."
              />
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <AlertMetrics alerts={mappedAlerts} />
            <AlertCharts alerts={mappedAlerts} />
            <AlertsTable alerts={mappedAlerts} />

            {/* Unanswered Questions — preserved from existing dashboard */}
            {unansweredQuestions.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-5">
                <SectionHeader title="Unanswered Questions" subtitle="Questions Sidekick could not answer — your response will be saved permanently" />
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {unansweredQuestions.map((q: any, i: number) => (
                    <div key={q.id || i} onClick={() => { setSelectedUQ(q); setUqAnswer(""); }} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/50">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100"><MessageSquare className="w-5 h-5 text-[#C96442]" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-900">{q.question}</p>
                        <p className="text-xs mt-1 text-gray-400">Asked by {q.worker_name || "Worker"} · {q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Needs Answer</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Upload zone wired to real upload handler */}
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input type="file" id="upload" className="hidden" accept=".pdf,.txt,.doc,.docx,.xlsx,.csv" onChange={handleUpload} disabled={uploading} />
              <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-600">{uploading ? "Uploading..." : "Drop files here or click to upload"}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, Word, Excel, or text files</p>
                </div>
              </label>
            </div>

            {/* Real integrations preserved */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-5">
              <SectionHeader title="Import from Integrations" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GoogleDriveIntegration companyId={selectedCompany} darkMode={false} onDocumentImported={(doc) => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title, confidence: 1 } }])} />
                <DropboxIntegration companyId={selectedCompany} darkMode={false} onDocumentImported={(doc) => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title, confidence: 1 } }])} />
                <GustoIntegration companyId={selectedCompany} darkMode={false} onEmployeesImported={(count) => console.log("Imported employees:", count)} />
                <MicrosoftTeamsIntegration companyId={selectedCompany} darkMode={false} />
              </div>
            </div>

            {/* Documents table wired to real data */}
            <DocumentsTab companyId={selectedCompany} documents={mappedDocuments} />
          </div>
        )}

        {/* AI STUDIO TAB */}
        {activeTab === "ai-studio" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-900">Create Content</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate training materials, policies, and guides from your facility knowledge</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-6">
                <ContentCards showMockData={false} />

                {/* Real WalkthroughUpload preserved */}
                <WalkthroughUpload
                  companyId={selectedCompany}
                  darkMode={false}
                  onComplete={(result) => {
                    console.log("Walkthrough processed:", result.locations, "locations,", result.faqs, "FAQs");
                    fetch(`/api/walkthroughs?companyId=${selectedCompany}`).then(r => r.json()).then(d => setWalkthroughs(d.walkthroughs || []));
                  }}
                />

                {/* Knowledge gaps wired to real analyzed gaps */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-900">Generate from Knowledge Gaps</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create policies based on unanswered worker questions</p>
                      </div>
                    </div>
                    <button onClick={analyzeGaps} disabled={analyzingGaps || !stats?.knowledgeGaps?.length} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-sm font-medium disabled:opacity-50">
                      <Zap className={`h-4 w-4 ${analyzingGaps ? "animate-spin" : ""}`} />
                      {analyzingGaps ? "Analyzing..." : "Analyze Gaps"}
                    </button>
                  </div>
                  {mappedGaps.length === 0 ? (
                    <EmptyState icon={Lightbulb} title="No knowledge gaps detected yet" description="Knowledge gaps will appear here when workers ask questions your documents don't cover." />
                  ) : (
                    <div className="space-y-3">
                      {mappedGaps.slice(0, 5).map(gap => (
                        <div key={gap.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-200 last:border-0">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-gray-900">{gap.question}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{gap.category}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 shrink-0">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{gap.frequency} asks</span>
                            <button onClick={() => generateDraft(gaps.find(g => g.id === gap.id)!)} disabled={generatingDraft === gap.id} className="text-xs px-3 py-1.5 bg-[#C96442] text-gray-900 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                              {generatingDraft === gap.id ? "..." : "Generate"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <StorageSidebar showMockData={false} />
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === "workers" && (
          <div className="space-y-6">
            {/* Registration card with real company access code */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-5">
              <SectionHeader
                title="Worker Registration"
                action={
                  <button onClick={() => setShowQrModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#C96442] text-gray-900 rounded-lg text-sm font-medium hover:bg-blue-700">
                    <QrCode className="h-4 w-4" /> Show QR Code
                  </button>
                }
              />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Workers text this to join:</p>
                  <p className="font-mono text-2xl font-bold text-[#C96442] dark:text-[#C96442] tracking-wider">JOIN {currentCompany?.access_code || "XXXXXX"}</p>
                  <p className="text-xs text-gray-400">Send to: +1 (888) 707-4659</p>
                </div>
                <button onClick={copyAccessCode} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-white">
                  {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Workers table wired to real data */}
            <WorkersTab joinCode={currentCompany?.access_code} />

            {/* Certifications — real data */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-5">
              <SectionHeader
                title="Certifications"
                subtitle="Worker certification status and expiry dates"
                action={
                  <button onClick={() => setShowAddCertModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#C96442] text-gray-900 rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                }
              />
              {mappedCerts.length === 0 ? (
                <EmptyState icon={Award} title="No certifications tracked" description="Worker certifications will appear here once added." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-200"><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Worker</th><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Certification</th><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Expiry</th><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Status</th><th className="pb-2"></th></tr></thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {mappedCerts.map(cert => {
                        const valid = new Date(cert.expiryDate) > new Date();
                        return (
                          <tr key={cert.id}>
                            <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-900">{cert.workerName}</td>
                            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{cert.certName}</td>
                            <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{new Date(cert.expiryDate).toLocaleDateString()}</td>
                            <td className="py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${valid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{valid ? "Valid" : "Expired"}</span></td>
                            <td className="py-2.5 text-right"><button onClick={() => deleteCertification(cert.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add Cert Modal */}
            {showAddCertModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-gray-900">Add Certification</h3><button onClick={() => setShowAddCertModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
                  <div className="space-y-4">
                    <div><label className="text-sm font-medium text-gray-700 dark:text-gray-600 mb-1 block">Worker</label><select value={newCert.workerPhone} onChange={e => setNewCert(p => ({...p, workerPhone: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]"><option value="">Select worker...</option>{companyWorkers.map(w => <option key={w.phone} value={w.phone}>{w.name || w.phone}</option>)}</select></div>
                    <div><label className="text-sm font-medium text-gray-700 dark:text-gray-600 mb-1 block">Certification Type</label><input type="text" value={newCert.certType} onChange={e => setNewCert(p => ({...p, certType: e.target.value}))} placeholder="e.g. Forklift Operator" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]" /></div>
                    <div><label className="text-sm font-medium text-gray-700 dark:text-gray-600 mb-1 block">Expiry Date</label><input type="date" value={newCert.expiryDate} onChange={e => setNewCert(p => ({...p, expiryDate: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]" /></div>
                  </div>
                  <div className="flex gap-3 mt-6"><button onClick={() => setShowAddCertModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button><button onClick={addCertification} className="flex-1 px-4 py-2 bg-[#C96442] text-gray-900 rounded-lg text-sm font-medium hover:bg-blue-700">Add Certification</button></div>
                </div>
              </div>
            )}

            {/* Safety Checklists — real data */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-5">
              <SectionHeader
                title="Safety Checklists"
                subtitle="Pre-shift safety compliance"
                action={checklistStats ? <span className={`text-sm font-medium ${checklistStats.complianceRate === 100 ? "text-emerald-600" : "text-amber-600"}`}>{checklistStats.complianceRate}% compliant today</span> : undefined}
              />
              {mappedChecklists.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No checklists submitted" description="Pre-shift safety checklists submitted by workers will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-200"><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Worker</th><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Date</th><th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">PPE</th><th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">LOTO</th><th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">Equipment</th><th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Result</th></tr></thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {mappedChecklists.map(entry => {
                        const passed = entry.ppeOk && entry.lotoOk && entry.equipmentOk;
                        const icon = (v: boolean | null) => v === true ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : v === false ? <XCircle className="h-4 w-4 text-red-500 mx-auto" /> : <Minus className="h-4 w-4 text-gray-600 mx-auto" />;
                        return (
                          <tr key={entry.id}>
                            <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-900">{entry.workerName}</td>
                            <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{new Date(entry.shiftDate + 'T12:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric'})}</td>
                            <td className="py-2.5 text-center">{icon(entry.ppeOk)}</td>
                            <td className="py-2.5 text-center">{icon(entry.lotoOk)}</td>
                            <td className="py-2.5 text-center">{icon(entry.equipmentOk)}</td>
                            <td className="py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{passed ? "Passed" : "Failed"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
