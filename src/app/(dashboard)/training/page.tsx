"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { readDashboardScope } from "@/lib/dashboard-scope";
import {
  GraduationCap, Plus, ChevronDown, ChevronUp, Clock, Users,
  CheckCircle2, Circle, PlayCircle, X, Loader2, BookOpen, ArrowRight,
  TrendingUp, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingPath {
  id: string;
  name: string;
  description: string;
  role: string;
  estimated_days: number;
  is_active: boolean;
  department_id: string | null;
  step_count: number;
  enrollment: { total: number; completed: number; in_progress: number };
  created_at: string;
}

interface TrainingStep {
  id: string;
  step_order: number;
  title: string;
  description: string;
  content: string;
  estimated_minutes: number;
  required_before_next: boolean;
}

interface Enrollment {
  id: string;
  worker_phone: string;
  status: string;
  current_step: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
  workers: { name: string } | null;
}

function timeAgo(dateStr: string) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

function statusPill(status: string, currentStep: number, total: number) {
  const pct = total > 0 ? Math.round((currentStep - 1) / total * 100) : 0;
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    not_started: "bg-gray-100 text-gray-600",
    paused: "bg-amber-100 text-amber-800",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", styles[status] || "bg-gray-100 text-gray-600")}>
      {status === "in_progress" ? `Step ${currentStep} · ${pct}%` : status.replace("_", " ")}
    </span>
  );
}

