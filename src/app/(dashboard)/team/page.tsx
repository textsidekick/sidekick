"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Edit2, CheckCircle, Clock, Award, ClipboardList, CheckCircle2, XCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { AddCertificationModal } from "@/components/dashboard/modals";

type Worker = {
  id: string;
  name: string | null;
  phone: string;
  role: string;
  verified: boolean;
  created_at: string;
};

type WorkOrder = {
  id: string;
  assigned_to: string | null;
  status: string;
};

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

type TabId = "team" | "certifications" | "safety";

const TABS: { id: TabId; label: string }[] = [
  { id: "team", label: "Team" },
  { id: "certifications", label: "Certifications" },
  { id: "safety", label: "Safety Checklists" },
];

const ROLE_SKILLS: Record<string, string[]> = {
  technician: ["Mechanical", "Electrical", "Conveyor Specialist"],
  supervisor: ["Supervision", "Safety", "Scheduling"],
  operator: ["Operations", "Quality Control"],
  manager: ["Management", "Planning"],
};

const ROLES = ["operator", "technician", "supervisor", "manager"];

function roleBadge(role: string) {
  const cls: Record<string, string> = {
    manager: "bg-[#C96442]/10 text-[#C96442]",
    supervisor: "bg-slate-100 text-slate-700",
    technician: "bg-gray-100 text-gray-700",
    operator: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls[role] || "bg-gray-100 text-gray-700"}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TabId>("team");
  const [companyId, setCompanyId] = useState<string>("");

  // Team state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", role: "operator" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Certifications state
  const [certifications, setCertifications] = useState<any[]>([]);
  const [certStats, setCertStats] = useState<any>(null);
  const [certTypes, setCertTypes] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ workerPhone: "", certType: "", expiryDate: "" });

  // Safety checklists state
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistStats, setChecklistStats] = useState<ChecklistStats | null>(null);
  const [loadingChecklists, setLoadingChecklists] = useState(false);

  // Read company from localStorage
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (auth.companyId) setCompanyId(auth.companyId);
    } catch {}
    const handleStorage = () => {
      try {
        const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (auth.companyId) setCompanyId(auth.companyId);
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadTeam() {
    setLoading(true);
    const [teamRes, sessionRes] = await Promise.all([
      fetch("/api/team", { cache: "no-store" }),
      fetch("/api/auth/session", { cache: "no-store" }),
    ]);
    if (teamRes.ok) {
      const json = await teamRes.json();
      setWorkers(json.workers || []);
    }
    if (sessionRes.ok) {
      const session = await sessionRes.json();
      const cid = session.companyId || companyId;
      if (cid) {
        const woRes = await fetch(`/api/operations/work-orders?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" });
        if (woRes.ok) {
          const woJson = await woRes.json();
          setWorkOrders(woJson.workOrders || []);
        }
      }
    }
    setLoading(false);
  }

  const loadCertifications = async () => {
    if (!companyId) return;
    setLoadingCerts(true);
    try {
      const res = await fetch(`/api/certifications?companyId=${companyId}`);
      const data = await res.json();
      setCertifications(data.certifications || []);
      setCertStats(data.stats || null);
      setCertTypes(data.certTypes || []);
    } catch (error) { console.error("Failed to load certifications:", error); }
    setLoadingCerts(false);
  };

  const loadChecklists = async () => {
    if (!companyId) return;
    setLoadingChecklists(true);
    try {
      const res = await fetch(`/api/checklists?companyId=${companyId}`);
      const data = await res.json();
      setChecklists(data.checklists || []);
      setChecklistStats(data.stats || null);
    } catch (error) { console.error("Failed to load checklists:", error); }
    setLoadingChecklists(false);
  };

  const addCertification = async () => {
    if (!newCert.workerPhone || !newCert.certType || !newCert.expiryDate) return;
    const worker = workers.find(w => w.phone === newCert.workerPhone);
    try {
      const res = await fetch("/api/certifications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, workerPhone: newCert.workerPhone, workerName: worker?.name, certType: newCert.certType, expiryDate: newCert.expiryDate }),
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

  useEffect(() => {
    loadTeam();
  }, []);

  useEffect(() => {
    if (companyId) {
      if (activeTab === "certifications") loadCertifications();
      if (activeTab === "safety") loadChecklists();
    }
  }, [activeTab, companyId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const url = editWorker ? `/api/team/${editWorker.id}` : "/api/team";
      const method = editWorker ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Failed to save");
      }
      setShowAdd(false);
      setEditWorker(null);
      setForm({ name: "", phone: "", role: "operator" });
      await loadTeam();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    await fetch(`/api/team/${deleteConfirmId}`, { method: "DELETE" });
    setDeleteConfirmId(null);
    await loadTeam();
  }

  function openEdit(w: Worker) {
    setEditWorker(w);
    setForm({ name: w.name || "", phone: w.phone, role: w.role });
    setShowAdd(true);
  }

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

  // Compact worker list for cert phone dropdown
  const companyWorkers = workers.map(w => ({ phone: w.phone, company_id: companyId, name: w.name || undefined }));

  const checkIcon = (v: boolean | null) =>
    v === true ? <CheckCircle2 className="h-4 w-4 text-gray-500 mx-auto" />
    : v === false ? <XCircle className="h-4 w-4 text-gray-500 mx-auto" />
    : <Minus className="h-4 w-4 text-gray-400 mx-auto" />;

  return (
    <div className="min-h-screen">
      <AddCertificationModal
        open={showAddCertModal}
        onClose={() => setShowAddCertModal(false)}
        newCert={newCert}
        setNewCert={setNewCert}
        companyWorkers={companyWorkers}
        onAdd={addCertification}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-[#C96442] text-[#C96442]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TEAM TAB ─────────────────────────────────────────────────────── */}
        {activeTab === "team" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#C96442]" /> Team
                </h1>
                <p className="text-sm text-gray-500 mt-1">{workers.length} worker{workers.length !== 1 ? "s" : ""} enrolled</p>
              </div>
              <Button onClick={() => { setEditWorker(null); setForm({ name: "", phone: "", role: "operator" }); setShowAdd(true); }} className="bg-[#C96442] hover:bg-[#B0532F] text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Worker
              </Button>
            </div>

            {loading ? (
              <div className="text-gray-400 py-20 text-center">Loading…</div>
            ) : workers.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No workers yet. Add one or have them text JOIN to your number.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Skills</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">WOs Completed</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map(w => {
                      const skills = ROLE_SKILLS[w.role] || ["General"];
                      const wosCompleted = workOrders.filter(wo => wo.assigned_to === w.id && wo.status === "completed").length;
                      return (
                        <tr key={w.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{w.name || <span className="text-gray-400 italic">Unnamed</span>}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{w.phone}</td>
                          <td className="px-4 py-3">{roleBadge(w.role)}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {skills.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-blue-100 text-gray-700 rounded-full">{s}</span>)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-medium">{wosCompleted || <span className="text-gray-400">—</span>}</td>
                          <td className="px-4 py-3">
                            {w.verified
                              ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-3.5 w-3.5" /> Active</span>
                              : <span className="flex items-center gap-1 text-orange-500 text-xs"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(w.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => openEdit(w)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><Edit2 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setDeleteConfirmId(w.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── CERTIFICATIONS TAB ───────────────────────────────────────────── */}
        {activeTab === "certifications" && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <SectionHeader
              title="Certifications"
              subtitle="Worker certification status and expiry dates"
              action={
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#C96442] text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              }
            />
            {loadingCerts ? (
              <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
            ) : mappedCerts.length === 0 ? (
              <EmptyState icon={Award} title="No certifications tracked" description="Worker certifications will appear here once added." />
            ) : (
              <div className="overflow-x-auto mt-4">
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
                          <td className="py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${valid ? "bg-green-100 text-gray-700" : "bg-red-100 text-gray-700"}`}>
                              {valid ? "Valid" : "Expired"}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button onClick={() => deleteCertification(cert.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SAFETY CHECKLISTS TAB ────────────────────────────────────────── */}
        {activeTab === "safety" && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <SectionHeader
              title="Safety Checklists"
              subtitle="Pre-shift safety compliance"
              action={checklistStats ? (
                <span className={`text-sm font-medium ${checklistStats.complianceRate === 100 ? "text-gray-600" : "text-gray-500"}`}>
                  {checklistStats.complianceRate}% compliant today
                </span>
              ) : undefined}
            />
            {loadingChecklists ? (
              <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
            ) : mappedChecklists.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No checklists submitted" description="Pre-shift safety checklists submitted by workers will appear here." />
            ) : (
              <div className="overflow-x-auto mt-4">
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
                      return (
                        <tr key={entry.id}>
                          <td className="py-2.5 pr-4 font-medium text-gray-900">{entry.workerName}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{new Date(entry.shiftDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="py-2.5 text-center">{checkIcon(entry.ppeOk)}</td>
                          <td className="py-2.5 text-center">{checkIcon(entry.lotoOk)}</td>
                          <td className="py-2.5 text-center">{checkIcon(entry.equipmentOk)}</td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${passed ? "bg-green-100 text-gray-700" : "bg-red-100 text-gray-700"}`}>
                              {passed ? "Passed" : "Failed"}
                            </span>
                          </td>
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={o => { if (!o) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove worker?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={o => { if (!o) { setShowAdd(false); setEditWorker(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editWorker ? "Edit Worker" : "Add Worker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First Last" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" disabled={!!editWorker} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#C96442] hover:bg-[#B0532F] text-white">
                {saving ? "Saving…" : editWorker ? "Save Changes" : "Add Worker"}
              </Button>
              <Button variant="outline" onClick={() => { setShowAdd(false); setEditWorker(null); }} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
