"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Wrench,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Trash2,
  Link2,
  Loader2,
  Edit3,
  XCircle,
  FileText,
  Plus,
  Search,
  User,
  Tag,
  History,
  Users,
} from "lucide-react";
import GeneratedReports from "@/components/dashboard/documents/GeneratedReports";
import KnowledgeBaseViewer from "@/components/dashboard/documents/KnowledgeBaseViewer";
import { cn } from "@/lib/utils";
import { buildScopedUrl, readDashboardScope } from "@/lib/dashboard-scope";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SOP {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  version_number: number;
  is_current: boolean;
  status: "draft" | "active" | "deprecated";
  tags: string[];
  language: string;
  category: string;
  department_id: string | null;
  created_by: string;
  approved_by: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  name: string;
  color: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  problem: string;
  symptoms: string;
  solution: string;
  equipment_type: string;
  asset_name: string;
  parts_used: string[];
  tags: string[];
  time_estimate_minutes: number;
  times_referenced: number;
  source_work_order_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface KnowledgeGap {
  question: string;
  count: number;
}

type ReviewModalState =
  | { type: "reject"; articleId: string }
  | { type: "snooze"; articleId: string }
  | { type: "edit"; articleId: string; article: KnowledgeArticle }
  | null;

// ─── SOPs tab ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-white text-slate-700 border-slate-200",
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    deprecated: "bg-gray-100 text-gray-500 border-gray-200 line-through",
  };
  return (
    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", styles[status] || "bg-gray-100 text-gray-500")}>
      {status}
    </span>
  );
}

function SOPForm({ departments, companyId, onSave, onClose }: {
  departments: Department[];
  companyId: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId, title: title.trim(), description: description.trim(),
          content: content.trim(), category: category.trim(),
          department_id: departmentId || null,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          language, publish: true, status: "active",
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save SOP"); }
      else onSave();
    } catch { setError("Network error"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onClose}>
      <form className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New SOP / Procedure</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
        </div>
        {error && <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 border border-slate-200">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="e.g. Machine A Startup Procedure" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="Brief summary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Content *</label>
            <p className="mb-1 text-xs text-gray-400">Workers receive this over SMS. Keep steps clear and concise.</p>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={8} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder={"Step 1: ...\nStep 2: ...\nStep 3: ..."} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="e.g. Safety, Maintenance" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30">
                <option value="">All departments</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30">
                <option value="en">English</option>
                <option value="ko">Korean (한국어)</option>
                <option value="es">Spanish (Español)</option>
                <option value="zh">Chinese (中文)</option>
                <option value="vi">Vietnamese (Tiếng Việt)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Tags (comma-separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="startup, safety, machine-a" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#0060F0] px-5 py-2 text-sm font-medium text-white hover:bg-[#004BB8] disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Publish SOP
          </button>
        </div>
      </form>
    </div>
  );
}

function SopsTab({ companyId }: { companyId: string }) {
  const [sops, setSops] = useState<SOP[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterDept, setFilterDept] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/sops?companyId=${companyId}&status=${filterStatus}&all_versions=false`).then((r) => r.json()),
      fetch(`/api/departments?companyId=${companyId}`).then((r) => r.json()),
    ]).then(([sopData, deptData]) => {
      setSops(sopData.sops || []);
      setDepartments(deptData.departments || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [companyId, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredSops = sops.filter((s) => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()) || s.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDept = !filterDept || s.department_id === filterDept;
    return matchSearch && matchDept;
  });

  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SOPs..." className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30">
          <option value="active">Active</option>
          <option value="draft">Drafts</option>
          <option value="deprecated">Deprecated</option>
          <option value="all">All</option>
        </select>
        {departments.length > 0 && (
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30">
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <button onClick={() => setShowForm(true)} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#0060F0] px-4 py-2 text-sm font-medium text-white hover:bg-[#004BB8]">
          <Plus className="h-4 w-4" /> New SOP
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <strong>Text access:</strong> Workers can text <code className="rounded bg-slate-100 px-1">"SOP for [Topic]"</code> to get the latest version over SMS instantly.
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading SOPs…</div>
        ) : filteredSops.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">No SOPs yet</p>
            <p className="mt-1 text-sm text-gray-400">Add your first procedure so workers can access it over text.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0060F0] px-4 py-2 text-sm font-medium text-white hover:bg-[#004BB8]">
              <Plus className="h-4 w-4" /> Create first SOP
            </button>
          </div>
        ) : filteredSops.map((sop) => (
          <div key={sop.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button onClick={() => setExpanded(expanded === sop.id ? null : sop.id)} className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0060F0] flex-shrink-0" />
                  <span className="font-semibold text-gray-900">{sop.title}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">v{sop.version_number}</span>
                  {statusBadge(sop.status)}
                  {sop.category && <span className="rounded bg-orange-50 px-2 py-0.5 text-xs text-gray-600">{sop.category}</span>}
                  {sop.department_id && deptMap[sop.department_id] && (
                    <span className="rounded bg-white px-2.5 py-1 text-xs text-slate-700 border border-slate-200">{deptMap[sop.department_id]}</span>
                  )}
                </div>
                {sop.description && <p className="mt-1 truncate text-sm text-gray-500">{sop.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  {sop.approved_by && <span className="flex items-center gap-1"><User className="h-3 w-3" /> Approved by {sop.approved_by}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {timeAgo(sop.updated_at)}</span>
                  {sop.language !== "en" && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{sop.language.toUpperCase()}</span>}
                </div>
                {sop.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sop.tags.map((t) => <span key={t} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-gray-500">{t}</span>)}
                  </div>
                )}
              </div>
              {expanded === sop.id ? <ChevronUp className="mt-1 h-5 w-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="mt-1 h-5 w-5 text-gray-400 flex-shrink-0" />}
            </button>
            {expanded === sop.id && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4">
                {/* Approval metadata */}
                <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {sop.approved_by && (
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <User className="h-3.5 w-3.5" /> Approved by {sop.approved_by}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Last updated {timeAgo(sop.updated_at)}
                  </span>
                </div>
                <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Procedure Content</div>
                <pre className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-700 font-sans">{sop.content}</pre>
                {/* Version history */}
                <SOPVersionHistory slug={sop.slug} companyId={companyId} />
                <div className="mt-4 flex gap-3">
                  <button onClick={() => { setExpanded(null); setShowForm(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    <History className="h-3.5 w-3.5" /> New Version
                  </button>
                  {sop.status === "active" && (
                    <button
                      onClick={async () => {
                        if (!confirm("Deprecate this SOP?")) return;
                        await fetch(`/api/sops/${sop.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "deprecated" }) });
                        loadData();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Deprecate
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <SOPForm departments={departments} companyId={companyId} onSave={() => { setShowForm(false); loadData(); }} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

