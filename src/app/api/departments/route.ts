import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

const DEFAULT_DEPARTMENTS = [
  { name: "Production", color: "#C96442" },
  { name: "Quality", color: "#2563EB" },
  { name: "Maintenance", color: "#059669" },
  { name: "Logistics", color: "#7C3AED" },
  { name: "R&D", color: "#DB2777" },
  { name: "Office / Admin", color: "#64748B" },
];

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("company_id", companyId)
    .order("name");
  if (error) return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  return NextResponse.json({ departments: data || [] });
}

export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Seed defaults for a new enterprise rollout
  if (body?.seedDefaults) {
    const { data, error } = await supabase
      .from("departments")
      .upsert(
        DEFAULT_DEPARTMENTS.map((d) => ({ ...d, company_id: companyId })),
        { onConflict: "company_id,name", ignoreDuplicates: true }
      )
      .select();
    if (error) return NextResponse.json({ error: "Seed failed" }, { status: 500 });
    return NextResponse.json({ departments: data || [] }, { status: 201 });
  }

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("departments")
    .insert({ company_id: companyId, name: body.name.trim(), color: body.color || "#C96442" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Create failed" }, { status: 500 });
  return NextResponse.json({ department: data }, { status: 201 });
}
