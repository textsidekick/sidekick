import { NextRequest, NextResponse } from "next/server";
import { listWorkOrders, createWorkOrder } from "@/lib/operations";
import type { InsertWorkOrder } from "@/types/operations";

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId");
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const priority = request.nextUrl.searchParams.get("priority") || undefined;
    const assetId = request.nextUrl.searchParams.get("assetId") || undefined;
    const locationId = request.nextUrl.searchParams.get("locationId") || undefined;

    if (!companyId) return NextResponse.json({ error: "companyId_required" }, { status: 400 });

    const workOrders = await listWorkOrders(companyId, { status, priority, assetId: assetId as any, locationId: locationId as any });
    return NextResponse.json({ workOrders });
  } catch (error) {
    console.error("[api/operations/work-orders][GET]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { workOrder: InsertWorkOrder };
    if (!body?.workOrder?.company_id) return NextResponse.json({ error: "workOrder.company_id_required" }, { status: 400 });

    const workOrder = await createWorkOrder(body.workOrder);
    return NextResponse.json({ workOrder });
  } catch (error) {
    console.error("[api/operations/work-orders][POST]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
