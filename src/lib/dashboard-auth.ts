import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // Step 2: If a companyId query param is provided, verify the session owns it.
  // For now, sessions are single-company, so just return the session's company.
  // The query param is accepted only if it matches the session's company.
  const paramCompanyId = request.nextUrl.searchParams.get("companyId");
  if (paramCompanyId && paramCompanyId !== session.company_id) {
    // The session doesn't own this company — deny.
    return null;
  }

  return session.company_id;
}