// ─── Articles tab ──────────────────────────────────────────────────────────────

function ProvenanceBadge({ article }: { article: KnowledgeArticle }) {
  const meta = article.metadata || {};
  const source = article.source_work_order_id ? "auto-extraction" : "manual";
  const status = meta.review_status as string | undefined;
  if (status === "verified") {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
        <span className="mt-0.5 text-[10px] text-gray-400">
          Verified by {(meta.verified_by as string) || "—"} · {meta.verified_at ? timeAgo(meta.verified_at as string) : ""} · from {source}
        </span>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
      <CheckCircle2 className="h-3 w-3" /> Verified
    </span>
  );
}

function reviewRisk(article: KnowledgeArticle): "high" | "medium" | "low" {
  if (!article.asset_name && !article.equipment_type) return "high";
  if (!article.symptoms || !article.parts_used?.length) return "medium";
  return "low";
}

function reviewRiskBadge(level: "high" | "medium" | "low") {
  const cls = level === "high" ? "border-slate-200 bg-slate-100 text-gray-700" : level === "medium" ? "border-slate-200 bg-slate-100 text-gray-700" : "border-slate-200 bg-slate-100 text-gray-700";
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", cls)}>{level} risk</span>;
}

function flagExplanation(article: KnowledgeArticle) {
  const flags: string[] = [];
  if (!article.asset_name && !article.equipment_type) flags.push("No linked asset — cannot verify applies to real equipment");
  if (!article.symptoms) flags.push("Missing symptoms — may be harder to discover later");
  if (!article.parts_used?.length) flags.push("No parts listed — technicians may not know what to bring");
  if (article.times_referenced === 0) flags.push("Never referenced yet — usefulness is still unproven");
  return flags;
}

function RejectModal({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 font-semibold text-gray-900">Reject knowledge item</h3>
        <p className="mb-3 text-sm text-gray-500">Why is this item incorrect or not useful?</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="e.g. Wrong procedure for this machine..." />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} className="rounded-lg bg-slate-500 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50">Reject</button>
        </div>
      </div>
    </div>
  );
}

