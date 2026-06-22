import Anthropic from "@anthropic-ai/sdk";

// NOTE: operations types are being added elsewhere (src/types/operations.ts).
// For now we define minimal shapes locally and should consolidate later.

export interface ImageAnalysis {
  description: string;
  searchQueries: string[];
  isSafetyRelated: boolean;
  identifiedItems: string[];
}

export interface Asset {
  id: string;
  name: string | null;
  asset_tag?: string | null;
  tag?: string | null;
}

export interface WorkOrder {
  id: string;
  status?: string | null;
  assigned_to?: string | null;
  assigned_to_phone?: string | null;
  technician_id?: string | null;
  worker_phone?: string | null;
  created_at?: string;
}

export type TriageResult = {
  messageType:
    | "issue_report"
    | "question"
    | "status_update"
    | "pm_result"
    | "work_order_update"
    | "checklist_response"
    | "general";

  issue?: {
    assetName: string | null;
    assetTag: string | null;
    assetId: string | null;

    category:
      | "mechanical"
      | "electrical"
      | "plumbing"
      | "hydraulic"
      | "pneumatic"
      | "safety"
      | "quality"
      | "environmental"
      | "other";
    priority: "critical" | "high" | "medium" | "low";
    priorityReasoning: string;

    symptomSummary: string;
    rootCauseHypothesis: string;
    suggestedActions: string[];
    partsLikelyNeeded: string[];
    estimatedRepairMinutes: number | null;
    safetyWarnings: string[];

    similarPastIssues: number;
    isRecurring: boolean;
  };

  workOrderUpdate?: {
    action: "start" | "complete" | "pause" | "resume" | "add_note";
    workOrderId: string | null;
    completionNotes: string | null;
    secondaryIssues: string[];
    partsUsed: string[];
  };

  workerResponse: string;

  escalate: boolean;
  escalationReason: string | null;

  confidence: number;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder",
});

