import { supabase } from "./supabase";

export async function auditLog(opts: {
  companyId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    await supabase.from("audit_log").insert({
      company_id: opts.companyId ?? null,
      user_id: opts.userId ?? null,
      action: opts.action,
      entity_type: opts.entityType,
      entity_id: opts.entityId ?? null,
      details: opts.details ?? null,
    });
  } catch {
    // audit logging is best-effort — never throw
  }
}