function PathDetailModal({ pathId, companyId, onClose }: { pathId: string; companyId: string; onClose: () => void }) {
  const [path, setPath] = useState<{ name: string; description: string; role: string; training_path_steps: TrainingStep[] } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollPhone, setEnrollPhone] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  useEffect(() => {
    fetch(`/api/training-paths/${pathId}`)
      .then((r) => r.json())
      .then((d) => { setPath(d.path); setEnrollments(d.enrollments || []); });
  }, [pathId]);

  const handleEnroll = async () => {
    if (!enrollPhone.trim()) return;
    setEnrolling(true);
    setEnrollMsg("");
    const res = await fetch(`/api/training-paths/${pathId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_phone: enrollPhone.trim(), company_id: companyId, assigned_by: "Manager" }),
    });
    const data = await res.json();
    setEnrolling(false);
    if (data.already_enrolled) {
      setEnrollMsg("Worker already enrolled in this path.");
    } else if (data.enrollment) {
      setEnrollMsg("Enrolled! Worker will receive Step 1 over SMS.");
      setEnrollPhone("");
      // Refresh enrollments
      fetch(`/api/training-paths/${pathId}`).then((r) => r.json()).then((d) => setEnrollments(d.enrollments || []));
    } else {
      setEnrollMsg(`Error: ${data.error || "unknown"}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{path?.name || "Loading…"}</h2>
            {path?.role && <p className="text-sm text-gray-500">Role: {path.role}</p>}
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-700" /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Steps */}
          {path && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Learning Steps ({path.training_path_steps?.length || 0})</h3>
              <div className="space-y-2">
                {(path.training_path_steps || []).sort((a, b) => a.step_order - b.step_order).map((step) => (
                  <div key={step.id} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-[#C96442] text-white flex items-center justify-center text-[10px] font-bold">{step.step_order}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{step.title}</p>
                      {step.description && <p className="mt-0.5 text-xs text-gray-500">{step.description}</p>}
                      {step.estimated_minutes && <p className="mt-1 text-[11px] text-gray-400"><Clock className="inline h-3 w-3" /> {step.estimated_minutes} min</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enroll worker */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Enroll a worker</h3>
            <div className="flex gap-2">
              <input
                value={enrollPhone}
                onChange={(e) => setEnrollPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30"
              />
              <button
                onClick={handleEnroll}
                disabled={enrolling || !enrollPhone.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F] disabled:opacity-50"
              >
                {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Enroll
              </button>
            </div>
            {enrollMsg && <p className="mt-2 text-sm text-gray-600">{enrollMsg}</p>}
          </div>

          {/* Enrollments */}
          {enrollments.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Enrolled workers ({enrollments.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{e.workers?.name || e.worker_phone}</p>
                      <p className="text-xs text-gray-400">Last active {timeAgo(e.last_activity_at)}</p>
                    </div>
                    {statusPill(e.status, e.current_step, path?.training_path_steps?.length || 1)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewPathForm({ companyId, onSave, onClose }: { companyId: string; onSave: () => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [estimatedDays, setEstimatedDays] = useState(5);
  const [steps, setSteps] = useState([{ title: "", content: "", estimated_minutes: 15 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addStep = () => setSteps((prev) => [...prev, { title: "", content: "", estimated_minutes: 15 }]);
  const updateStep = (idx: number, key: string, value: string | number) =>
    setSteps((prev) => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s));
  const removeStep = (idx: number) => setSteps((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/training-paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        name: name.trim(),
        description: description.trim(),
        role: role.trim(),
        estimated_days: estimatedDays,
        steps: steps.filter((s) => s.title.trim() && s.content.trim()).map((s, i) => ({ ...s, step_order: i + 1 })),
      }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save"); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onClose}>
      <form className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New Training Path</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Path Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" placeholder="e.g. New Production Worker Onboarding" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Role / Target</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" placeholder="e.g. Line operator, Inspector" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Estimated Days</label>
              <input type="number" value={estimatedDays} onChange={(e) => setEstimatedDays(Number(e.target.value))} min={1} max={90} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30" placeholder="What will workers learn?" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-gray-500">Learning Steps</label>
              <button type="button" onClick={addStep} className="inline-flex items-center gap-1 text-xs text-[#C96442] hover:underline"><Plus className="h-3 w-3" /> Add step</button>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Step {idx + 1}</span>
                    {steps.length > 1 && <button type="button" onClick={() => removeStep(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
                  </div>
                  <input value={step.title} onChange={(e) => updateStep(idx, "title", e.target.value)} placeholder="Step title" className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C96442]/30" />
                  <textarea value={step.content} onChange={(e) => updateStep(idx, "content", e.target.value)} rows={3} placeholder="Content delivered to worker over SMS..." className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C96442]/30" />
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <input type="number" value={step.estimated_minutes} onChange={(e) => updateStep(idx, "estimated_minutes", Number(e.target.value))} min={1} className="w-16 rounded border border-gray-200 px-2 py-1 text-xs" /> min
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#C96442] px-5 py-2 text-sm font-medium text-white hover:bg-[#B0532F] disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Create Path
          </button>
        </div>
      </form>
    </div>
  );
}

interface Department {
  id: string;
  name: string;
}

interface RecommendedWorker {
  workerId: string;
  workerPhone: string;
  workerName: string;
  knowledgeScore: number;
  knowledgeLevel: "high" | "medium" | "low";
}

interface TrainingRecommendation {
  trainingPathId: string;
  trainingPathName: string;
  recommendedWorkers: RecommendedWorker[];
  recommendedCount: number;
}

export default function TrainingPage() {
  const [companyId, setCompanyId] = useState("");
  const [paths, setPaths] = useState<TrainingPath[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState("");
  const [filterNewHire, setFilterNewHire] = useState(false);
  const [trainingRecommendations, setTrainingRecommendations] = useState<TrainingRecommendation[]>([]);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [bulkAssigning, setBulkAssigning] = useState<string | null>(null);
  const [bulkMsg, setBulkMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const scope = readDashboardScope();
      if (scope.companyId) setCompanyId(scope.companyId);
    } catch {}
  }, []);

  const loadPaths = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/training-paths?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/departments?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/team/insights?companyId=${companyId}`).then((r) => r.json()),
    ])
      .then(([pathData, deptData, insightsData]) => {
        setPaths(pathData.paths || []);
        setDepartments(deptData.departments || []);
        setTrainingRecommendations(insightsData.trainingRecommendations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  async function bulkAssign(pathId: string, workers: RecommendedWorker[]) {
    setBulkAssigning(pathId);
    let count = 0;
    for (const w of workers) {
      try {
        const res = await fetch(`/api/training-paths/${pathId}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ worker_phone: w.workerPhone, company_id: companyId, assigned_by: "Manager" }),
        });
        const data = await res.json();
        if (data.enrollment) count++;
      } catch {}
    }
    setBulkAssigning(null);
    setBulkMsg(m => ({ ...m, [pathId]: `Enrolled ${count} worker${count !== 1 ? "s" : ""}` }));
    loadPaths();
  }

  useEffect(() => { loadPaths(); }, [loadPaths]);

  const filteredPaths = paths.filter((p) => {
    if (filterDept && p.department_id !== filterDept) return false;
    if (filterNewHire) {
      const nameHint = p.name.toLowerCase();
      const roleHint = (p.role || "").toLowerCase();
      return (
        nameHint.includes("new hire") ||
        nameHint.includes("onboarding") ||
        nameHint.includes("신입") ||
        roleHint.includes("new hire") ||
        roleHint.includes("onboarding")
      );
    }
    return true;
  });

  const totalEnrolled = paths.reduce((sum, p) => sum + p.enrollment.total, 0);
  const totalCompleted = paths.reduce((sum, p) => sum + p.enrollment.completed, 0);
  const totalInProgress = paths.reduce((sum, p) => sum + p.enrollment.in_progress, 0);
  const completionPct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  // Estimate average days to completion from estimated_days across paths
  const activePaths = paths.filter((p) => p.estimated_days > 0);
  const avgDays = activePaths.length > 0
    ? Math.round(activePaths.reduce((sum, p) => sum + p.estimated_days, 0) / activePaths.length)
    : null;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader
        title="Training Paths"
        subtitle="Structured onboarding and skill-building programs. New hires are guided step-by-step over text — no app needed."
      />

      {/* Summary metrics */}
      {paths.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Workers Enrolled", value: totalEnrolled, icon: Users, color: "text-blue-600" },
              { label: "In Progress", value: totalInProgress, icon: PlayCircle, color: "text-amber-600" },
              { label: "Completed", value: totalCompleted, icon: CheckCircle2, color: "text-green-600" },
              { label: "Completion Rate", value: `${completionPct}%`, icon: Circle, color: "text-[#C96442]" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <m.icon className={cn("h-4 w-4", m.color)} />
                  <span className="text-xs font-medium text-gray-500">{m.label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar + time-to-competency */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">{totalEnrolled}</span> workers enrolled,{" "}
                <span className="font-semibold">{totalCompleted}</span> completed
                {" — "}
                <span className="font-semibold text-[#C96442]">{completionPct}%</span> completion rate
              </div>
              {avgDays !== null && (
                <div className="text-xs text-gray-500">
                  Average completion: <span className="font-semibold text-gray-700">{avgDays} days</span>
                </div>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-[#C96442] transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold text-gray-700 mr-auto">{paths.length} training {paths.length === 1 ? "path" : "paths"}</h2>
        {/* Department filter */}
        {departments.length > 0 && (
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30"
          >
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        {/* New hire filter */}
        <button
          onClick={() => setFilterNewHire((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            filterNewHire
              ? "border-[#C96442]/30 bg-[#F7F3EC] text-[#C96442]"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          New Hire Onboarding
        </button>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F]">
          <Plus className="h-4 w-4" /> New Training Path
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading training paths…</div>
        ) : paths.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">No training paths yet</p>
            <p className="mt-1 text-sm text-gray-400">Create structured learning programs for new hires. They'll receive each step over text, in their language.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F]">
              <Plus className="h-4 w-4" /> Create first training path
            </button>
          </div>
        ) : filteredPaths.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">No matching training paths</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
              filteredPaths.map((path) => {
            const rec = trainingRecommendations.find(r => r.trainingPathId === path.id);
            const recCount = rec?.recommendedCount || 0;
            const isRecExpanded = expandedRec === path.id;
            return (
            <div
              key={path.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#C96442]/30 hover:shadow-md transition-all"
            >
              <div
                className="cursor-pointer p-5"
                onClick={() => setSelectedPathId(path.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#C96442]" />
                      <span className="font-semibold text-gray-900">{path.name}</span>
                      {!path.is_active && <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">Inactive</span>}
                      {recCount > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          <TrendingUp className="h-3 w-3" /> {recCount} recommended
                        </span>
                      )}
                    </div>
                    {path.role && <p className="mt-0.5 text-sm text-gray-500">For: {path.role}</p>}
                    {path.description && <p className="mt-1 text-sm text-gray-400 truncate">{path.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {path.step_count} steps</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{path.estimated_days} days</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {path.enrollment.total} enrolled</span>
                      {path.enrollment.in_progress > 0 && <span className="text-amber-600">{path.enrollment.in_progress} in progress</span>}
                      {path.enrollment.completed > 0 && <span className="text-green-600">{path.enrollment.completed} completed</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </div>

              {/* Recommended workers section */}
              {recCount > 0 && (
                <div className="border-t border-gray-100 px-5 py-3">
                  <button
                    className="flex w-full items-center justify-between text-sm"
                    onClick={() => setExpandedRec(isRecExpanded ? null : path.id)}
                  >
                    <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {recCount} worker{recCount !== 1 ? "s" : ""} recommended based on question patterns
                    </span>
                    {isRecExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {isRecExpanded && rec && (
                    <div className="mt-3 space-y-2">
                      <div className="space-y-1.5">
                        {rec.recommendedWorkers.map(w => (
                          <div key={w.workerId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{w.workerName}</p>
                              <p className="text-xs text-gray-400">
                                Knowledge: {w.knowledgeLevel === "high" ? "High" : w.knowledgeLevel === "medium" ? "Medium" : "Low"} · Score {w.knowledgeScore}%
                              </p>
                            </div>
                            <div className={cn(
                              "h-2 w-16 rounded-full",
                              w.knowledgeLevel === "high" ? "bg-green-100" : w.knowledgeLevel === "medium" ? "bg-amber-100" : "bg-red-100"
                            )}>
                              <div
                                className={cn("h-2 rounded-full", w.knowledgeLevel === "high" ? "bg-green-500" : w.knowledgeLevel === "medium" ? "bg-amber-500" : "bg-red-500")}
                                style={{ width: `${w.knowledgeScore}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1">
                        {bulkMsg[path.id] ? (
                          <p className="text-sm text-green-600 font-medium">{bulkMsg[path.id]}</p>
                        ) : (
                          <button
                            onClick={() => bulkAssign(path.id, rec.recommendedWorkers)}
                            disabled={bulkAssigning === path.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F] disabled:opacity-50"
                          >
                            {bulkAssigning === path.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                            Assign all {recCount} to this path
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })
        )}
      </div>

      {showForm && <NewPathForm companyId={companyId} onSave={() => { setShowForm(false); loadPaths(); }} onClose={() => setShowForm(false)} />}
      {selectedPathId && <PathDetailModal pathId={selectedPathId} companyId={companyId} onClose={() => setSelectedPathId(null)} />}
    </div>
  );
}
