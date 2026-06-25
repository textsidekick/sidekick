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

function chunkForSms(text: string, max = 1400): string[] {
  const t = (text || "").trim();
  if (t.length <= max) return [t];
  const chunks: string[] = [];
  let i = 0;
  while (i < t.length) {
    chunks.push(t.slice(i, i + max));
    i += max;
  }
  return chunks;
}

export async function generateShiftHandoff(companyId: string, shiftName: string, outgoingSupervisor: string): Promise<{ id: UUID; summary: string }> {
  const shiftHours = Number(process.env.SHIFT_WINDOW_HOURS || 12);
  const since = new Date(Date.now() - shiftHours * 60 * 60 * 1000).toISOString();

  const { data: workOrders, error: woErr } = await supabase
    .from("work_orders")
    .select("id, short_id, title, status, priority, category, assigned_to, created_at, completed_at")
    .eq("company_id", companyId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (woErr) throw woErr;

  const { data: openWorkOrders, error: openErr } = await supabase
    .from("work_orders")
    .select("id, short_id, title, status, priority, category, assigned_to, created_at")
    .eq("company_id", companyId)
    .in("status", ["open", "assigned", "in_progress", "on_hold"])
    .order("priority", { ascending: false })
    .limit(50);

  if (openErr) throw openErr;

  const { data: pmCompletions, error: pmErr } = await supabase
    .from("pm_completions")
    .select("id, pm_schedule_id, work_order_id, findings, completed_at")
    .eq("company_id", companyId)
    .gte("completed_at", since)
    .order("completed_at", { ascending: false });

  // pm_completions may not have company_id in schema; ignore failures.
  const pmRows = pmErr ? [] : pmCompletions || [];

  const prompt = `Write a concise shift handoff summary for incoming leadership. Use natural language, bullet-ish formatting.

Context:
- Company ID: ${companyId}
- Shift: ${shiftName}
- Outgoing supervisor: ${outgoingSupervisor}
- Time window since: ${since}

Work orders during shift (new/updated):
${JSON.stringify(workOrders || [], null, 2)}

Ongoing/unresolved work orders:
${JSON.stringify(openWorkOrders || [], null, 2)}

PM completions during shift:
${JSON.stringify(pmRows || [], null, 2)}

Include:
- Work orders completed (count + highlights)
- Work orders still in progress (with status)
- New issues reported
- PMs completed (any findings?)
- Safety incidents (if any mentioned)
- Open items for next shift

Return plain text only.`;

  const resp = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    max_tokens: 900,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = (resp.content || []).map((c: any) => (c.type === "text" ? c.text : "")).join("\n").trim();

  const workOrdersSummary = {
    since,
    workOrdersCount: (workOrders || []).length,
    openCount: (openWorkOrders || []).length,
    pmCompletionsCount: (pmRows || []).length,
  };

  const { data: handoff, error: insertErr } = await supabase
    .from("shift_handoffs")
    .insert({
      company_id: companyId,
      shift_name: shiftName,
      outgoing_supervisor: outgoingSupervisor,
      auto_summary: summary,
      manual_notes: null,
      work_orders_summary: workOrdersSummary,
      acknowledged_at: null,
    } as any)
    .select("id")
    .single();

  if (insertErr) throw insertErr;

  return { id: (handoff as any).id as UUID, summary };
}

export async function sendShiftHandoff(handoffId: string, incomingSupervisorPhone: string): Promise<void> {
  const { data: handoff, error } = await supabase
    .from("shift_handoffs")
    .select("id, auto_summary")
    .eq("id", handoffId)
    .single();

  if (error) throw error;

  const summary = (handoff as any)?.auto_summary || "";
  if (!summary) {
    await sendSMS(incomingSupervisorPhone, "Shift handoff ready, but summary was empty.");
    return;
  }

  // If long, either chunk or send short prompt.
  if (summary.length > 1400) {
    const chunks = chunkForSms(summary, 1300);
    // First message indicates multipart
    await sendSMS(incomingSupervisorPhone, `SHIFT HANDOFF (1/${chunks.length})\n${chunks[0]}`);
    for (let i = 1; i < chunks.length; i++) {
      await sendSMS(incomingSupervisorPhone, `SHIFT HANDOFF (${i + 1}/${chunks.length})\n${chunks[i]}`);
    }
    return;
  }

  await sendSMS(incomingSupervisorPhone, `SHIFT HANDOFF\n${summary}`);
}
