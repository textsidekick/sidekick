import { supabase } from "@/lib/supabase";

export type NotificationPreferences = {
  sms_on_critical: boolean;
  sms_on_wo_create: boolean;
  daily_digest: boolean;
};

export type CompanyPriorityProfile = {
  id?: string;
  name: "critical" | "high" | "medium" | "low";
  display_label: string;
  level: number;
  sla_hours: number;
};

export type PriorityDisplayLabels = Partial<Record<CompanyPriorityProfile["name"], string>>;

export type CompanyRuntimeSettings = {
  working_hours_start: string | null;
  working_hours_end: string | null;
  escalation_rules: unknown[];
  notification_preferences: NotificationPreferences;
  priority_display_labels: PriorityDisplayLabels;
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sms_on_critical: true,
  sms_on_wo_create: false,
  daily_digest: false,
};

export const DEFAULT_PRIORITY_PROFILES: CompanyPriorityProfile[] = [
  { name: "critical", display_label: "Critical", level: 4, sla_hours: 2 },
  { name: "high", display_label: "High", level: 3, sla_hours: 8 },
  { name: "medium", display_label: "Medium", level: 2, sla_hours: 24 },
  { name: "low", display_label: "Low", level: 1, sla_hours: 72 },
];

type PriorityLabelRule = {
  kind?: string;
  priority?: string | null;
  display_label?: string | null;
};

export function extractPriorityDisplayLabels(escalationRules: unknown): PriorityDisplayLabels {
  const rules = Array.isArray(escalationRules) ? (escalationRules as PriorityLabelRule[]) : [];
  const labels: PriorityDisplayLabels = {};

  for (const rule of rules) {
    const priority = typeof rule?.priority === "string" ? rule.priority.toLowerCase() : null;
    const displayLabel = typeof rule?.display_label === "string" ? rule.display_label.trim() : "";
    if (!priority || !displayLabel) continue;
    if (!["critical", "high", "medium", "low"].includes(priority)) continue;
    if (rule.kind && rule.kind !== "priority_display_label") continue;
    labels[priority as CompanyPriorityProfile["name"]] = displayLabel;
  }

  return labels;
}

export function buildPriorityDisplayLabelRules(
  profiles: Array<Pick<CompanyPriorityProfile, "name" | "display_label">>,
  existingRules: unknown = []
): unknown[] {
  const preservedRules = Array.isArray(existingRules)
    ? existingRules.filter((rule) => {
        if (!rule || typeof rule !== "object") return false;
        const typed = rule as PriorityLabelRule;
        return typed.kind !== "priority_display_label";
      })
    : [];

  const labelRules = profiles.map((profile) => ({
    kind: "priority_display_label",
    priority: profile.name,
    display_label: profile.display_label,
  }));

  return [...preservedRules, ...labelRules];
}

export function normalizeCompanyPriorityProfiles(
  rows: Array<Partial<CompanyPriorityProfile> & { id?: string; name?: string | null; level?: number | null; sla_hours?: number | null }> = [],
  displayLabels: PriorityDisplayLabels = {}
): CompanyPriorityProfile[] {
  const byName = new Map(
    rows
      .filter((row) => typeof row.name === "string")
      .map((row) => [String(row.name).toLowerCase(), row])
  );

  return DEFAULT_PRIORITY_PROFILES.map((fallback) => {
    const row = byName.get(fallback.name);
    return {
      id: row?.id,
      name: fallback.name,
      display_label: displayLabels[fallback.name]?.trim() || fallback.display_label,
      level: Number.isFinite(Number(row?.level)) ? Number(row?.level) : fallback.level,
      sla_hours: Number.isFinite(Number(row?.sla_hours)) ? Number(row?.sla_hours) : fallback.sla_hours,
    };
  });
}

export function getPriorityProfile(
  priority: string | null | undefined,
  rows: Array<Partial<CompanyPriorityProfile> & { id?: string; name?: string | null; level?: number | null; sla_hours?: number | null }> = [],
  displayLabels: PriorityDisplayLabels = {}
): CompanyPriorityProfile | null {
  if (!priority) return null;
  return normalizeCompanyPriorityProfiles(rows, displayLabels).find((row) => row.name === priority) || null;
}

export function getPriorityDisplayLabel(
  priority: string | null | undefined,
  displayLabels: PriorityDisplayLabels = {}
): string {
  if (!priority) return "Unknown";
  const normalized = priority.toLowerCase() as CompanyPriorityProfile["name"];
  return displayLabels[normalized]?.trim() || DEFAULT_PRIORITY_PROFILES.find((row) => row.name === normalized)?.display_label || priority;
}

function timeToMinutes(value: string | null | undefined): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

export function isWithinWorkingHours(settings: CompanyRuntimeSettings, now = new Date()): boolean {
  const start = timeToMinutes(settings.working_hours_start);
  const end = timeToMinutes(settings.working_hours_end);
  if (start === null || end === null) return true;

  const current = now.getHours() * 60 + now.getMinutes();
  if (start === end) return true;
  if (start < end) return current >= start && current <= end;
  return current >= start || current <= end;
}

export async function getCompanyRuntimeSettings(companyId: string): Promise<CompanyRuntimeSettings> {
  const { data } = await supabase
    .from("company_settings")
    .select("working_hours_start, working_hours_end, escalation_rules, notification_preferences")
    .eq("company_id", companyId)
    .maybeSingle();

  const prefs = (data?.notification_preferences || {}) as Partial<NotificationPreferences>;
  const escalationRules = Array.isArray(data?.escalation_rules) ? data?.escalation_rules : [];
  const priorityDisplayLabels = extractPriorityDisplayLabels(escalationRules);

  return {
    working_hours_start: data?.working_hours_start || null,
    working_hours_end: data?.working_hours_end || null,
    escalation_rules: escalationRules,
    notification_preferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...prefs,
    },
    priority_display_labels: priorityDisplayLabels,
  };
}

export function shouldSendManagerWorkOrderAlert(
  settings: CompanyRuntimeSettings,
  opts: { priority?: string | null; criticalIncident?: boolean }
): boolean {
  if (opts.criticalIncident || opts.priority === "critical") {
    return settings.notification_preferences.sms_on_critical;
  }

  if (!settings.notification_preferences.sms_on_wo_create) return false;
  return isWithinWorkingHours(settings);
}

export function shouldSendDailyDigest(settings: CompanyRuntimeSettings): boolean {
  return settings.notification_preferences.daily_digest;
}
