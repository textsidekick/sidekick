"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Trash2, Save } from "lucide-react";

type CompanySettings = {
  working_hours_start: string;
  working_hours_end: string;
  escalation_rules: EscalationRule[];
  notification_preferences: Record<string, boolean>;
};

type EscalationRule = {
  priority: string;
  hours: number;
  notify: string;
};

type WoCategory = { id: string; name: string; color: string };
type WoPriority = { id: string; name: string; level: number; sla_hours: number };
type Company = { name: string; manager_phone: string; manager_name: string };

export default function SettingsPage() {
  const [company, setCompany] = useState<Company>({ name: "", manager_phone: "", manager_name: "" });
  const [settings, setSettings] = useState<CompanySettings>({
    working_hours_start: "06:00",
    working_hours_end: "22:00",
    escalation_rules: [],
    notification_preferences: { sms_on_critical: true, sms_on_wo_create: false },
  });
  const [categories, setCategories] = useState<WoCategory[]>([]);
  const [priorities, setPriorities] = useState<WoPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", color: "#6b7280" });
  const [newPri, setNewPri] = useState({ name: "", level: 1, sla_hours: 24 });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/company-settings", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.company) setCompany(json.company);
      if (json.settings) setSettings({ ...settings, ...json.settings });
      if (json.categories) setCategories(json.categories);
      if (json.priorities) setPriorities(json.priorities);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    const res = await fetch("/api/company-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, company }),
    });
    setSaving(false);
    if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
  }

  async function addCategory() {
    if (!newCat.name) return;
    const res = await fetch("/api/company-settings/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });
    if (res.ok) { setNewCat({ name: "", color: "#6b7280" }); await load(); }
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/company-settings/categories/${id}`, { method: "DELETE" });
    await load();
  }

  async function addPriority() {
    if (!newPri.name) return;
    const res = await fetch("/api/company-settings/priorities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPri),
    });
    if (res.ok) { setNewPri({ name: "", level: 1, sla_hours: 24 }); await load(); }
  }

  async function deletePriority(id: string) {
    await fetch(`/api/company-settings/priorities/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-gray-500" /> Company Settings
          </h1>
          <Button onClick={handleSave} disabled={saving} className="bg-[#C96442] hover:bg-[#a8532f] text-white flex items-center gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : success ? "Saved" : "Save Changes"}
          </Button>
        </div>

        {loading ? <div className="text-gray-400 py-20 text-center">Loading…</div> : (
          <div className="space-y-6">
            {/* Company Info */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Company Info</h2>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Company Name" value={company.name} onChange={(v) => setCompany(c => ({ ...c, name: v }))} />
                <Field label="Manager Name" value={company.manager_name} onChange={(v) => setCompany(c => ({ ...c, manager_name: v }))} />
                <Field label="Manager Phone" value={company.manager_phone} onChange={(v) => setCompany(c => ({ ...c, manager_phone: v }))} placeholder="+1 555 000 0000" />
              </div>
            </section>

            {/* Working Hours */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Working Hours</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start Time</label>
                  <input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={settings.working_hours_start} onChange={(e) => setSettings(s => ({ ...s, working_hours_start: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End Time</label>
                  <input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={settings.working_hours_end} onChange={(e) => setSettings(s => ({ ...s, working_hours_end: e.target.value }))} />
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  { key: "sms_on_critical", label: "SMS alert on critical WO" },
                  { key: "sms_on_wo_create", label: "SMS on every new WO" },
                  { key: "daily_digest", label: "Daily digest SMS" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.notification_preferences[key]}
                      onChange={(e) => setSettings(s => ({ ...s, notification_preferences: { ...s.notification_preferences, [key]: e.target.checked } }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* WO Categories */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Work Order Categories</h2>
              <p className="text-xs text-gray-400 mb-4">These categories are used by Sidekick’s AI to classify incoming issues and route work orders automatically.</p>
              <div className="space-y-2 mb-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-sm flex-1">{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={newCat.color} onChange={(e) => setNewCat(c => ({ ...c, color: e.target.value }))} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="Category name" value={newCat.name} onChange={(e) => setNewCat(c => ({ ...c, name: e.target.value }))} />
                <Button size="sm" onClick={addCategory} variant="outline"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </section>

            {/* WO Priorities */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Work Order Priorities</h2>
              <p className="text-xs text-gray-400 mb-4">Priority levels and SLA hours are used by the AI triage system to determine urgency and escalation timing.</p>
              <div className="space-y-2 mb-4">
                {priorities.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">L{p.level}</span>
                    <span className="text-sm flex-1">{p.name}</span>
                    <span className="text-xs text-gray-400">SLA: {p.sla_hours}h</span>
                    <button onClick={() => deletePriority(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={5} value={newPri.level} onChange={(e) => setNewPri(p => ({ ...p, level: Number(e.target.value) }))} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="Level" />
                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="Priority name" value={newPri.name} onChange={(e) => setNewPri(p => ({ ...p, name: e.target.value }))} />
                <input type="number" value={newPri.sla_hours} onChange={(e) => setNewPri(p => ({ ...p, sla_hours: Number(e.target.value) }))} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="SLA h" />
                <Button size="sm" onClick={addPriority} variant="outline"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
