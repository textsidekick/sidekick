"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";

type CompanySettings = {
  notification_preferences: Record<string, boolean>;
};
type Company = { name: string; manager_phone: string; manager_name: string };

const DEFAULT_NOTIFICATION_PREFERENCES = {
  sms_on_critical: true,
  sms_on_wo_create: false,
  daily_digest: false,
};

export default function SettingsPage() {
  const [company, setCompany] = useState<Company>({ name: "", manager_phone: "", manager_name: "" });
  const [settings, setSettings] = useState<CompanySettings>({
    notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/company-settings", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.company) setCompany(json.company);
      setSettings({
        notification_preferences: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(json.settings?.notification_preferences || {}),
        },
      });
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

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#C96442]" /> Company Settings
          </h1>
          <Button onClick={handleSave} disabled={saving} className="bg-[#C96442] hover:bg-[#B0532F] text-white flex items-center gap-2">
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


            {/* Notification Preferences */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Notification Preferences</h2>
              <p className="text-xs text-gray-500 mb-4">These are live. They control manager SMS alerts for work orders and whether daily digests are sent.</p>
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
