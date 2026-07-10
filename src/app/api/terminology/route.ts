import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("terminology")
    .select("*")
    .eq("company_id", companyId)
    .order("term");
  if (error) return NextResponse.json({ error: "Failed to fetch terms" }, { status: 500 });
  return NextResponse.json({ terms: data || [] });
}

export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body?.term?.trim()) {
    return NextResponse.json({ error: "term is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("terminology")
    .upsert(
      {
        company_id: companyId,
        term: body.term.trim(),
        synonyms: Array.isArray(body.synonyms)
          ? body.synonyms.map((s: string) => s.trim()).filter(Boolean)
          : [],
        definition: body.definition || "",
        language: body.language || "ko",
        department_id: body.department_id || null,
        created_by: body.created_by || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id,term" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Save failed" }, { status: 500 });
  return NextResponse.json({ term: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase
    .from("terminology")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
