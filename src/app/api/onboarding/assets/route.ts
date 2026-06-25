import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { companyId, assets } = await req.json();
    if (!companyId || !Array.isArray(assets)) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const rows = assets
      .filter((a: any) => a.name?.trim())
      .map((a: any) => ({
        company_id: companyId,
        name: a.name.trim(),
        asset_tag: a.tag?.trim() || null,
        location: a.location?.trim() || null,
        make: a.type?.trim() || null,
        status: "active",
        health_score: 100,
      }));

    if (rows.length === 0) return NextResponse.json({ created: 0 });

    const { data, error } = await supabase.from("assets").insert(rows as any).select();
    if (error) throw error;

    return NextResponse.json({ created: data?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
