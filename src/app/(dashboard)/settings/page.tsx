"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Settings, Trash2 } from "lucide-react";

type NotificationPreferences = {
  sms_on_critical: boolean;
  sms_on_wo_create: boolean;
  daily_digest: boolean;
};

type CompanySettings = {
  working_hours_start: string;
  working_hours_end: string;
  escalation_rules: unknown[];
  notification_preferences: NotificationPreferences;
};

type Company = { name: string; manager_phone: string; manager_name: string };
type WoCategory = { id: string; name: string; color: string };
type WoPriority = {
  id?: string;
  name: "critical" | "high" | "medium" | "low";
  display_label: string;
  level: number;
  sla_hours: number;
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sms_on_critical: true,
  sms_on_wo_create: false,
  daily_digest: false,
};

const DEFAULT_PRIORITIES: WoPriority[] = [
  { name: "critical", display_label: "Critical", level: 4, sla_hours: 2 },
  { name: "high", display_label: "High", level: 3, sla_hours: 8 },
  { name: "medium", display_label: "Medium", level: 2, sla_hours: 24 },
  { name: "low", display_label: "Low", level: 1, sla_hours: 72 },
];

function normalizePriorities(rows: Partial<WoPriority>[] = []): WoPriority[] {
  const byName = new Map(
    rows
      .filter((row) => typeof row.name === "string")
      .map((row) => [String(row.name).toLowerCase(), row])
  );

  return DEFAULT_PRIORITIES.map((fallback) => {
    const row = byName.get(fallback.name);
    return {
      id: row?.id,
      name: fallback.name,
      display_label: typeof row?.display_label === "string" && row.display_label.trim() ? row.display_label : fallback.display_label,
      level: Number.isFinite(Number(row?.level)) ? Number(row?.level) : fallback.level,
      sla_hours: Number.isFinite(Number(row?.sla_hours)) ? Number(row?.sla_hours) : fallback.sla_hours,
    };
  });
}

function buildPriorityDisplayLabelRules(priorities: WoPriority[], existingRules: unknown[] = []): unknown[] {
  const preservedRules = Array.isArray(existingRules)
    ? existingRules.filter((rule) => {
        if (!rule || typeof rule !== "object") return false;
        return (rule as { kind?: string }).kind !== "priority_display_label";
      })
    : [];

  return [
    ...preservedRules,
    ...priorities.map((priority) => ({
      kind: "priority_display_label",
      priority: priority.name,
      display_label: priority.display_label,
    })),
  ];
}

function persistPriorityLabels(priorities: WoPriority[]) {
  if (typeof window === "undefined") return;
  const labelMap = Object.fromEntries(priorities.map((priority) => [priority.name, priority.display_label]));
  window.localStorage.setItem("sidekick_priority_labels", JSON.stringify(labelMap));
}