function safeJsonParse(text: string): unknown | null {
  try {
    // If model returns any extra text, grab the first JSON object.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function clamp01(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return 0.4;
  return Math.max(0, Math.min(1, x));
}

function ensureSmsLength(s: string, max = 480): string {
  if (!s) return "";
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + "…";
}

function normalizeAssetTag(a: Asset): string | null {
  return (a.asset_tag || a.tag || null)?.toString() || null;
}

function matchAsset(
  triagedAssetName: string | null,
  existingAssets?: Asset[]
): { assetId: string | null; assetTag: string | null; assetName: string | null } {
  if (!existingAssets || existingAssets.length === 0) {
    return { assetId: null, assetTag: null, assetName: triagedAssetName };
  }

  const needle = (triagedAssetName || "").trim().toLowerCase();
  if (!needle) return { assetId: null, assetTag: null, assetName: null };

  // Very lightweight matching to avoid extra LLM calls.
  let best: { a: Asset; score: number } | null = null;

  for (const a of existingAssets) {
    const name = (a.name || "").toLowerCase();
    const tag = (normalizeAssetTag(a) || "").toLowerCase();

    let score = 0;
    if (name === needle || tag === needle) score += 10;
    if (name.includes(needle) || needle.includes(name)) score += 6;
    if (tag && (tag.includes(needle) || needle.includes(tag))) score += 6;

    // token overlap
    const tokens = new Set(needle.split(/\s+/).filter(Boolean));
    const nameTokens = new Set(name.split(/\s+/).filter(Boolean));
    let overlap = 0;
    for (const t of tokens) if (nameTokens.has(t)) overlap++;
    score += overlap;

    if (!best || score > best.score) best = { a, score };
  }

  if (!best || best.score < 4) {
    return { assetId: null, assetTag: null, assetName: triagedAssetName };
  }

  return {
    assetId: best.a.id,
    assetTag: normalizeAssetTag(best.a),
    assetName: best.a.name || triagedAssetName,
  };
}

export async function triageIncomingMessage(params: {
  message: string;
  workerPhone: string;
  companyId: string;
  imageAnalysis?: ImageAnalysis;
  existingAssets?: Asset[];
  activeWorkOrders?: WorkOrder[];
}): Promise<TriageResult> {
  const { message, workerPhone, companyId, imageAnalysis, existingAssets, activeWorkOrders } = params;

  const assetsForPrompt = (existingAssets || []).slice(0, 80).map((a) => ({
    id: a.id,
    name: a.name,
    assetTag: normalizeAssetTag(a),
  }));

  const workOrdersForPrompt = (activeWorkOrders || []).slice(0, 20).map((wo) => ({
    id: wo.id,
    status: wo.status,
    assignedTo: wo.technician_id || wo.assigned_to || null,
    assignedToPhone: wo.assigned_to_phone || null,
    workerPhone: wo.worker_phone || null,
    createdAt: wo.created_at || null,
  }));

  const system = `You are Sidekick, an AI triage dispatcher for a manufacturing plant. You receive SMS/MMS messages from workers.

GOALS (in order):
1) Classify the messageType.
2) If issue_report: produce a full issue triage that can directly create a work order.
3) If work_order_update: parse the action and associate to a work order if referenced; if none referenced, set workOrderId=null but still infer action.
4) Produce a short SMS-friendly workerResponse (<=480 characters), in the SAME LANGUAGE as the worker.

CONSTRAINTS:
- Return ONLY valid JSON matching the required schema.
- confidence must be 0..1.
- workerResponse must be <=480 chars.
- If the message implies immediate danger (smoke, fire, injury, sparking, gas leak, chemical spill, energized electrical exposure), set priority=critical, escalate=true, include safetyWarnings.
- If message is just "start"/"started"/"on it" => work_order_update action=start.
- If message is "done"/"fixed"/"completed" => work_order_update action=complete.
- If uncertain between issue_report and question, prefer issue_report when there is a problem symptom.

MANUFACTURING CONTEXT:
- Understand common equipment/failure modes: motors, conveyors, pumps, compressors, CNC, presses, hydraulics, pneumatics, sensors, PLCs.
- Provide actionable troubleshooting steps (safe, practical) and likely parts.
- Always include LOTO/guarding warnings when rotating machinery or electrical panels are involved.

ASSET MATCHING:
- Use the provided asset list when possible. If you can map to an asset, set assetId and assetTag.
- If you cannot confidently match, leave assetId and assetTag as null and set assetName to what the worker said.

WORK ORDER CONTEXT:
- If the worker mentions a work order id like "WO123" or "#123" capture it.
- If no id, but message is a work_order_update and there is a recent active WO for this workerPhone, choose the most recent one (you can infer from provided context). Otherwise null.

OUTPUT JSON SCHEMA:
{
  "messageType": "issue_report"|"question"|"status_update"|"pm_result"|"work_order_update"|"checklist_response"|"general",
  "issue": { ... } (only when messageType=="issue_report"),
  "workOrderUpdate": { ... } (only when messageType=="work_order_update"),
  "workerResponse": string,
  "escalate": boolean,
  "escalationReason": string|null,
  "confidence": number
}`;

  const userPayload = {
    companyId,
    workerPhone,
    message,
    imageAnalysis: imageAnalysis || null,
    assets: assetsForPrompt,
    activeWorkOrders: workOrdersForPrompt,
  };

  let modelText = "";

  try {
    const resp = await anthropic.messages.create({
      // Use Haiku for speed; fallback would be handled by caller if needed.
      model: "claude-3-5-haiku-latest",
      max_tokens: 900,
      system,
      messages: [{ role: "user", content: JSON.stringify(userPayload) }],
    });

    modelText = resp.content[0]?.type === "text" ? resp.content[0].text : "";
  } catch {
    // Conservative fallback that won't break the SMS flow.
    return {
      messageType: "general",
      workerResponse: ensureSmsLength(
        "Got it. I couldn't auto-triage that message right now. Please share the equipment name/number and what's happening, or contact your supervisor if urgent."
      ),
      escalate: false,
      escalationReason: null,
      confidence: 0.2,
    };
  }

  const parsed = safeJsonParse(modelText) as Partial<TriageResult> | null;
  if (!parsed || typeof parsed !== "object") {
    return {
      messageType: "general",
      workerResponse: ensureSmsLength(
        "Got it. I couldn't read that clearly. Can you re-send with the machine name/number and the problem (noise/leak/error code), plus a photo if possible?"
      ),
      escalate: false,
      escalationReason: null,
      confidence: 0.25,
    };
  }

  // Basic normalization + asset matching post-process (no extra model call)
  const result: TriageResult = {
    messageType: parsed.messageType,
    issue: parsed.issue,
    workOrderUpdate: parsed.workOrderUpdate,
    workerResponse: ensureSmsLength(parsed.workerResponse || ""),
    escalate: Boolean(parsed.escalate),
    escalationReason: parsed.escalationReason ?? null,
    confidence: clamp01(parsed.confidence),
  };

  if (result.messageType === "issue_report" && result.issue) {
    const matched = matchAsset(result.issue.assetName, existingAssets);
    result.issue.assetId = matched.assetId;
    result.issue.assetTag = matched.assetTag;
    result.issue.assetName = matched.assetName;

    // Default historical fields if omitted
    result.issue.similarPastIssues = Number.isFinite(result.issue.similarPastIssues)
      ? result.issue.similarPastIssues
      : 0;
    result.issue.isRecurring = Boolean(result.issue.isRecurring);
  }

  if (result.messageType === "work_order_update" && result.workOrderUpdate) {
    // If model didn't pick workOrderId, try to map to most recent active WO for this worker.
    if (!result.workOrderUpdate.workOrderId && activeWorkOrders && activeWorkOrders.length > 0) {
      const recent = [...activeWorkOrders]
        .filter((wo) => (wo.worker_phone || "") === workerPhone)
        .sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()))[0];
      if (recent) result.workOrderUpdate.workOrderId = recent.id;
    }
  }

  return result;
}
