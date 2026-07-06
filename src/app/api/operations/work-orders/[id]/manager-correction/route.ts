import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/dashboard-auth";
import { auditLog } from "@/lib/audit";
import { getWorkOrder, updateWorkOrder } from "@/lib/operations";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const correction = body?.correction || {};
    const note = typeof body?.note === "string" ? body.note.trim() : "";

    const current = await getWorkOrder(id);
    if (!current || current.company_id !== companyId) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const nextAiTriage = { ...((current.ai_triage as Record<string, unknown>) || {}) };
    const issue = { ...(((nextAiTriage.issue as Record<string, unknown>) || {})) };

    const changed: Record<string, unknown> = {};
    if (typeof correction.summary === "string" && correction.summary.trim()) {
      issue.symptomSummary = correction.summary.trim();
      changed.summary = correction.summary.trim();
    }
    if (typeof correction.category === "string" && correction.category.trim()) {
      issue.category = correction.category.trim();
      changed.category = correction.category.trim();
    }
    if (typeof correction.priority === "string" && correction.priority.trim()) {
      issue.priority = correction.priority.trim();
      nextAiTriage.priority = correction.priority.trim();
      changed.priority = correction.priority.trim();
    }
    if (typeof correction.rootCause === "string" && correction.rootCause.trim()) {
      issue.rootCauseHypothesis = correction.rootCause.trim();
      nextAiTriage.suspected_cause = correction.rootCause.trim();
      changed.rootCause = correction.rootCause.trim();
    }
    if (Array.isArray(correction.suggestedParts)) {
      const parts = correction.suggestedParts.map((part: unknown) => `${part || ""}`.trim()).filter(Boolean);
      issue.partsLikelyNeeded = parts;
      nextAiTriage.suggested_parts = parts;
      changed.suggestedParts = parts;
    }
    if (typeof correction.assigned_to === "string" && correction.assigned_to) {
      changed.assigned_to = correction.assigned_to;
    } else if (correction.assigned_to === null) {
      changed.assigned_to = null;
    }

    nextAiTriage.issue = issue;
    const existingCorrections = Array.isArray(nextAiTriage.manager_corrections)
      ? (nextAiTriage.manager_corrections as unknown[])
      : [];
    nextAiTriage.manager_corrections = [
      ...existingCorrections,
      {
        at: new Date().toISOString(),
        note: note || null,
        changed,
      },
    ];

    const patch: Record<string, unknown> = {
      ai_triage: nextAiTriage,
    };
    if (changed.priority) patch.priority = changed.priority;
    if (Object.prototype.hasOwnProperty.call(changed, "assigned_to")) {
      patch.assigned_to = changed.assigned_to;
      if (changed.assigned_to) {
        const { data: worker } = await supabase.from("workers").select("phone").eq("id", changed.assigned_to).single();
        patch.assigned_to_phone = worker?.phone || null;
        if (current.status === "open") patch.status = "assigned";
      } else {
        patch.assigned_to_phone = null;
      }
    }
    if (note) {
      const existing = current.resolution_notes?.trim() || "";
      const stamp = `[Manager correction ${new Date().toLocaleString()}] ${note}`;
      patch.resolution_notes = existing ? `${existing}\n\n${stamp}` : stamp;
    }

    const updated = await updateWorkOrder(id, patch as any);
    await auditLog({
      companyId,
      action: "work_order.manager_correction",
      entityType: "work_order",
      entityId: id,
      details: { changed, note },
    });

    return NextResponse.json({ workOrder: updated });
  } catch (error) {
    console.error("[api/operations/work-orders/:id/manager-correction][POST]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
