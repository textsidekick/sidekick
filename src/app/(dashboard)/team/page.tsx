"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Edit2, CheckCircle, Clock } from "lucide-react";

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

const ROLE_SKILLS: Record<string, string[]> = {
  technician: ["Mechanical", "Electrical", "Conveyor Specialist"],
  supervisor: ["Supervision", "Safety", "Scheduling"],
  operator: ["Operations", "Quality Control"],
  manager: ["Management", "Planning"],
};

const ROLES = ["operator", "technician", "supervisor", "manager"];

const ROLE_COLORS = [
  "#2D3436", "#5F4B8B", "#1B4F72", "#4A4A4A",
  "#6C3483", "#1E8449", "#2E4053", "#7D3C98",
  "#1A5276", "#6E2C00", "#1C2833", "#4A235A",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function roleBadge(role: string) {
  const color = ROLE_COLORS[hashString(role) % ROLE_COLORS.length];
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {role}
    </span>
  );
}

export default function TeamPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", role: "operator" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function load() {
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
      const cid = session.companyId;
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

  useEffect(() => { load(); }, []);

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
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteConfirmId(id);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    await fetch(`/api/team/${deleteConfirmId}`, { method: "DELETE" });
    setDeleteConfirmId(null);
    await load();
  }

  function openEdit(w: Worker) {
    setEditWorker(w);
    setForm({ name: w.name || "", phone: w.phone, role: w.role });
    setShowAdd(true);
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-[#C96442]" /> Team
            </h1>
            <p className="text-sm text-gray-500 mt-1">{workers.length} worker{workers.length !== 1 ? "s" : ""} enrolled</p>
          </div>
          <Button onClick={() => { setEditWorker(null); setForm({ name: "", phone: "", role: "operator" }); setShowAdd(true); }} className="bg-[#C96442] hover:bg-[#a8532f] text-white">
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
                {workers.map((w) => {
                  const skills = ROLE_SKILLS[w.role] || ["General"];
                  const wosCompleted = workOrders.filter(
                    (wo) => wo.assigned_to === w.id && wo.status === "completed"
                  ).length;
                  return (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{w.name || <span className="text-gray-400 italic">Unnamed</span>}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{w.phone}</td>
                    <td className="px-4 py-3">{roleBadge(w.role)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {skills.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-[#2980B9] text-white rounded-full">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{wosCompleted || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3">
                      {w.verified
                        ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-3.5 w-3.5" /> Active</span>
                        : <span className="flex items-center gap-1 text-amber-600 text-xs"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(w)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(w.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(o) => { if (!o) setDeleteConfirmId(null); }}>
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

      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditWorker(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editWorker ? "Edit Worker" : "Add Worker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First Last" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" disabled={!!editWorker} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#C96442] hover:bg-[#a8532f] text-white">
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
