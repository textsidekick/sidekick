"use client";
import { OpsNav } from "@/components/dashboard/layout/OpsNav";

// ─── Existing integrations & utilities (unchanged) ────────────────────────────
import WalkthroughUpload from "@/components/WalkthroughUpload";
import GoogleDriveIntegration from "@/components/GoogleDriveIntegration";
import DropboxIntegration from "@/components/DropboxIntegration";
import GustoIntegration from "@/components/GustoIntegration";
import MicrosoftTeamsIntegration from "@/components/MicrosoftTeamsIntegration";
import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Upload, FileText, Trash2, BarChart3, Building2, Users, Phone,
  TrendingUp, MessageSquare, AlertTriangle, Target, BookOpen,
  RefreshCw, Lightbulb, Sparkles, ArrowUp, ArrowDown, FileCheck, X,
  Filter, Download, Settings, CheckCircle, User, Search, Plus, QrCode,
  Bell, Activity, ChevronDown, ExternalLink, Copy, Check, Home,
  Calendar, Hash, Globe, Award, TrendingDown, Minus, Car, CalendarDays, Shield, DollarSign, HeartPulse, GraduationCap, Coffee, Shirt, Palmtree,
  Wrench, AlertCircle, CheckCircle2, CircleDot, ClipboardList, Send, Edit2, XCircle
} from "lucide-react";

