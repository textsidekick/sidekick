import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { name?: string; level?: number; sla_hours?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const { data, error } = await supabase.from("wo_priorities").insert({ company_id: companyId, name: body.name, level: body.level ?? 1, sla_hours: body.sla_hours ?? 24 }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ priority: data }, { status: 201 });
}
