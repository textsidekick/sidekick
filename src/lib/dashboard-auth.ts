import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Extract company_id from request using multiple auth methods:
 * 1. sidekick_session cookie → manager_sessions table
 * 2. companyId query parameter (for client-side auth via localStorage)
 * 3. Fallback to Acme Manufacturing for demo purposes
 */
export async function getCompanyId(request: NextRequest): Promise<string | null> {
  // Method 1: Session cookie
  const token = request.cookies.get("sidekick_session")?.value;
  if (token) {
    const { data: session } = await supabase
      .from("manager_sessions")
      .select("company_id, expires_at")
      .eq("token", token)
      .single();

    if (session && new Date(session.expires_at) > new Date()) {
      return session.company_id;
    }
  }

  // Method 2: companyId query param (used by manager page which has its own auth)
  const companyId = request.nextUrl.searchParams.get("companyId");
  if (companyId) return companyId;

  // Method 3: If only one company exists, use it (demo mode)
  const { data: companies } = await supabase.from("companies").select("id").limit(2);
  if (companies && companies.length === 1) return companies[0].id;

  return null;
}
