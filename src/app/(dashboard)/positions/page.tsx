"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  GraduationCap,
  FileText,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types (mirror /api/positions payload)
// ─────────────────────────────────────────────────────────────

interface PositionSop {
  slug: string;
  title: string;
  required: boolean;
}

interface PositionTrainingPath {
  id: string;
  name: string;
  auto_enroll: boolean;
}

interface Position {
  id: string;
  name: string; // Korean, e.g. "매트리스 봉제 기사"
  name_en: string | null;
  description: string | null;
  department_id: string | null;
  department_name: string | null;
  required_skills: string[];
  worker_count: number;
  training_completion_pct: number | null; // null when no enrollments
  sops: PositionSop[];
  training_paths: PositionTrainingPath[];
}

interface Department {
  id: string;
  name: string;
}

interface FormState {
  name: string;
  name_en: string;
  department: string;
  description: string;
  required_skills: string; // comma-separated in the form
}

const EMPTY_FORM: FormState = {
  name: "",
  name_en: "",
  department: "",
  description: "",
  required_skills: "",
};

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = departmentFilter !== "all" ? `?department=${departmentFilter}` : "";
      const res = await fetch(`/api/positions${qs}`);
      if (!res.ok) throw new Error("Failed to load positions");
      const data = await res.json();
      setPositions(data.positions || []);
      setDepartments(data.departments || []);
    } catch (e: any) {
      setError(e.message || "Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, [departmentFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (p: Position) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      name_en: p.name_en || "",
      department: p.department_name || "",
      description: p.description || "",
      required_skills: (p.required_skills || []).join(", "),
    });
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        id: editingId || undefined,
        name: form.name.trim(),
        name_en: form.name_en.trim() || null,
        department: form.department.trim() || null,
        description: form.description.trim() || null,
        required_skills: form.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/positions", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save position");
      }
      setFormOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to save position");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Position) => {
    if (
      !confirm(
        `Delete position "${p.name}"? Workers assigned to it will need a new position.`
      )
    )
      return;
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/positions?id=${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to delete");
      }
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete position");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Positions <span className="text-gray-400 text-lg font-normal"></span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Define roles, their required SOPs, and training paths. New workers are onboarded
            into a position automatically over KakaoTalk / SMS.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add position
        </button>
      </div>

      {/* Department filter */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm text-gray-600">Department:</label>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading positions…
        </div>
      ) : positions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No positions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create positions like Sewing Technician, QC Inspector, Packaging Operator to power
            role-based onboarding and training.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((p) => {
            const expanded = expandedId === p.id;
            const pct = p.training_completion_pct;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expanded ? null : p.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-900">{p.name}</span>
                      {p.name_en && (
                        <span className="text-sm text-gray-500">{p.name_en}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.department_name || "No department"}
                      {p.required_skills?.length > 0 && (
                        <span> · {p.required_skills.slice(0, 4).join(", ")}</span>
                      )}
                    </div>
                  </div>

                  {/* Worker count */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 w-24">
                    <Users className="h-4 w-4 text-gray-400" />
                    {p.worker_count}
                    <span className="text-gray-400">workers</span>
                  </div>

                  {/* Training completion */}
                  <div className="w-40">
                    {pct === null ? (
                      <span className="text-xs text-gray-400">No training data</span>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Training</span>
                          <span
                            className={
                              pct >= 80
                                ? "text-green-600 font-medium"
                                : pct >= 50
                                ? "text-amber-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct >= 80
                                ? "bg-green-500"
                                : pct >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand chevron */}
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Department:</span>{" "}
                        <span className="text-gray-900">{p.department_name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Workers:</span>{" "}
                        <span className="text-gray-900">{p.worker_count}명</span>
                      </div>
                    </div>
                    {p.required_skills?.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-500">Required Skills:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.required_skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 text-xs rounded-full border border-slate-200 bg-white text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
