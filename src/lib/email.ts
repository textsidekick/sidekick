import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDigestEmail(to: string, digest: {
  companyName?: string;
  period: string;
  totalQuestions: number;
  uniqueWorkers: number;
  totalWorkers: number;
  avgConfidence: number;
  topQuestions: string[];
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set, skipping email");
    return { sent: false, reason: "no_api_key" };
  }

  const topQuestionsHtml = digest.topQuestions.length > 0
    ? `<ul>${digest.topQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join("")}</ul>`
    : "<p>No questions this period.</p>";

  const { data, error } = await resend.emails.send({
    from: "Sidekick <digest@textsidekick.com>",
    to,
    subject: `${digest.companyName || "Your"} Sidekick Weekly Digest — ${digest.totalQuestions} questions`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1A16;">
        <div style="background: #C96442; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Sidekick Weekly Digest</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">${digest.period}</p>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="display: flex; gap: 16px; margin-bottom: 24px;">
            <div style="flex: 1; background: #F7F3EC; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #C96442;">${digest.totalQuestions}</div>
              <div style="font-size: 12px; color: #666;">Questions</div>
            </div>
            <div style="flex: 1; background: #F7F3EC; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #C96442;">${digest.uniqueWorkers}</div>
              <div style="font-size: 12px; color: #666;">Active Workers</div>
            </div>
            <div style="flex: 1; background: #F7F3EC; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #C96442;">${digest.avgConfidence}%</div>
              <div style="font-size: 12px; color: #666;">Avg Confidence</div>
            </div>
          </div>
          <h3 style="font-size: 14px; margin: 0 0 8px; color: #666;">Top Questions</h3>
          ${topQuestionsHtml}
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://textsidekick.com/today" style="display: inline-block; background: #1C1A16; color: #F7F3EC; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard →</a>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    return { sent: false, reason: error.message };
  }

  return { sent: true, id: data?.id };
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
