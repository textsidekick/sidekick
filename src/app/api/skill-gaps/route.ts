export const maxDuration = 60;
import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { detectSkillGaps } from "@/lib/skill-gap-detector";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const report = await detectSkillGaps(companyId);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[skill-gaps] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
