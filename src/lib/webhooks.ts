import { supabase } from "./supabase";
import crypto from "crypto";

export type WebhookEvent =
  | "work_order.created"
  | "work_order.completed"
  | "work_order.updated"
  | "asset.created"
  | "asset.updated"
  | "alert.critical";

export async function fireWebhooks(
  companyId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
) {
  const { data: hooks } = await supabase
    .from("webhooks")
    .select("*")
    .eq("company_id", companyId)
    .eq("active", true)
    .contains("events", [event]);

  if (!hooks || hooks.length === 0) return;

  await Promise.allSettled(
    hooks.map(async (hook: { id: string; url: string; secret?: string }) => {
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Sidekick-Event": event,
      };
      if (hook.secret) {
        const sig = crypto.createHmac("sha256", hook.secret).update(body).digest("hex");
        headers["X-Sidekick-Signature"] = `sha256=${sig}`;
      }
      let statusCode = 0;
      let success = false;
      try {
        const res = await fetch(hook.url, { method: "POST", headers, body, signal: AbortSignal.timeout(10000) });
        statusCode = res.status;
        success = res.ok;
      } catch {
        success = false;
      }
      await supabase.from("webhook_deliveries").insert({
        webhook_id: hook.id,
        event,
        payload: payload as Record<string, unknown>,
        status_code: statusCode,
        success,
      });
    })
  );
}
