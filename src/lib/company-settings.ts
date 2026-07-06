import { supabase } from "@/lib/supabase";

export type NotificationPreferences = {
  sms_on_critical: boolean;
  sms_on_wo_create: boolean;
  daily_digest: boolean;
};

export type CompanyPriorityProfile = {
  id?: string;
  name: "critical" | "high" | "medium" | "low";
  level: number;
  sla_hours: number;
};

export type CompanyRuntimeSettings = {
  working_hours_start: string | null;
  working_hours_end: string | null;
  notification_preferences: NotificationPreferences;
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sms_on_critical: true,
  sms_on_wo_create: false,
  daily_digest: false,
};

export const DEFAULT_PRIORITY_PROFILES: CompanyPriorityProfile[] = [
  { name: "critical", level: 4, sla_hours: 2 },
  { name: "high", level: 3, sla_hours: 8 },
  { name: "medium", level: 2, sla_hours: 24 },
  { name: "low", level: 1, sla_hours: 72 },
];

export function normalizeCompanyPriorityProfiles(
  rows: Array<Partial<CompanyPriorityProfile> & { id?: string; name?: string | null; level?: number | null; sla_hours?: number | null }> = []
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
      level: Number.isFinite(Number(row?.level)) ? Number(row?.level) : fallback.level,
      sla_hours: Number.isFinite(Number(row?.sla_hours)) ? Number(row?.sla_hours) : fallback.sla_hours,
    };
  });
}

export function getPriorityProfile(
  priority: string | null | undefined,
  rows: Array<Partial<CompanyPriorityProfile> & { id?: string; name?: string | null; level?: number | null; sla_hours?: number | null }> = []
): CompanyPriorityProfile | null {
  if (!priority) return null;
  return normalizeCompanyPriorityProfiles(rows).find((row) => row.name === priority) || null;
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
    .select("working_hours_start, working_hours_end, notification_preferences")
    .eq("company_id", companyId)
    .maybeSingle();

  const prefs = (data?.notification_preferences || {}) as Partial<NotificationPreferences>;

  return {
    working_hours_start: data?.working_hours_start || null,
    working_hours_end: data?.working_hours_end || null,
    notification_preferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...prefs,
    },
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
