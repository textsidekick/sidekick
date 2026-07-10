import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDashboardAuth } from "@/lib/dashboard-auth";

// GET /api/sops/versions?companyId=...&slug=...
// Returns all versions of an SOP (history)
export async function GET(req: NextRequest) {
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || auth.companyId;
  const slug = searchParams.get("slug");

  if (!slug) return NextResponse.json({ versions: [] });

  const { data, error } = await supabase
    .from("sops")
    .select("id,slug,title,version_number,is_current,status,created_by,approved_by,created_at,deprecated_at")
    .eq("company_id", companyId)
    .eq("slug", slug)
    .order("version_number", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ versions: data || [] });
}