function SnoozeModal({ onConfirm, onCancel }: { onConfirm: (days: number) => void; onCancel: () => void }) {
  const [days, setDays] = useState(7);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 font-semibold text-gray-900">Snooze review</h3>
        <p className="mb-3 text-sm text-gray-500">Come back to this item later.</p>
        <div className="flex gap-2">
          {[1, 3, 7, 14, 30].map((value) => (
            <button key={value} onClick={() => setDays(value)} className={cn("rounded-lg border px-3 py-1.5 text-sm", days === value ? "border-[#0060F0]/20 bg-[#F4F7FA] text-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>{value}d</button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(days)} className="rounded-lg bg-[#0060F0] px-4 py-2 text-sm text-white hover:bg-[#004BB8]">Snooze {days}d</button>
        </div>
      </div>
    </div>
  );
}

function EditVerifyModal({ article, onConfirm, onCancel }: { article: KnowledgeArticle; onConfirm: (edits: Record<string, string>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(article.title);
  const [problem, setProblem] = useState(article.problem);
  const [solution, setSolution] = useState(article.solution);
  const [symptoms, setSymptoms] = useState(article.symptoms || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onCancel}>
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-semibold text-gray-900">Edit & verify</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold uppercase text-gray-500">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" /></div>
          <div><label className="text-xs font-semibold uppercase text-gray-500">Problem</label><textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" /></div>
          <div><label className="text-xs font-semibold uppercase text-gray-500">Symptoms</label><textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" /></div>
          <div><label className="text-xs font-semibold uppercase text-gray-500">Solution</label><textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" /></div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => onConfirm({ title, problem, solution, symptoms })} className="flex items-center gap-1.5 rounded-lg bg-[#0060F0] px-4 py-2 text-sm text-white hover:bg-[#004BB8]">
            <CheckCircle2 className="h-4 w-4" /> Save & verify
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticlesTab({ companyId }: { companyId: string }) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [reviewItems, setReviewItems] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewExpanded, setReviewExpanded] = useState(true);
  const [reviewOpenId, setReviewOpenId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<ReviewModalState>(null);
  const reviewerName = "Manager";

  const loadArticles = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(buildScopedUrl("/api/knowledge", { companyId, locationId: "all" }))
      .then((r) => r.json()).then((d) => setArticles(d.articles || [])).catch(() => setArticles([])).finally(() => setLoading(false));
  }, [companyId]);

  const loadReviewItems = useCallback(() => {
    if (!companyId) return;
    setLoadingReview(true);
    fetch(`/api/knowledge/review?companyId=${companyId}`)
      .then((r) => r.json()).then((d) => setReviewItems(d.items || [])).catch(() => setReviewItems([])).finally(() => setLoadingReview(false));
  }, [companyId]);

  useEffect(() => { if (companyId) { loadArticles(); loadReviewItems(); } }, [companyId, loadArticles, loadReviewItems]);

  const doAction = async (action: string, articleId: string, extra?: Record<string, unknown>) => {
    setActionLoading(articleId);
    try {
      await fetch("/api/knowledge/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId, action, companyId, reviewerName, ...extra }) });
      await Promise.all([loadArticles(), loadReviewItems()]);
      setReviewOpenId((current) => (current === articleId ? null : current));
    } catch {}
    setActionLoading(null);
    setModal(null);
  };

  const bulkVerify = async () => {
    const lowRiskIds = reviewItems.filter((a) => reviewRisk(a) === "low").map((a) => a.id);
    if (!lowRiskIds.length) return;
    setActionLoading("bulk");
    try {
      await fetch("/api/knowledge/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bulk_verify", articleIds: lowRiskIds, companyId, reviewerName }) });
      await Promise.all([loadArticles(), loadReviewItems()]);
    } catch {}
    setActionLoading(null);
  };

  const visibleArticles = useMemo(() =>
    articles.filter((a) => {
      const status = (a.metadata?.review_status as string | undefined) || null;
      if (status === "rejected") return false;
      if (a.source_work_order_id) return status === "verified";
      return true;
    }), [articles]);

  const lowRiskCount = reviewItems.filter((a) => reviewRisk(a) === "low").length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a href="/training" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-[#0060F0]/40 hover:shadow-md transition-all">
          <Users className="h-5 w-5 text-[#0060F0] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Training Paths</p>
            <p className="text-xs text-gray-400">Guide new hires step-by-step over SMS</p>
          </div>
        </a>
      </div>

      <KnowledgeBaseViewer
        companyId={companyId}
        approvedProcedures={
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-gray-400">Loading approved procedures…</div>
            ) : visibleArticles.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No approved procedures yet</p>
              </div>
            ) : visibleArticles.map((article) => (
              <div key={article.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button onClick={() => setExpanded(expanded === article.id ? null : article.id)} className="flex w-full items-start justify-between px-5 py-4 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{article.title}</span>
                      {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-500">{article.problem}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      {article.asset_name && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{article.asset_name}</span>}
                      {article.time_estimate_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.time_estimate_minutes}m</span>}
                      <span className="flex items-center gap-1"><Hash className="h-3 w-3" />Referenced {article.times_referenced || 0}x</span>
                      <ProvenanceBadge article={article} />
                    </div>
                    {article.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {article.tags.map((tag) => <span key={tag} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-gray-600">{tag}</span>)}
                      </div>
                    )}
                  </div>
                  {expanded === article.id ? <ChevronUp className="mt-1 h-5 w-5 text-gray-400" /> : <ChevronDown className="mt-1 h-5 w-5 text-gray-400" />}
                </button>
                {expanded === article.id && (
                  <div className="space-y-3 border-t border-gray-100 px-5 pb-5 pt-4">
                    {article.symptoms && <div><div className="mb-1 text-xs font-semibold uppercase text-gray-500">Symptoms</div><p className="text-sm text-gray-700">{article.symptoms}</p></div>}
                    <div><div className="mb-1 text-xs font-semibold uppercase text-gray-500">Solution</div><p className="whitespace-pre-wrap text-sm text-gray-700">{article.solution}</p></div>
                    {article.parts_used?.length > 0 && (
                      <div><div className="mb-1 text-xs font-semibold uppercase text-gray-500">Parts used</div>
                        <div className="flex flex-wrap gap-2">{article.parts_used.map((part) => <span key={part} className="rounded bg-orange-50 px-2 py-1 text-xs text-gray-700">{part}</span>)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        }
      />

      {loadingReview ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-400 shadow-sm">Loading pending review…</div>
      ) : reviewItems.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button onClick={() => setReviewExpanded((v) => !v)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Pending review</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-gray-700">{reviewItems.length} items</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Approve auto-generated knowledge before it enters the main library.</p>
            </div>
            {reviewExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          {reviewExpanded && (
            <div className="border-t border-slate-200 bg-[#FFFCF6] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">Generated from work orders — needs manager review before becoming searchable.</p>
                {lowRiskCount >= 2 && (
                  <button onClick={bulkVerify} disabled={actionLoading === "bulk"} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100 disabled:opacity-50">
                    {actionLoading === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Bulk verify {lowRiskCount} low-risk items
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {reviewItems.map((article) => {
                  const risk = reviewRisk(article);
                  const flags = flagExplanation(article);
                  const isOpen = reviewOpenId === article.id;
                  const isLoading = actionLoading === article.id;
                  return (
                    <div key={article.id} className={cn("overflow-hidden rounded-xl border bg-white", risk === "high" ? "border-slate-200" : risk === "medium" ? "border-slate-200" : "border-gray-200")}>
                      <button onClick={() => setReviewOpenId(isOpen ? null : article.id)} className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900">{article.title}</div>
                            {reviewRiskBadge(risk)}
                            {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{article.problem}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Auto-generated</span>
                            {article.asset_name && <span className="inline-flex items-center gap-1"><Wrench className="h-3 w-3" />{article.asset_name}</span>}
                            <span>{timeAgo(article.created_at)}</span>
                            {article.source_work_order_id && <span className="inline-flex items-center gap-1 text-[#0060F0]"><Link2 className="h-3 w-3" /> Source WO linked</span>}
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="mt-1 h-5 w-5 text-gray-400" /> : <ChevronDown className="mt-1 h-5 w-5 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-4">
                          {flags.length > 0 && (
                            <div className="space-y-1">{flags.map((flag) => <div key={flag} className="flex items-start gap-1.5 text-[11px] text-gray-600"><AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-500" /><span>{flag}</span></div>)}</div>
                          )}
                          {article.symptoms && <div><div className="mb-1 text-xs font-semibold uppercase text-gray-500">Symptoms</div><p className="text-sm text-gray-700">{article.symptoms}</p></div>}
                          <div><div className="mb-1 text-xs font-semibold uppercase text-gray-500">Solution</div><p className="whitespace-pre-wrap text-sm text-gray-700">{article.solution}</p></div>
                          {article.parts_used?.length > 0 && (
                            <div><div className="mb-1 text-xs font-semibold uppercase text-gray-500">Parts used</div>
                              <div className="flex flex-wrap gap-2">{article.parts_used.map((part) => <span key={part} className="rounded bg-orange-50 px-2 py-1 text-xs text-gray-700">{part}</span>)}</div>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                            <button onClick={() => doAction("verify", article.id)} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Verify
                            </button>
                            <button onClick={() => setModal({ type: "edit", articleId: article.id, article })} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0060F0] px-4 py-2 text-sm font-medium text-white hover:bg-[#004BB8] disabled:opacity-50">
                              <Edit3 className="h-4 w-4" /> Edit & verify
                            </button>
                            <button onClick={() => setModal({ type: "reject", articleId: article.id })} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100 disabled:opacity-50">
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                            <button onClick={() => setModal({ type: "snooze", articleId: article.id })} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                              <Clock className="h-4 w-4" /> Snooze
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">AI-generated reports</h2>
        <p className="mt-1 text-sm text-gray-500">Review generated summaries and reports.</p>
        <div className="mt-5"><GeneratedReports companyId={companyId} /></div>
      </section>

      {modal?.type === "reject" && <RejectModal onConfirm={(reason) => doAction("reject", modal.articleId, { reason })} onCancel={() => setModal(null)} />}
      {modal?.type === "snooze" && <SnoozeModal onConfirm={(days) => doAction("snooze", modal.articleId, { snoozeDuration: days })} onCancel={() => setModal(null)} />}
      {modal?.type === "edit" && <EditVerifyModal article={modal.article} onConfirm={(edits) => doAction("edit_verify", modal.articleId, { edits })} onCancel={() => setModal(null)} />}
    </div>
  );
}

// ─── Gaps tab ──────────────────────────────────────────────────────────────────

function GapsTab({ companyId }: { companyId: string }) {
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/analytics/gaps?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setGaps(d.gaps || []))
      .catch(() => setGaps([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  return (
    <div>
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <strong>Knowledge gaps</strong> are questions workers asked that Sidekick couldn't answer well. Use these to prioritize new SOPs or articles.
      </div>
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading gaps…</div>
      ) : gaps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="font-medium text-gray-600">No gaps detected</p>
          <p className="mt-1 text-sm text-gray-400">Your knowledge base is covering all worker questions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gaps.map((gap, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex items-start gap-3 min-w-0">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <p className="text-sm text-gray-800">{gap.topic || gap.question}</p>
              </div>
              <span className="ml-4 flex-shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{gap.frequency || gap.count}x asked</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Terminology tab ─────────────────────────────────────────────────────────

interface TermEntry {
  id: string;
  term: string;
  definition: string;
  synonyms: string[];
  language: string;
  department_id: string | null;
  created_at: string;
}

function TerminologyTab({ companyId }: { companyId: string }) {
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newDef, setNewDef] = useState("");
  const [newSynonyms, setNewSynonyms] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadTerms = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/terminology?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setTerms(d.terms || []))
      .catch(() => setTerms([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { loadTerms(); }, [loadTerms]);

  const filtered = terms.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.term.toLowerCase().includes(q) ||
      t.definition?.toLowerCase().includes(q) ||
      t.synonyms?.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) { setSaveError("Term is required"); return; }
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          term: newTerm.trim(),
          definition: newDef.trim(),
          synonyms: newSynonyms.split(",").map((s) => s.trim()).filter(Boolean),
          language: "ko",
        }),
      });
      if (!res.ok) { const d = await res.json(); setSaveError(d.error || "Save failed"); }
      else { setShowForm(false); setNewTerm(""); setNewDef(""); setNewSynonyms(""); loadTerms(); }
    } catch { setSaveError("Network error"); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms..."
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30"
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0060F0] px-4 py-2 text-sm font-medium text-white hover:bg-[#004BB8]"
        >
          <Plus className="h-4 w-4" /> New Term
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Add Term</h3>
          {saveError && <p className="mb-3 rounded bg-slate-50 px-3 py-2 text-sm text-slate-700 border border-slate-200">{saveError}</p>}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Term *</label>
              <input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="e.g. 스프링 유닛" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Definition (정의)</label>
              <textarea value={newDef} onChange={(e) => setNewDef(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="Clear definition for workers" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Synonyms / 동의어 (comma-separated)</label>
              <input value={newSynonyms} onChange={(e) => setNewSynonyms(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="spring unit, spring assembly" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#0060F0] px-5 py-2 text-sm font-medium text-white hover:bg-[#004BB8] disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Term
            </button>
          </div>
        </form>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading terminology...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <Tag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">{search ? "No matching terms" : "No terminology yet"}</p>
            <p className="mt-1 text-sm text-gray-400">Add terms and definitions that workers should know.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((term) => (
              <div key={term.id} className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{term.term}</p>
                    {term.definition && (
                      <p className="mt-1 text-sm text-gray-600">{term.definition}</p>
                    )}
                    {term.synonyms?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {term.synonyms.map((s) => (
                          <span key={s} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-gray-500">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {term.language && term.language !== "en" && (
                      <span className="rounded bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 border border-slate-200">{term.language.toUpperCase()}</span>
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${term.term}"?`)) return;
                        await fetch(`/api/terminology?id=${term.id}`, { method: "DELETE" });
                        setTerms((prev) => prev.filter((t) => t.id !== term.id));
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-slate-50 hover:text-slate-600"
                      title="Delete term"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SOP Version History ───────────────────────────────────────────────────────

interface SOPVersion {
  id: string;
  version_number: number;
  is_current: boolean;
  status: string;
  created_by: string;
  approved_by: string;
  created_at: string;
  deprecated_at: string | null;
}

function SOPVersionHistory({ slug, companyId }: { slug: string; companyId: string }) {
  const [versions, setVersions] = useState<SOPVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sops/versions?slug=${encodeURIComponent(slug)}&companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setVersions(d.versions || []))
      .catch(() => setVersions([]))
      .finally(() => setLoading(false));
  }, [slug, companyId]);

  if (loading) return <div className="py-3 text-xs text-gray-400">Loading version history...</div>;
  if (versions.length <= 1) return null;

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
        <History className="h-3.5 w-3.5" /> Version History
      </div>
      <div className="relative pl-4">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gray-200" />
        <div className="space-y-3">
          {versions.map((v) => (
            <div key={v.id} className="relative flex items-start gap-3">
              <div className={cn(
                "absolute -left-3 mt-1 h-3 w-3 rounded-full border-2 bg-white",
                v.is_current ? "border-[#0060F0]" : "border-gray-300"
              )} />
              <div className="min-w-0 flex-1 pl-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("text-xs font-semibold", v.is_current ? "text-[#0060F0]" : "text-gray-600")}>
                    v{v.version_number}
                  </span>
                  {v.is_current && (
                    <span className="rounded bg-[#0060F0]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0060F0]">Current</span>
                  )}
                  {statusBadge(v.status)}
                  <span className="text-[11px] text-gray-400">{timeAgo(v.created_at)}</span>
                </div>
                {v.approved_by && (
                  <p className="mt-0.5 text-[11px] text-gray-400">Approved by {v.approved_by}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type Tab = "sops" | "articles" | "gaps" | "terminology";

const TABS: { id: Tab; label: string }[] = [
  { id: "sops", label: "SOPs" },
  { id: "articles", label: "Articles" },
  { id: "gaps", label: "Gaps" },
  { id: "terminology", label: "Terminology" },
];

export default function KnowledgePage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("sops");

  useEffect(() => {
    try {
      const scope = readDashboardScope();
      if (scope.companyId) setCompanyId(scope.companyId);
    } catch {}
    const handleStorage = () => {
      try {
        const scope = readDashboardScope();
        if (scope.companyId) setCompanyId(scope.companyId);
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader
        title="Knowledge Management"
        subtitle="All operational knowledge — SOPs, procedures, articles, and gaps — in one place. Workers access it over text."
      />

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-[#0060F0] text-[#0060F0]"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "sops" && <SopsTab companyId={companyId} />}
        {activeTab === "articles" && <ArticlesTab companyId={companyId} />}
        {activeTab === "gaps" && <GapsTab companyId={companyId} />}
        {activeTab === "terminology" && <TerminologyTab companyId={companyId} />}
      </div>
    </div>
  );
}
