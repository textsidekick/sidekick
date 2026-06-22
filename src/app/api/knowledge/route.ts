import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  if (!companyId) {
    // Try session auth
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "company_id or session required" }, { status: 400 });
    const { data: session } = await supabase.from("manager_sessions").select("company_id").eq("token", token).single();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    
    const { data } = await supabase
      .from("knowledge_articles")
      .select("*")
      .eq("company_id", session.company_id)
      .order("times_referenced", { ascending: false });
    return NextResponse.json({ articles: data || [] });
  }

  const { data } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("company_id", companyId)
    .order("times_referenced", { ascending: false });

  return NextResponse.json({ articles: data || [] });
}
