import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("company_id", companyId)
    .order("times_referenced", { ascending: false });

  return NextResponse.json({ articles: data || [] });
}
