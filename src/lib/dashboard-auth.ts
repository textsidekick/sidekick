import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type AuthResult =
  | { ok: true; companyId: string; response?: never }
  | { ok: false; companyId?: never; response: NextResponse };

/**
 * Convenience wrapper: returns { ok: true, companyId } or { ok: false, response }
 * Usage: const auth = await requireDashboardAuth(req); if (!auth.ok) return auth.response;
 */
export async function requireDashboardAuth(request: NextRequest): Promise<AuthResult> {
  const companyId = await getCompanyId(request);
  if (!companyId) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, companyId };
}

/**
 * Extract company_id from request. Session cookie is REQUIRED.
 * The companyId query param is only used to disambiguate when a session
 * is valid but the user has access to multiple companies.
 */
export async function getCompanyId(request: NextRequest): Promise<string | null> {
  // Step 1: Validate session cookie
  const token = request.cookies.get("sidekick_session")?.value;
  if (!token) return null;

  const { data: session } = await supabase
    .from("manager_sessions")
    .select("company_id, expires_at")
    .eq("token", token)
    .single();

  if (!session || new Date(session.expires_at) <= new Date()) {
    return null;
  }

  // Always return the session's company. Ignore companyId query param
  // if it doesn't match — the session is the source of truth.
  return session.company_id;
}
