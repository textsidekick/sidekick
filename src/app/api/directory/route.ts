import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get workers with their activity stats
  const { data: workers } = await supabase
    .from("workers")
    .select("phone, name, company_id, created_at, verified")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (!workers) {
    return NextResponse.json({ workers: [] });
  }

  // Get question counts and last activity for each worker
  const enrichedWorkers = await Promise.all(
    workers.map(async (w) => {
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("worker_phone", w.phone)
        .eq("company_id", companyId);

      const { data: lastQ } = await supabase
        .from("questions")
        .select("created_at")
        .eq("worker_phone", w.phone)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...w,
        questionCount: count || 0,
        lastActive: lastQ?.created_at || w.created_at,
        joinedAt: w.created_at,
      };
    })
  );

  return NextResponse.json({ 
    workers: enrichedWorkers,
    totalWorkers: enrichedWorkers.length,
    activeThisWeek: enrichedWorkers.filter(w => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(w.lastActive).getTime() > weekAgo;
    }).length,
  });
}
