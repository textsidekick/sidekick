import { supabase } from "@/lib/supabase";

export type NotificationPreferences = {
  sms_on_critical: boolean;
  sms_on_wo_create: boolean;
  daily_digest: boolean;
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

  return settings.notification_preferences.sms_on_wo_create;
}

export function shouldSendDailyDigest(settings: CompanyRuntimeSettings): boolean {
  return settings.notification_preferences.daily_digest;
}
