import { NextRequest, NextResponse } from "next/server";
import { getWorkOrder, updateWorkOrder, deleteWorkOrder } from "@/lib/operations";
import type { UpdateWorkOrder } from "@/types/operations";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const wo = await getWorkOrder(id);
    if (!wo) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ workOrder: wo });
  } catch (error) {
    console.error("[api/operations/work-orders/:id][GET]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { patch: UpdateWorkOrder };
    if (!body?.patch) return NextResponse.json({ error: "patch_required" }, { status: 400 });

    const wo = await updateWorkOrder(id, body.patch);
    return NextResponse.json({ workOrder: wo });
  } catch (error) {
    console.error("[api/operations/work-orders/:id][PATCH]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteWorkOrder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/operations/work-orders/:id][DELETE]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
