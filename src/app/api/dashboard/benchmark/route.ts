import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateBenchmark } from "@/lib/cross-plant-learning";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const benchmark = await generateBenchmark(companyId);
    return NextResponse.json(benchmark);
  } catch (error) {
    console.error("[dashboard/benchmark] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