export default function SettingsPage() {
  const [company, setCompany] = useState<Company>({ name: "", manager_phone: "", manager_name: "" });
  const [settings, setSettings] = useState<CompanySettings>({
    working_hours_start: "06:00",
    working_hours_end: "22:00",
    escalation_rules: [],
    notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  });
  const [categories, setCategories] = useState<WoCategory[]>([]);
  const [priorities, setPriorities] = useState<WoPriority[]>(DEFAULT_PRIORITIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", color: "#6b7280" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/company-settings", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.company) setCompany(json.company);
      setSettings({
        working_hours_start: json.settings?.working_hours_start || "06:00",
        working_hours_end: json.settings?.working_hours_end || "22:00",
        escalation_rules: Array.isArray(json.settings?.escalation_rules) ? json.settings.escalation_rules : [],
        notification_preferences: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(json.settings?.notification_preferences || {}),
        },
      });
      setCategories(json.categories || []);
      const normalizedPriorities = normalizePriorities(json.priorities || []);
      setPriorities(normalizedPriorities);
      persistPriorityLabels(normalizedPriorities);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    const res = await fetch("/api/company-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          ...settings,
          escalation_rules: buildPriorityDisplayLabelRules(priorities, settings.escalation_rules),
        },
        company,
        priorities,
      }),
    });
    setSaving(false);
    if (res.ok) {
      persistPriorityLabels(priorities);
      setSuccess(true);
      await load();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function addCategory() {
    if (!newCat.name.trim()) return;
    const res = await fetch("/api/company-settings/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat.name.trim(), color: newCat.color }),
    });
    if (res.ok) {
      setNewCat({ name: "", color: "#6b7280" });
      await load();
    }
  }

  async function deleteCategory(id: string) {
    const res = await fetch(`/api/company-settings/categories/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  function updatePriority(name: WoPriority["name"], patch: Partial<WoPriority>) {
    setPriorities((current) =>
      current.map((priority) => (priority.name === name ? { ...priority, ...patch } : priority))
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#C96442]" /> Company Settings
          </h1>
          <Button onClick={handleSave} disabled={saving} className="bg-[#C96442] hover:bg-[#B0532F] text-white flex items-center gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : success ? "Saved" : "Save Changes"}
          </Button>
        </div>

        {loading ? (
          <div className="text-gray-400 py-20 text-center">Loading…</div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Company Info</h2>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Company Name" value={company.name} onChange={(v) => setCompany((c) => ({ ...c, name: v }))} />
                <Field label="Manager Name" value={company.manager_name} onChange={(v) => setCompany((c) => ({ ...c, manager_name: v }))} />
                <Field label="Manager Phone" value={company.manager_phone} onChange={(v) => setCompany((c) => ({ ...c, manager_phone: v }))} placeholder="+1 555 000 0000" />
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Working Hours</h2>
              <p className="text-xs text-gray-500 mb-4">Non-critical manager SMS alerts only go out during these hours; critical incidents still break through immediately.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={settings.working_hours_start}
                    onChange={(e) => setSettings((s) => ({ ...s, working_hours_start: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={settings.working_hours_end}
                    onChange={(e) => setSettings((s) => ({ ...s, working_hours_end: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Notification Preferences</h2>
              <p className="text-xs text-gray-500 mb-4">These control manager SMS alerts for work orders and whether daily digests are sent.</p>
              <div className="space-y-3">
                {[
                  { key: "sms_on_critical", label: "SMS alert on critical WO" },
                  { key: "sms_on_wo_create", label: "SMS on every new WO" },
                  { key: "daily_digest", label: "Daily digest SMS" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.notification_preferences[key as keyof NotificationPreferences]}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          notification_preferences: {
                            ...s.notification_preferences,
                            [key]: e.target.checked,
                          },
                        }))
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Work Order Categories</h2>
              <p className="text-xs text-gray-500 mb-4">AI triage now prefers these category names for new issues, and technician routing uses the chosen category string when matching skills.</p>
              <div className="space-y-2 mb-4">
                {categories.length === 0 ? (
                  <div className="text-sm text-gray-400">No categories added yet.</div>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm flex-1">{cat.name}</span>
                      <button onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-500" aria-label={`Delete ${cat.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCat.color}
                  onChange={(e) => setNewCat((c) => ({ ...c, color: e.target.value }))}
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  placeholder="Category name"
                  value={newCat.name}
                  onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
                />
                <Button size="sm" onClick={addCategory} variant="outline">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Work Order Priorities</h2>
              <p className="text-xs text-gray-500 mb-4">Display labels drive what the UI shows, while SLA hours are saved to the backend, guide AI urgency classification, and get attached to new work-order alerting.</p>
              <div className="space-y-3">
                {priorities.map((priority) => (
                  <div key={priority.name} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_100px_120px] gap-3 items-center rounded-lg border border-gray-200 p-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Priority key</div>
                      <div className="text-sm font-medium capitalize text-gray-900">{priority.name}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Display label</label>
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        value={priority.display_label}
                        onChange={(e) => updatePriority(priority.name, { display_label: e.target.value })}
                        placeholder="Label shown in the UI"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Level</label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        value={priority.level}
                        onChange={(e) => updatePriority(priority.name, { level: Number(e.target.value) || priority.level })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">SLA hours</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        value={priority.sla_hours}
                        onChange={(e) => updatePriority(priority.name, { sla_hours: Number(e.target.value) || priority.sla_hours })}
                      />
                    </div>
                  </div>
                ))}
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