// ─── New design components ────────────────────────────────────────────────────
import { TopBar } from "@/components/dashboard/layout/TopBar";
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
import KnowledgeBaseViewer from "@/components/dashboard/documents/KnowledgeBaseViewer";
import GeneratedReports from "@/components/dashboard/documents/GeneratedReports";
import QuickStats from "@/components/dashboard/QuickStats";
import SMSSimulator from "@/components/dashboard/SMSSimulator";
import DemoMode from "@/components/dashboard/DemoMode";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";
import { WorkersTab } from "@/components/dashboard/workers/WorkersTab";
import { QRCodeModal } from "@/components/dashboard/workers/QRCodeModal";
import {
  IssueDetailModal,
  WorkerDetailModal,
  AllQuestionsModal,
  DraftModal,
  UnansweredQuestionModal,
  AddCertificationModal,
} from "@/components/dashboard/modals";

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
  // Read tab from URL query param if present
  const [activeTab, setActiveTab] = useState<"analytics" | "alerts" | "documents" | "workers" | "test">("analytics");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["analytics", "alerts", "documents", "workers", "test"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, []);
  const [workersSubTab, setWorkersSubTab] = useState<"team" | "certifications" | "safety">("team");
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
  const [trialInfo, setTrialInfo] = useState<{plan: string; questionsUsed: number; questionsLimit: number; trialEndsAt: string} | null>(null);

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
    try {
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (authData.plan) {
        setTrialInfo({
          plan: authData.plan,
          questionsUsed: authData.questionsUsed || 0,
          questionsLimit: authData.questionsLimit || 50,
          trialEndsAt: authData.trialEndsAt || "",
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      let allCompanies = d.companies || [];
      try {
        const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        const userPhone = authData.phone || "";
        const isAdmin = userPhone.includes("4088285979");
        if (!isAdmin && userPhone) {
          allCompanies = allCompanies.filter((c: any) => c.manager_phone === userPhone || c.manager_phone === userPhone.replace("+1", "+"));
        } else if (authData.companyId && !isAdmin) {
          allCompanies = allCompanies.filter((c: any) => c.id === authData.companyId);
        }
      } catch {}
      setCompanies(allCompanies);
      // Sync company selection from localStorage (set by OpsNav)
      const savedAuth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (savedAuth.companyId && allCompanies.some((c: any) => c.id === savedAuth.companyId)) {
        setSelectedCompany(savedAuth.companyId);
      } else if (allCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(allCompanies[0].id);
      }
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

  const mappedAlerts = issues.map(i => ({
    id: i.id,
    issue: i.description,
    worker: i.worker_name || "Unknown",
    severity: i.severity as "high" | "medium" | "low",
    status: i.status as "open" | "resolved",
    date: i.created_at.split("T")[0],
    category: (i.equipment ? "equipment" : "safety") as "safety" | "equipment" | "compliance" | "health",
  }));

  const mappedWorkers = companyWorkers.map(w => ({
    id: w.phone,
    name: w.name || "Unknown Worker",
    phone: w.phone,
    joinDate: w.registered_at ? w.registered_at.split("T")[0] : new Date().toISOString().split("T")[0],
    status: (w.name ? "verified" : "pending") as "verified" | "pending",
  }));

  const mappedCerts = certifications.map((c, i) => ({
    id: c.id || String(i),
    workerName: c.worker_name || "Unknown",
    certName: c.cert_name || c.certType || "Certification",
    expiryDate: c.expiry_date || c.expiryDate || "",
  }));

  const mappedChecklists = checklists.map((c, i) => ({
    id: c.id || String(i),
    workerName: c.worker_name || "Unknown",
    shiftDate: c.shift_date,
    ppeOk: c.ppe_ok,
    lotoOk: c.loto_ok,
    equipmentOk: c.equipment_ok,
  }));

  const mappedDocuments = documents.map(d => ({
    id: d.id,
    name: d.name,
    type: d.classification?.type || "PDF",
    size: d.chunksCount ? `${d.chunksCount} chunks` : "—",
    uploadDate: d.uploadedAt ? d.uploadedAt.split("T")[0] : new Date().toISOString().split("T")[0],
  }));

  const recentQuestionItems = (stats?.recentQuestions || []).slice(0, 7).map(q => ({
    id: q.id,
    text: q.question,
    timestamp: formatTimeAgo(q.created_at),
    category: q.topic || "General",
  }));

  const activityItems = activityFeed.map(a => ({
    id: a.id,
    text: a.message,
    timestamp: formatTimeAgo(a.time),
  }));

  const mappedGaps = gaps.map(g => ({
    id: g.id,
    question: g.suggestedPolicy || g.cluster?.[0] || "Unknown gap",
    frequency: g.frequency,
    category: TOPIC_LABELS[g.topic]?.label || g.topic,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--page-bg,#f9fafb)]">

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={updateIssue}
        companyName={currentCompany?.name}
      />

      <WorkerDetailModal
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
        workerQuestions={workerQuestions}
        certifications={certifications}
      />

      <AllQuestionsModal
        open={showAllQuestions}
        onClose={() => setShowAllQuestions(false)}
        filteredQuestions={filteredQuestions}
        questionSearch={questionSearch}
        setQuestionSearch={setQuestionSearch}
        questionFilter={questionFilter}
        setQuestionFilter={setQuestionFilter}
      />

      <DraftModal
        modal={draftModal}
        onClose={() => setDraftModal(null)}
      />

      <UnansweredQuestionModal
        question={selectedUQ}
        onClose={() => setSelectedUQ(null)}
        answer={uqAnswer}
        setAnswer={setUqAnswer}
        onSend={() => { setSelectedUQ(null); setUqAnswer(""); }}
      />

      <AddCertificationModal
        open={showAddCertModal}
        onClose={() => setShowAddCertModal(false)}
        newCert={newCert}
        setNewCert={setNewCert}
        companyWorkers={companyWorkers}
        onAdd={addCertification}
      />

      {/* ── New design layout ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30">
        <TopBar />
      </div>

      {/* Shared navigation — same OpsNav as all other pages */}
      <OpsNav />

      {/* QR Code Modal */}
      {showQrModal && currentCompany?.access_code && (
        <QRCodeModal
          joinCode={currentCompany.access_code}
          open={showQrModal}
          onOpenChange={setShowQrModal}
        />
      )}

      {/* ── Tab content ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Quick Stats + Language Badge + Demo Mode — analytics only */}
            <QuickStats companyId={selectedCompany} />
            <div className="flex items-center justify-end gap-4">
              <DemoMode companyId={selectedCompany} />
            </div>

            {/* Upgrade banner for trial users — analytics only */}
            {trialInfo?.plan === "trial" && (
              <UpgradeBanner companyId={selectedCompany} plan={trialInfo.plan} />
            )}

            {stats && stats.totalQuestions === 0 && (
              <div style={{ maxWidth: 600, margin: "20px auto", textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16, border: "1px solid rgba(28,26,22,0.08)" }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1C1A16", marginBottom: 8 }}>No questions yet</h2>
                <p style={{ fontSize: 15, color: "rgba(28,26,22,0.5)", marginBottom: 24 }}>Share your access code with workers so they can start texting questions.</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "rgba(201,100,66,0.08)", borderRadius: 10, fontSize: 14, color: "#A74D30", fontWeight: 500 }}>
                  Workers text <strong style={{ marginLeft: 4 }}>JOIN {currentCompany?.access_code || "CODE"}</strong> <span style={{ marginLeft: 4 }}>to +1 (888) 707-4659</span>
                </div>
              </div>
            )}

            {/* Hero row: 4 metric cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Questions Today" value={stats?.todayCount || 0} icon={MessageSquare} subtext={`${stats?.weekCount || 0} this week`} change={weekTrend || undefined} />
              <MetricCard label="Answer Accuracy" value={`${stats?.avgConfidence || 0}%`} icon={Target} subtext={`${stats?.answeredRate || 0}% answered`} />
              <MetricCard label="Open Issues" value={openIssuesCount} icon={AlertTriangle} iconClassName="h-5 w-5 text-amber-500" accentColor="amber" subtext={openHighPriorityCount > 0 ? `${openHighPriorityCount} urgent` : "View all →"} />
              <HealthScoreCard score={healthScore} />
            </div>

            {/* Main chart: full width */}
            <QuestionsPerHourChart data={
              Array.from({ length: 24 }, (_, i) => ({
                hour: i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`,
                questions: byHour[i] || 0,
              }))
            } />

            {/* Three-column row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <CategorySummary data={Object.entries(stats?.byTopic || {}).map(([topic, count]) => {
                const topicColors: Record<string, string> = {
                  parking: 'bg-blue-400', schedule: 'bg-purple-400', safety: 'bg-red-400',
                  compensation: 'bg-green-400', benefits: 'bg-pink-400', breaks: 'bg-amber-400',
                  dress_code: 'bg-indigo-400', contacts: 'bg-cyan-400', training: 'bg-violet-400',
                  pto: 'bg-teal-400', general: 'bg-slate-400',
                };
                return { name: TOPIC_LABELS[topic]?.label || topic, count: count as number, color: topicColors[topic] || 'bg-gray-400' };
              })} />
              <AnswerSourcesChart data={stats ? [
                { name: 'Answered', value: Math.round((stats.totalQuestions * stats.answeredRate) / 100), color: '#10b981', darkColor: '#34d399' },
                { name: 'Unanswered', value: Math.round((stats.totalQuestions * (100 - stats.answeredRate)) / 100), color: '#e2e8f0', darkColor: '#475569' },
              ].filter(d => d.value > 0) : []} />
              <TopGapsTable gaps={mappedGaps} />
            </div>

            {/* Two-column row: charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <QuestionsChart data={(() => {
                const byDate: Record<string, number> = {};
                (stats?.recentQuestions || []).forEach(q => {
                  const d = q.created_at.split('T')[0];
                  byDate[d] = (byDate[d] || 0) + 1;
                });
                return Object.entries(byDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(-14)
                  .map(([date, count]) => ({
                    label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    count,
                  }));
              })()} />
              <ResolutionChart data={stats ? [{
                label: 'Overall',
                resolved: Math.round((stats.totalQuestions * stats.answeredRate) / 100),
                unanswered: Math.round((stats.totalQuestions * (100 - stats.answeredRate)) / 100),
              }] : []} />
            </div>

            {/* Two-column row: feeds */}
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

            {unansweredQuestions.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <SectionHeader title="Unanswered Questions" subtitle="Questions Sidekick could not answer — your response will be saved permanently" />
                <div className="divide-y divide-gray-100">
                  {unansweredQuestions.map((q: any, i: number) => (
                    <div key={q.id || i} onClick={() => { setSelectedUQ(q); setUqAnswer(""); }} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100"><MessageSquare className="w-5 h-5 text-[#C96442]" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{q.question}</p>
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
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input type="file" id="upload" className="hidden" accept=".pdf,.txt,.doc,.docx,.xlsx,.csv" onChange={handleUpload} disabled={uploading} />
              <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{uploading ? "Uploading..." : "Drop files here or click to upload"}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, or text files</p>
                </div>
              </label>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <SectionHeader title="Import from Integrations" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GoogleDriveIntegration companyId={selectedCompany} darkMode={false} onDocumentImported={(doc) => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title, confidence: 1 } }])} />
                <DropboxIntegration companyId={selectedCompany} darkMode={false} onDocumentImported={(doc) => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title, confidence: 1 } }])} />
                <MicrosoftTeamsIntegration companyId={selectedCompany} darkMode={false} />
                <GustoIntegration companyId={selectedCompany} darkMode={false} onEmployeesImported={(count) => console.log("Imported employees:", count)} />
              </div>
            </div>

            <DocumentsTable documents={mappedDocuments} />
            <GeneratedReports companyId={selectedCompany} />
            <KnowledgeBaseViewer companyId={selectedCompany} />
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === "workers" && (
          <div className="space-y-6">
            {/* Sub-navigation */}
            <div className="flex gap-2">
              {(["team", "certifications", "safety"] as const).map(sub => (
                <button
                  key={sub}
                  onClick={() => setWorkersSubTab(sub)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    workersSubTab === sub
                      ? "bg-[#C96442] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sub === "team" ? "Team" : sub === "certifications" ? "Certifications" : "Safety Checklists"}
                </button>
              ))}
            </div>

            {/* Team sub-tab */}
            {workersSubTab === "team" && (
              <WorkersTab joinCode={currentCompany?.access_code} />
            )}

            {/* Certifications sub-tab */}
            {workersSubTab === "certifications" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <SectionHeader
                  title="Certifications"
                  subtitle="Worker certification status and expiry dates"
                  action={
                    <button onClick={() => setShowAddCertModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#C96442] text-white rounded-lg text-sm font-medium hover:opacity-90">
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  }
                />
                {mappedCerts.length === 0 ? (
                  <EmptyState icon={Award} title="No certifications tracked" description="Worker certifications will appear here once added." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Worker</th>
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Certification</th>
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Expiry</th>
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Status</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mappedCerts.map(cert => {
                          const valid = new Date(cert.expiryDate) > new Date();
                          return (
                            <tr key={cert.id}>
                              <td className="py-2.5 pr-4 font-medium text-gray-900">{cert.workerName}</td>
                              <td className="py-2.5 pr-4 text-gray-600">{cert.certName}</td>
                              <td className="py-2.5 pr-4 text-gray-500">{new Date(cert.expiryDate).toLocaleDateString()}</td>
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
            )}

            {/* Safety Checklists sub-tab */}
            {workersSubTab === "safety" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
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
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Worker</th>
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Date</th>
                          <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">PPE</th>
                          <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">LOTO</th>
                          <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">Equipment</th>
                          <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mappedChecklists.map(entry => {
                          const passed = entry.ppeOk && entry.lotoOk && entry.equipmentOk;
                          const icon = (v: boolean | null) => v === true ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : v === false ? <XCircle className="h-4 w-4 text-red-500 mx-auto" /> : <Minus className="h-4 w-4 text-gray-400 mx-auto" />;
                          return (
                            <tr key={entry.id}>
                              <td className="py-2.5 pr-4 font-medium text-gray-900">{entry.workerName}</td>
                              <td className="py-2.5 pr-4 text-gray-500">{new Date(entry.shiftDate + 'T12:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric'})}</td>
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
            )}
          </div>
        )}

        {/* TEST TAB - SMS Simulator */}
        {activeTab === "test" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Test Your Knowledge Base</h2>
              <p className="text-sm text-gray-500 mt-1">See how workers experience Sidekick via SMS. Ask a question below.</p>
            </div>
            <SMSSimulator companyId={selectedCompany} />
          </div>
        )}
      </div>
    </div>
  );
}
