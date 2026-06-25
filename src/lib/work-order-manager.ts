import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import type { TriageResult } from "@/lib/ai-triage";

// NOTE: operations types are being added elsewhere (src/types/operations.ts).
// Define minimal local interfaces for now; consolidate later.

export interface WorkOrder {
  id: string;
  company_id: string;
  asset_id?: string | null;
  asset_tag?: string | null;
  asset_name?: string | null;
  category?: string | null;
  priority?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  reported_by?: string | null;
  assigned_to?: string | null;
  created_at?: string;
}

export interface Worker {
  id: string;
  company_id: string;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  skills?: string[] | null;
  shift?: string | null;
  is_active?: boolean | null;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder",
});

export async function createWorkOrderFromTriage(
  triage: TriageResult,
  companyId: string,
  reportedBy: string
): Promise<WorkOrder> {
  if (triage.messageType !== "issue_report" || !triage.issue) {
    throw new Error("createWorkOrderFromTriage requires messageType=issue_report");
  }

  const title = triage.issue.symptomSummary?.slice(0, 120) || "Reported issue";
  const descriptionLines = [
    `Reported via SMS by: ${reportedBy}`,
    triage.issue.assetName ? `Asset: ${triage.issue.assetName}` : null,
    triage.issue.assetTag ? `Asset tag: ${triage.issue.assetTag}` : null,
    `Category: ${triage.issue.category}`,
    `Priority: ${triage.issue.priority} (${triage.issue.priorityReasoning})`,
    triage.issue.rootCauseHypothesis ? `Hypothesis: ${triage.issue.rootCauseHypothesis}` : null,
    triage.issue.suggestedActions?.length ? `Suggested actions: ${triage.issue.suggestedActions.join("; ")}` : null,
    triage.issue.partsLikelyNeeded?.length ? `Parts likely needed: ${triage.issue.partsLikelyNeeded.join(", ")}` : null,
    triage.issue.safetyWarnings?.length ? `Safety: ${triage.issue.safetyWarnings.join("; ")}` : null,
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      company_id: companyId,
      asset_id: triage.issue.assetId,
      asset_tag: triage.issue.assetTag,
      asset_name: triage.issue.assetName,
      category: triage.issue.category,
      priority: triage.issue.priority,
      title,
      description: descriptionLines.join("\n"),
      status: "open",
      reported_by: reportedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data as WorkOrder;
}

export async function assignWorkOrder(workOrderId: string, technicianId: string): Promise<void> {
  const { error } = await supabase
    .from("work_orders")
    .update({ assigned_to: technicianId, status: "assigned" })
    .eq("id", workOrderId);

  if (error) throw error;

  // NOTE: SMS notification should be done by the SMS route (it already has Twilio client).
  // This function intentionally just updates DB. Caller can fetch tech phone and notify.
}

export async function findBestTechnician(
  companyId: string,
  category: string,
  assetId?: string
): Promise<Worker | null> {
  void assetId;
  // Minimal heuristic: pick an active worker with matching skill in their skills array.
  // TODO: incorporate shift, workload (# assigned open WOs), proximity, role.

  const { data: workers, error } = await supabase
    .from("workers")
    .select("*")
    .eq("company_id", companyId)
    .eq("verified", true);

  if (error) throw error;
  if (!workers || workers.length === 0) return null;

  const desired = category.toLowerCase();

  // Try to find skill match
  const list = workers as unknown as Array<Record<string, unknown>>;
  const skillMatched = list.find((w) => {
    const skills = (Array.isArray(w.skills) ? w.skills : []) as unknown as string[];
    return skills.some((s) => s.toLowerCase().includes(desired));
  });

  return (skillMatched || list[0]) as unknown as Worker;
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: string,
  notes?: string
): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (notes) payload.completion_notes = notes;

  const { error } = await supabase.from("work_orders").update(payload).eq("id", workOrderId);
  if (error) throw error;
}

export async function generateTroubleshootingGuide(workOrderId: string): Promise<string> {
  // Pull WO + basic asset context; then ask Claude to generate a short guide.
  const { data: wo, error } = await supabase
    .from("work_orders")
    .select("id, title, description, asset_id, asset_name, asset_tag, category, priority")
    .eq("id", workOrderId)
    .single();

  if (error) throw error;

  const system = `You are a manufacturing maintenance assistant. Generate a concise, practical troubleshooting guide for a technician.
- Emphasize safety (PPE, LOTO, guarding).
- Provide step-by-step checks.
- Include likely tools and parts.
- Keep it under 1200 characters.
Return plain text (no markdown).`;

  const prompt = `Work order context:\n${JSON.stringify(wo, null, 2)}\n\nGenerate the guide.`;

  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 500,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content[0]?.type === "text" ? resp.content[0].text : "";
  return text.trim();
}

// ============================================
// Parts Inventory Auto-Adjustment
// ============================================

export async function handleWorkOrderCompletion(workOrderId: string): Promise<void> {
  const { data: wo } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", workOrderId)
    .single();

  if (!wo) return;

  const partsUsed = wo.parts_used;
  if (!partsUsed || !Array.isArray(partsUsed) || partsUsed.length === 0) return;

  // Get company's parts inventory
  const { data: inventory } = await supabase
    .from("parts_inventory")
    .select("*")
    .eq("company_id", wo.company_id);

  if (!inventory || inventory.length === 0) return;

  for (const partRef of partsUsed) {
    const partName = typeof partRef === "string" ? partRef : (partRef as any).name || (partRef as any).part_number || "";
    if (!partName) continue;

    // Fuzzy match: find inventory item whose name or part_number contains the reference (or vice versa)
    const match = inventory.find((inv: any) => {
      const invName = (inv.name || "").toLowerCase();
      const invPN = (inv.part_number || "").toLowerCase();
      const ref = partName.toLowerCase();
      return invName.includes(ref) || ref.includes(invName) || invPN.includes(ref) || ref.includes(invPN);
    });

    if (match) {
      const qty = typeof partRef === "object" && (partRef as any).quantity ? (partRef as any).quantity : 1;
      const newQty = Math.max(0, (match.quantity_on_hand || 0) - qty);

      await supabase
        .from("parts_inventory")
        .update({ quantity_on_hand: newQty, updated_at: new Date().toISOString() })
        .eq("id", match.id);

      if (newQty <= (match.reorder_point || 0)) {
        console.warn(`[REORDER] Part "${match.name}" (${match.part_number}) is at ${newQty} units — below reorder point of ${match.reorder_point}. Company: ${wo.company_id}`);
      }
    }
  }
}
