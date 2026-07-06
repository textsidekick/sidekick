import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { getWorkOrder, updateWorkOrder, deleteWorkOrder } from "@/lib/operations";
import type { UpdateWorkOrder } from "@/types/operations";
import { supabase } from "@/lib/supabase";
import { captureKnowledge } from "@/lib/knowledge-engine";
import { handleWorkOrderCompletion } from "@/lib/work-order-manager";

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

    const patch: UpdateWorkOrder = { ...body.patch };
    if (patch.status === "completed" && !patch.completed_at) {
      patch.completed_at = new Date().toISOString();
    }
    if (patch.status === "in_progress" && !patch.started_at) {
      patch.started_at = new Date().toISOString();
    }

    if (patch.assigned_to) {
      const { data: assignedWorker } = await supabase
        .from("workers")
        .select("phone")
        .eq("id", patch.assigned_to)
        .single();
      patch.assigned_to_phone = assignedWorker?.phone || null;
      if (!patch.status || patch.status === "open") {
        patch.status = "assigned";
      }
    }

    if (patch.assigned_to === null && patch.status === undefined) {
      patch.assigned_to_phone = null;
    }

    const wo = await updateWorkOrder(id, patch);

    if (wo.status === "completed") {
      await Promise.allSettled([
        handleWorkOrderCompletion(wo.id),
        captureKnowledge(wo.id),
      ]);
    }

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
