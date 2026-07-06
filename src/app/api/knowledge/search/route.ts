import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/knowledge-engine";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await searchKnowledge(q, companyId);
  return NextResponse.json({ results });
}
