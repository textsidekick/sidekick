import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/knowledge-engine";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const companyId = request.nextUrl.searchParams.get("companyId") || "";

  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const results = await searchKnowledge(q, companyId);
  return NextResponse.json({ results });
}
