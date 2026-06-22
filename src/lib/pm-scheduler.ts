import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import { supabase } from "@/lib/supabase";
import type { UUID } from "@/types/operations";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "AC00000000000000000000000000000000",
  process.env.TWILIO_AUTH_TOKEN || "placeholder"
);

async function sendSMS(to: string, body: string) {
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) throw new Error("TWILIO_PHONE_NUMBER env var is required");

  await twilioClient.messages.create({ from, to, body: body.slice(0, 1500) });
}

function computeNextDueAt(currentNextDueAtIso: string, frequencyType: string, frequencyValue: number): string {
  const base = new Date(currentNextDueAtIso);
  if (Number.isNaN(base.getTime())) return new Date().toISOString();

  if (frequencyType === "calendar") {
    const days = Number(frequencyValue);
    const d = new Date(base);
    d.setDate(d.getDate() + (Number.isFinite(days) ? days : 0));
    return d.toISOString();
  }

  // meter/condition: keep next_due_at unchanged for now
  return base.toISOString();
}

export async function checkAndSendDuePMs(): Promise<{ processed: number; errors: number }> {
  const nowIso = new Date().toISOString();

  const { data: schedules, error } = await supabase
    .from("pm_schedules")
    .select(
      `
      *,
      asset:assets ( id, name, location ),
      company:companies ( id, name, maintenance_phone )
    `.trim()
    )
    .eq("status", "active")
    .lte("next_due_at", nowIso)
    .order("next_due_at", { ascending: true });

  if (error) throw error;

  let processed = 0;
  let errors = 0;

  for (const s of (schedules || []) as any[]) {
    try {
      const assignedToId = (s as any).assigned_to as UUID | null;

      // Resolve recipient phone
      let recipientPhone: string | null = null;
      if (assignedToId) {
        const { data: tech } = await supabase
          .from("workers")
          .select("phone")
          .eq("id", assignedToId)
          .single();
        recipientPhone = (tech as any)?.phone || null;
      }

      if (!recipientPhone) {
        recipientPhone = (s as any).company?.maintenance_phone || null;
      }

      if (!recipientPhone) {
        throw new Error(`No recipient phone for PM schedule ${s.id}`);
      }

      const checklist: any[] = Array.isArray((s as any).checklist) ? (s as any).checklist : [];
      const checklistLines = checklist.length
        ? checklist
            .slice(0, 20)
            .map((step, i) => `${i + 1}. ${typeof step === "string" ? step : JSON.stringify(step)}`)
            .join("\n")
        : "(No checklist steps)";

      const assetName = (s as any).asset?.name || "(unknown asset)";
      const assetLoc = (s as any).asset?.location || null;

      const sms = `PM DUE: ${(s as any).title}\nAsset: ${assetName}${assetLoc ? ` @ ${assetLoc}` : ""}\n\nChecklist:\n${checklistLines}\n\nReply with results for each step, or text findings. Send photos of anything abnormal.`;

      // Create a work order linked to this PM schedule
      const { data: wo, error: woErr } = await supabase
        .from("work_orders")
        .insert({
          company_id: (s as any).company_id,
          asset_id: (s as any).asset_id,
          asset_name: assetName,
          category: "preventive",
          priority: "low",
          title: `PM: ${(s as any).title}`,
          description: `Generated from PM schedule ${s.id}`,
          status: "assigned",
          source: "pm_schedule",
          assigned_to: assignedToId,
        } as any)
        .select()
        .single();

      if (woErr) throw woErr;

      // Send SMS
      await sendSMS(recipientPhone, sms);

      // Bump next_due_at
      const nextDue = computeNextDueAt((s as any).next_due_at, (s as any).frequency_type, Number((s as any).frequency_value));
      await supabase
        .from("pm_schedules")
        .update({ next_due_at: nextDue } as any)
        .eq("id", (s as any).id);

      processed += 1;

      // NOTE: We intentionally don't create pm_completions here; that's done on response.
      void wo;
    } catch (e) {
      errors += 1;
      console.warn("[pm-scheduler] Failed processing due PM:", e);
    }
  }

  return { processed, errors };
}

function safeJsonParse(text: string): any | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function processPMResponse(workOrderId: string, message: string, photos?: string[]): Promise<{ ok: true; reply: string }> {
  // Load work order + related PM schedule (best-effort by searching description/source fields)
  const { data: wo, error: woErr } = await supabase.from("work_orders").select("*").eq("id", workOrderId).single();
  if (woErr) throw woErr;

  // Find schedule via parent_wo_id isn't implemented; try via ai_triage/source metadata later.
  const pmScheduleId: string | null = (wo as any)?.pm_schedule_id || null;

  // AI parse response
  const prompt = `Extract structured PM completion info from a technician response. Return STRICT JSON.

Fields:
- checklistResults: array of { stepNumber: number, result: "pass"|"fail"|"n/a"|"unknown", notes?: string }
- findings: array of { text: string, abnormal: boolean }

Technician message:
${message}`;

  const resp = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (resp.content || []).map((c: any) => (c.type === "text" ? c.text : "")).join("\n");
  const parsed = safeJsonParse(text) || {};

  const findingsArr: Array<{ text: string; abnormal: boolean }> = Array.isArray(parsed.findings) ? parsed.findings : [];
  const checklistResults = Array.isArray(parsed.checklistResults) ? parsed.checklistResults : [];

  // Insert completion (pm_schedule_id optional for now)
  await supabase.from("pm_completions").insert({
    pm_schedule_id: pmScheduleId,
    work_order_id: workOrderId,
    completed_by: (wo as any)?.assigned_to || null,
    checklist_results: checklistResults,
    findings: findingsArr.map((f) => f.text).join("\n"),
    photos: photos || [],
    completed_at: new Date().toISOString(),
  } as any);

  // Follow-up work orders for abnormal findings
  const abnormal = findingsArr.filter((f) => f.abnormal);
  for (const f of abnormal.slice(0, 5)) {
    await supabase.from("work_orders").insert({
      company_id: (wo as any).company_id,
      asset_id: (wo as any).asset_id,
      asset_name: (wo as any).asset_name,
      category: (wo as any).category || "other",
      priority: "medium",
      title: `Follow-up: ${(wo as any).title}`.slice(0, 120),
      description: `Follow-up from PM response on WO ${workOrderId}:\n${f.text}`,
      status: "open",
      source: "pm_schedule",
      parent_wo_id: workOrderId,
    } as any);
  }

  const reply = abnormal.length
    ? `Logged. I flagged ${abnormal.length} abnormal finding(s) and created follow-up work order(s).`
    : "Logged. Thanks — PM completion recorded.";

  return { ok: true, reply };
}
