import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateMonthlyROI } from "@/lib/downtime-cost-engine";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const roi = await calculateMonthlyROI(companyId);
    return NextResponse.json(roi);
  } catch (error) {
    console.error("[dashboard/roi] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
