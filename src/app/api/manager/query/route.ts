import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { handleManagerQuery } from "@/lib/manager-query";

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await handleManagerQuery(query.trim(), companyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[manager/query] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
