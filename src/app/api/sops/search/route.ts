import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/sops/search?companyId=...&q=...&language=...
// Used by SMS handler to look up SOPs by keyword/title
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const q = searchParams.get("q") || "";
  const language = searchParams.get("language") || "en";

  if (!companyId || !q) {
    return NextResponse.json({ sops: [] });
  }

  // Search active SOPs using ILIKE on title, description, and tags
  const { data, error } = await supabase
    .from("sops")
    .select("id,slug,title,description,content,version_number,category,tags,language,department_id,approved_by,updated_at")
    .eq("company_id", companyId)
    .eq("is_current", true)
    .eq("status", "active")
    .or(
      `title.ilike.%${q}%,description.ilike.%${q}%`
    )
    .limit(5);

  if (error) return NextResponse.json({ sops: [] });

  // Also filter by language preference (prefer matching language, fall back to 'en')
  const preferredLanguage = language.split("-")[0].toLowerCase();
  const sorted = (data || []).sort((a, b) => {
    const aMatch = a.language === preferredLanguage ? 0 : 1;
    const bMatch = b.language === preferredLanguage ? 0 : 1;
    return aMatch - bMatch;
  });

  return NextResponse.json({ sops: sorted });
}
