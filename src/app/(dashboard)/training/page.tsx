"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { readDashboardScope } from "@/lib/dashboard-scope";
import {
  GraduationCap, Plus, Clock, Users,
  CheckCircle2, Circle, PlayCircle, X, Loader2, BookOpen, ArrowRight,
  Upload, FileText, Building2, UserPlus, FolderOpen, Link2,
  ChevronDown, HardDrive, BookMarked, Archive, MessageSquare, Database, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

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
  step_order?: number;
  sort_order?: number;
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
  due_date?: string | null;
  workers: { name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

interface Worker {
  id: string;
  phone: string;
  name: string;
  role?: string | null;
  department_id: string | null;
  department_name: string | null;
  knowledgeLevel?: string | null;
  recommendedTraining?: string[];
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

function WorkerInitials({ name }: { name: string }) {
  const initials = name
    .split("")
    .slice(0, 2)
    .join("");
  const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0", color)}>
      {initials}
    </div>
  );
}

function PathDetailModal({
  pathId,
  companyId,
  departments,
  onClose,
}: {
  pathId: string;
  companyId: string;
  departments: Department[];
  onClose: () => void;
}) {
  const [path, setPath] = useState<{ name: string; description: string; role: string; department_id: string | null; training_steps: TrainingStep[] } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollPhone, setEnrollPhone] = useState("");
  const [enrollDept, setEnrollDept] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingDept, setEnrollingDept] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState("none");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [dueDate, setDueDate] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importTooltip, setImportTooltip] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerDropdownOpen, setWorkerDropdownOpen] = useState(false);
  const workerDropdownRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {
    fetch(`/api/training-paths/${pathId}`)
      .then((r) => r.json())
      .then((d) => { setPath(d.path); setEnrollments(d.enrollments || []); });
  }, [pathId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!companyId) return;
    setLoadingWorkers(true);
    const fetchWorkers = async () => {
      try {
        const [teamRes, insightsRes] = await Promise.allSettled([
          fetch(`/api/team?companyId=${companyId}`).then((r) => r.json()),
          fetch(`/api/team/insights?companyId=${companyId}`).then((r) => r.ok ? r.json() : null),
        ]);
        const teamData = teamRes.status === "fulfilled" ? teamRes.value : null;
        const insightsData = insightsRes.status === "fulfilled" ? insightsRes.value : null;
        let workerList: Worker[] = teamData?.workers || teamData?.team || [];
        if (insightsData?.workers) {
          const insightMap = new Map(insightsData.workers.map((w: Worker) => [w.id, w]));
          workerList = workerList.map((w) => {
            const insight = insightMap.get(w.id) as Worker | undefined;
            return insight ? { ...w, knowledgeLevel: insight.knowledgeLevel, recommendedTraining: insight.recommendedTraining } : w;
          });
        }
        setWorkers(workerList);
      } catch {
        setWorkers([]);
      }
      setLoadingWorkers(false);
    };
    fetchWorkers();
  }, [companyId]);

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (workerDropdownRef.current && !workerDropdownRef.current.contains(e.target as Node)) {
        setWorkerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEnroll = async () => {
    const phone = selectedWorker?.phone || enrollPhone.trim();
    if (!phone) return;
    setEnrolling(true);
    setEnrollMsg("");
    const res = await fetch(`/api/training-paths/${pathId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_phone: phone, company_id: companyId, assigned_by: "Manager", reminder_frequency: reminderFrequency, reminder_time: reminderTime, due_date: dueDate || undefined }),
    });
    const data = await res.json();
    setEnrolling(false);
    if (data.already_enrolled) {
      setEnrollMsg("Worker already enrolled in this path.");
    } else if (data.enrollment) {
      setEnrollMsg(`Enrolled${selectedWorker ? ` ${selectedWorker.name}` : ""}. Worker will receive Step 1 over SMS.`);
      setSelectedWorkerId("");
      setEnrollPhone("");
      reload();
    } else {
      setEnrollMsg(`Error: ${data.error || "unknown"}`);
    }
  };

  const handleEnrollDept = async () => {
    if (!enrollDept) return;
    setEnrollingDept(true);
    setEnrollMsg("");
    try {
      const workersRes = await fetch(`/api/team?companyId=${companyId}`);
      const workersData = await workersRes.json();
      const allWorkers: Worker[] = workersData.workers || workersData.team || [];
      const workers: Worker[] = allWorkers.filter((w) => !enrollDept || w.department_id === enrollDept);
      let enrolled = 0;
      for (const w of workers) {
        const res = await fetch(`/api/training-paths/${pathId}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ worker_phone: w.phone, company_id: companyId, assigned_by: "Manager" }),
        });
        const d = await res.json();
        if (d.enrollment) enrolled++;
      }
      setEnrollMsg(`Enrolled ${enrolled} worker(s) from the selected department.`);
      setEnrollDept("");
      reload();
    } catch {
      setEnrollMsg("Error enrolling department.");
    }
    setEnrollingDept(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", companyId);
    formData.append("trainingPathId", pathId);
    try {
      const res = await fetch("/api/onboarding/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && (data.success || data.documentId)) {
        setUploadedFiles((prev) => [...prev, file.name]);
        setUploadMsg(`"${file.name}" uploaded successfully.`);
      } else {
        setUploadMsg(`Upload failed: ${data.error || "unknown error"}`);
      }
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deptName = path?.department_id
    ? departments.find((d) => d.id === path.department_id)?.name
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{path?.name || "Loading..."}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {deptName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3EC] px-2.5 py-0.5 text-xs font-medium text-[#C96442]">
                  <Building2 className="h-3 w-3" /> {deptName}
                </span>
              )}
              {path?.role && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  <Users className="h-3 w-3" /> {path.role}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-700" /></button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Steps */}
          {path && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Learning Steps ({path.training_steps?.length || 0})</h3>
              <div className="space-y-2">
                {(path.training_steps || []).sort((a, b) => (a.sort_order ?? a.step_order) - (b.sort_order ?? b.step_order)).map((step) => (
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

          {/* Training materials upload */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Training Materials</h3>
            <div className="rounded-lg border border-dashed border-gray-200 p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload PDF or Image"}
                </button>
                <div className="relative">
                  <button
                    onClick={() => { setShowImportMenu((v) => !v); setImportTooltip(""); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Link2 className="h-4 w-4" />
                    Import from...
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {showImportMenu && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-gray-100 bg-white shadow-lg" onMouseLeave={() => setImportTooltip("")}>
                      {[
                        { label: "Google Drive", icon: HardDrive },
                        { label: "SharePoint", icon: FolderOpen },
                        { label: "Notion", icon: BookMarked },
                        { label: "Dropbox", icon: Archive },
                        { label: "Slack", icon: MessageSquare },
                        { label: "Confluence", icon: Database },
                        { label: "Box", icon: Archive },
                      ].map(({ label, icon: Icon }) => (
                        <button
                          key={label}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => { setImportTooltip(label); setShowImportMenu(false); }}
                        >
                          <Icon className="h-4 w-4 text-gray-400" />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {importTooltip && (
                    <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700 shadow whitespace-nowrap">
                      {importTooltip} integration — connect in Settings to enable
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">PDF, DOC, PNG, JPG supported</p>
              {uploadMsg && <p className="mt-2 text-sm text-gray-600">{uploadMsg}</p>}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-1">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enrollments — moved above assign */}
          {enrollments.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Enrolled Workers ({enrollments.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <WorkerInitials name={e.workers?.name || e.worker_phone} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{e.workers?.name || e.worker_phone}</p>
                        <p className="text-xs text-gray-400">Last active {timeAgo(e.last_activity_at)}</p>
                        {e.due_date && (
                          <p className={cn("text-xs", new Date(e.due_date) < new Date() && e.status !== "completed" ? "text-red-500 font-semibold" : "text-gray-400")}>
                            {t("Due date")}: {new Date(e.due_date).toLocaleDateString()}
                            {new Date(e.due_date) < new Date() && e.status !== "completed" && (
                              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">{t("Overdue")}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {statusPill(e.status, e.current_step, path?.training_steps?.length || 1)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assign to individual worker */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">{t("Assign to a Worker")}</h3>
            {/* Custom searchable worker dropdown */}
            {(() => {
              // Sort workers: recommended first, then same-dept, then rest
              const enrolledPhones = new Set(enrollments.map((e) => e.worker_phone));
              const recommendedWorkers = workers.filter((w) =>
                !enrolledPhones.has(w.phone) &&
                w.recommendedTraining?.some((rt) =>
                  path?.name?.toLowerCase().includes(rt.toLowerCase()) ||
                  rt.toLowerCase().includes(path?.name?.toLowerCase() || "") ||
                  path?.description?.toLowerCase().includes(rt.toLowerCase())
                )
              );
              const recommendedIds = new Set(recommendedWorkers.map((w) => w.id));
              const sameDeptWorkers = workers.filter(
                (w) => !recommendedIds.has(w.id) && !enrolledPhones.has(w.phone) && path?.department_id && w.department_id === path.department_id
              ).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
              const sameDeptIds = new Set(sameDeptWorkers.map((w) => w.id));
              const otherWorkers = workers
                .filter((w) => !recommendedIds.has(w.id) && !sameDeptIds.has(w.id))
                .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

              const searchLower = workerSearch.toLowerCase();
              const filterWorker = (w: Worker) =>
                !workerSearch || (w.name || "").toLowerCase().includes(searchLower) || (w.role || "").toLowerCase().includes(searchLower);

              const filteredRecommended = recommendedWorkers.filter(filterWorker);
              const filteredSameDept = sameDeptWorkers.filter(filterWorker);
              const filteredOther = otherWorkers.filter(filterWorker);
              const hasAny = filteredRecommended.length + filteredSameDept.length + filteredOther.length > 0;

              const knowledgeColor = (level?: string | null) => {
                if (level === "high") return "text-green-600";
                if (level === "low") return "text-red-500";
                return "text-amber-600";
              };

              const renderWorkerRow = (w: Worker, isRecommended: boolean) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => { setSelectedWorkerId(w.id); setWorkerDropdownOpen(false); setWorkerSearch(""); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50",
                    selectedWorkerId === w.id && "bg-[#F7F3EC]",
                    isRecommended && "bg-amber-50/60 hover:bg-amber-50"
                  )}
                >
                  {isRecommended && <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />}
                  {!isRecommended && <span className="w-3.5" />}
                  <span className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800">{w.name}</span>
                    {w.role && <span className="text-gray-400"> — {w.role}</span>}
                    {w.knowledgeLevel && (
                      <span className={cn("ml-1 text-xs font-medium", knowledgeColor(w.knowledgeLevel))}>
                        — Knowledge: {w.knowledgeLevel.charAt(0).toUpperCase() + w.knowledgeLevel.slice(1)}
                      </span>
                    )}
                  </span>
                </button>
              );

              return (
                <div className="flex gap-2">
                  <div className="flex-1 relative" ref={workerDropdownRef}>
                    {loadingWorkers ? (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading workers...
                      </div>
                    ) : (
                      <>
                        {/* Search input / selected display */}
                        <div
                          className="flex cursor-text items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-[#C96442]/30"
                          onClick={() => setWorkerDropdownOpen(true)}
                        >
                          {selectedWorker && !workerDropdownOpen ? (
                            <>
                              {recommendedIds.has(selectedWorker.id) && <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />}
                              <span className="flex-1 truncate text-gray-800">
                                {selectedWorker.name}{selectedWorker.role ? ` — ${selectedWorker.role}` : ""}
                                {selectedWorker.knowledgeLevel && (
                                  <span className={cn("ml-1 text-xs", knowledgeColor(selectedWorker.knowledgeLevel))}>
                                    — Knowledge: {selectedWorker.knowledgeLevel.charAt(0).toUpperCase() + selectedWorker.knowledgeLevel.slice(1)}
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedWorkerId(""); }}
                                className="text-gray-300 hover:text-gray-500"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <input
                              autoFocus={workerDropdownOpen}
                              className="flex-1 bg-transparent outline-none placeholder-gray-400 text-sm"
                              placeholder={selectedWorker ? selectedWorker.name : "Search workers..."}
                              value={workerSearch}
                              onChange={(e) => { setWorkerSearch(e.target.value); setWorkerDropdownOpen(true); }}
                              onFocus={() => setWorkerDropdownOpen(true)}
                            />
                          )}
                          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        </div>

                        {/* Dropdown list */}
                        {workerDropdownOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                              {!hasAny && (
                                <div className="px-3 py-4 text-center text-sm text-gray-400">No workers found</div>
                              )}
                              {filteredRecommended.length > 0 && (
                                <>
                                  <div className="sticky top-0 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border-b border-amber-100">
                                    Recommended
                                  </div>
                                  {filteredRecommended.map((w) => renderWorkerRow(w, true))}
                                </>
                              )}
                              {filteredSameDept.length > 0 && (
                                <>
                                  <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                    Same Department
                                  </div>
                                  {filteredSameDept.map((w) => renderWorkerRow(w, false))}
                                </>
                              )}
                              {filteredOther.length > 0 && (
                                <>
                                  {(filteredRecommended.length > 0 || filteredSameDept.length > 0) && (
                                    <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                      All Workers
                                    </div>
                                  )}
                                  {filteredOther.map((w) => renderWorkerRow(w, false))}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Recommended badge under dropdown */}
                    {selectedWorkerId && recommendedIds.has(selectedWorkerId) && !workerDropdownOpen && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Recommended for this training
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || !selectedWorkerId}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F] disabled:opacity-50"
                  >
                    {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    {t("Assign")}
                  </button>
                </div>
              );
            })()}

            {/* Reminder settings */}
            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600">{t("Reminder")}</p>
              <div className="flex gap-2">
                <select
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value)}
                  className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C96442]/30"
                >
                  <option value="none">{t("No reminders")}</option>
                  <option value="daily">{t("Daily")}</option>
                  <option value="weekly">{t("Weekly")}</option>
                </select>
                {reminderFrequency !== "none" && (
                  <select
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C96442]/30"
                  >
                    {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map((h) => (
                      <option key={h} value={h}>{new Date(`2000-01-01T${h}`).toLocaleTimeString([], { hour: "numeric", hour12: true })}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">{t("Due date")}:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#C96442]/30"
                />
              </div>
            </div>
          </div>

          {/* Assign to entire department — keep below */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Assign to Entire Department</h3>
            <div className="flex gap-2">
              <select
                value={enrollDept}
                onChange={(e) => setEnrollDept(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30"
              >
                <option value="">Select department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={handleEnrollDept}
                disabled={enrollingDept || !enrollDept}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F] disabled:opacity-50"
              >
                {enrollingDept ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                Assign All
              </button>
            </div>
            {enrollMsg && <p className="mt-2 text-sm text-gray-600">{enrollMsg}</p>}
          </div>


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

export default function TrainingPage() {
  const [companyId, setCompanyId] = useState("");
  const [paths, setPaths] = useState<TrainingPath[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState("");
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const onStorage = () => setLangTick(n => n + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
    ])
      .then(([pathData, deptData]) => {
        setPaths(pathData.paths || []);
        setDepartments(deptData.departments || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { loadPaths(); }, [loadPaths]);

  const getDeptName = (deptId: string | null) =>
    deptId ? departments.find((d) => d.id === deptId)?.name || null : null;

  const filteredPaths = paths.filter((p) => {
    if (filterDept && p.department_id !== filterDept) return false;
    return true;
  });

  const totalEnrolled = paths.reduce((sum, p) => sum + p.enrollment.total, 0);
  const totalCompleted = paths.reduce((sum, p) => sum + p.enrollment.completed, 0);
  const totalInProgress = paths.reduce((sum, p) => sum + p.enrollment.in_progress, 0);
  const completionPct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  const activePaths = paths.filter((p) => p.estimated_days > 0);
  const avgDays = activePaths.length > 0
    ? Math.round(activePaths.reduce((sum, p) => sum + p.estimated_days, 0) / activePaths.length)
    : null;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader
        title={t("Training Paths")}
        subtitle="Structured onboarding and skill-building programs. Workers are guided step-by-step over text — no app needed."
      />

      {/* Integrations banner */}
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <Link2 className="h-4 w-4 flex-shrink-0 text-blue-500" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Connect your tools</span> to automatically import training materials. Google Drive, SharePoint, Notion, Dropbox, Slack, Confluence, Box, and more.
        </p>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-600"><FolderOpen className="inline h-3 w-3 mr-0.5" />Drive</span>
          <span className="rounded border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-600"><FileText className="inline h-3 w-3 mr-0.5" />SharePoint</span>
          <span className="rounded border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-600"><BookOpen className="inline h-3 w-3 mr-0.5" />Notion</span>
        </div>
      </div>

      {/* Summary metrics */}
      {paths.length > 0 && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("Workers Enrolled"), value: totalEnrolled, icon: Users, color: "text-blue-600" },
              { label: t("In Progress"), value: totalInProgress, icon: PlayCircle, color: "text-amber-600" },
              { label: t("Completed"), value: totalCompleted, icon: CheckCircle2, color: "text-green-600" },
              { label: t("Completion Rate"), value: `${completionPct}%`, icon: Circle, color: "text-[#C96442]" },
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
                  Avg. completion: <span className="font-semibold text-gray-700">{avgDays} days</span>
                </div>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-[#C96442] transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold text-gray-700 mr-auto">{paths.length} training {paths.length === 1 ? "path" : "paths"}</h2>
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
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#C96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#B0532F]">
          <Plus className="h-4 w-4" /> New Training Path
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading training paths...</div>
        ) : paths.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">No training paths yet</p>
            <p className="mt-1 text-sm text-gray-400">Create structured learning programs. Workers receive each step over text — no app needed.</p>
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
            const deptName = getDeptName(path.department_id);
            return (
              <div
                key={path.id}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-[#C96442]/30 hover:shadow-md transition-all"
                onClick={() => setSelectedPathId(path.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#C96442]" />
                      <span className="font-semibold text-gray-900">{path.name}</span>
                      {!path.is_active && <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">Inactive</span>}
                    </div>

                    {/* Department + Role tags */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {deptName && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3EC] px-2.5 py-0.5 text-xs font-medium text-[#C96442]">
                          <Building2 className="h-3 w-3" /> {deptName}
                        </span>
                      )}
                      {path.role && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <Users className="h-3 w-3" /> {path.role}
                        </span>
                      )}
                    </div>

                    {path.description && <p className="mt-1.5 text-sm text-gray-400 truncate">{path.description}</p>}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {path.step_count} steps</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{path.estimated_days} days</span>

                      {/* Enrolled workers with avatars */}
                      {path.enrollment.total > 0 ? (
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <Users className="h-3.5 w-3.5" />
                          {path.enrollment.total} worker{path.enrollment.total !== 1 ? "s" : ""} enrolled
                          {path.enrollment.in_progress > 0 && (
                            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              {path.enrollment.in_progress} in progress
                            </span>
                          )}
                          {path.enrollment.completed > 0 && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                              {path.enrollment.completed} completed
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Users className="h-3.5 w-3.5" /> No workers assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && <NewPathForm companyId={companyId} onSave={() => { setShowForm(false); loadPaths(); }} onClose={() => setShowForm(false)} />}
      {selectedPathId && (
        <PathDetailModal
          pathId={selectedPathId}
          companyId={companyId}
          departments={departments}
          onClose={() => setSelectedPathId(null)}
        />
      )}
    </div>
  );
}
