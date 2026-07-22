"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { readDashboardScope } from "@/lib/dashboard-scope";
import {
  FileText, Plus, ChevronDown, ChevronUp, Clock, User, Tag,
  CheckCircle2, AlertTriangle, History, Search, Upload, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

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
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          category: category.trim(),
          department_id: departmentId || null,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          language,
          publish: true,
          status: "active",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save SOP");
      } else {
        onSave();
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onClose}>
      <form
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New SOP / Procedure</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 border border-slate-200">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="e.g. Machine A Startup Procedure" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="Brief summary of what this covers" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Content *</label>
            <p className="mb-1 text-xs text-gray-400">Workers will receive this over SMS when they text "SOP for [topic]". Keep steps clear and concise.</p>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={8} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30" placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..." />
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

export default function SopsPage() {
  const [companyId, setCompanyId] = useState("");
  const [sops, setSops] = useState<SOP[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterDept, setFilterDept] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const scope = readDashboardScope();
      if (scope.companyId) setCompanyId(scope.companyId);
    } catch {}
  }, []);

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
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader
        title="SOPs & Procedures"
        subtitle="Manage standard operating procedures. Workers can text 'SOP for [topic]' to get the latest version instantly."
      />

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOPs..."
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0060F0]/30"
          />
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
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#0060F0] px-4 py-2 text-sm font-medium text-white hover:bg-[#004BB8]"
        >
          <Plus className="h-4 w-4" /> New SOP
        </button>
      </div>

      {/* SMS usage hint */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <strong>Text access:</strong> Workers can text <code className="rounded bg-blue-100 px-1">"SOP for [topic]"</code> to get the latest version over SMS or WhatsApp instantly.
      </div>

      {/* SOP List */}
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
        ) : (
          filteredSops.map((sop) => (
            <div key={sop.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setExpanded(expanded === sop.id ? null : sop.id)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
              >
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
                      {sop.tags.map((t) => (
                        <span key={t} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-gray-500">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                {expanded === sop.id ? <ChevronUp className="mt-1 h-5 w-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="mt-1 h-5 w-5 text-gray-400 flex-shrink-0" />}
              </button>

              {expanded === sop.id && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4">
                  <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Procedure Content</div>
                  <pre className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-700 font-sans">{sop.content}</pre>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={async () => {
                        if (!confirm("Create a new version of this SOP? The current version will be deprecated.")) return;
                        setExpanded(null);
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
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
          ))
        )}
      </div>

      {showForm && (
        <SOPForm
          departments={departments}
          companyId={companyId}
          onSave={() => { setShowForm(false); loadData(); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
