import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/phone";

export async function POST(req: NextRequest) {
  try {
    const { companyId, team } = await req.json();
    if (!companyId || !Array.isArray(team)) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const rows = team
      .filter((m: any) => m.phone?.trim())
      .map((m: any) => ({
        company_id: companyId,
        name: m.name?.trim() || null,
        phone: normalizePhoneNumber(m.phone.trim()),
        role: m.role || "operator",
        verified: true,
      }));

    if (rows.length === 0) return NextResponse.json({ created: 0 });

    const { data, error } = await supabase
      .from("workers")
      .upsert(rows as any, { onConflict: "phone" })
      .select();

    if (error) throw error;
    return NextResponse.json({ created: data?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
