import { NextRequest, NextResponse } from "next/server";
import { createAsset, listAssets } from "@/lib/operations";
import type { InsertAsset } from "@/types/operations";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    const locationId = request.nextUrl.searchParams.get("locationId") || undefined;
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assets = await listAssets(companyId, { locationId: locationId as any });
    return NextResponse.json({ assets });
  } catch (error) {
    console.error("[api/operations/assets][GET]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { asset: InsertAsset };
    if (!body?.asset?.company_id) return NextResponse.json({ error: "asset.company_id_required" }, { status: 400 });

    const asset = await createAsset(body.asset);
    return NextResponse.json({ asset });
  } catch (error) {
    console.error("[api/operations/assets][POST]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
