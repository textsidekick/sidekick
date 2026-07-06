/**
 * Lightweight error alerting for critical production failures.
 * Sends alerts via Resend email. Add ALERT_EMAIL to env to enable.
 */

const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 min between same-type alerts
const recentAlerts = new Map<string, number>();

export async function alertError(context: string, error: unknown, extra?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const key = `${context}:${message.slice(0, 50)}`;

  // Cooldown: don't spam the same error
  const last = recentAlerts.get(key);
  if (last && Date.now() - last < ALERT_COOLDOWN_MS) return;
  recentAlerts.set(key, Date.now());

  // Clean old entries
  if (recentAlerts.size > 100) {
    const cutoff = Date.now() - ALERT_COOLDOWN_MS;
    for (const [k, v] of recentAlerts) {
      if (v < cutoff) recentAlerts.delete(k);
    }
  }

  console.error(`[ALERT] ${context}: ${message}`, extra || "");

  const resendKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.ALERT_EMAIL || "hello@textsidekick.com";

  if (!resendKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Sidekick Alerts <alerts@textsidekick.com>",
        to: [alertEmail],
        subject: `⚠️ [Sidekick] ${context}`,
        html: `
          <div style="font-family: monospace; padding: 16px;">
            <h3 style="color: #C96442;">⚠️ ${context}</h3>
            <p><strong>Error:</strong> ${escapeHtml(message)}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            ${extra ? `<pre>${escapeHtml(JSON.stringify(extra, null, 2))}</pre>` : ""}
            <p style="color: #999; font-size: 12px;">This alert has a 5-minute cooldown per error type.</p>
          </div>
        `,
      }),
    });
  } catch (e) {
    console.error("[ALERT] Failed to send alert email:", e);
  }
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
