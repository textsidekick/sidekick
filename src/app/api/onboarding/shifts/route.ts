import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { companyId, shifts } = await req.json();
    if (!companyId || !Array.isArray(shifts)) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const rows = shifts
      .filter((s: any) => s.name?.trim() && s.start && s.end)
      .map((s: any) => ({
        company_id: companyId,
        name: s.name.trim(),
        start_time: s.start,
        end_time: s.end,
      }));

    if (rows.length === 0) return NextResponse.json({ created: 0 });

    const { data, error } = await supabase.from("shifts").insert(rows as any).select();
    if (error) throw error;
    return NextResponse.json({ created: data?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
