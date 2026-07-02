export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get("secret") ||
    req.headers.get("x-cron-secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Week = Monday–Sunday. Get last completed week.
    const dayOfWeek = now.getUTCDay(); // 0=Sun
    const daysBack = dayOfWeek === 0 ? 7 : dayOfWeek;
    const weekEnd = new Date(now);
    weekEnd.setUTCDate(now.getUTCDate() - daysBack); // last Sunday
    weekEnd.setUTCHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setUTCDate(weekEnd.getUTCDate() - 6); // Monday of that week
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekStartStr = weekStart.toISOString().slice(0, 10);

    // Previous week for trend comparison
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setUTCDate(prevWeekEnd.getUTCDate() - 1);
    prevWeekEnd.setUTCHours(23, 59, 59, 999);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setUTCDate(prevWeekEnd.getUTCDate() - 6);
    prevWeekStart.setUTCHours(0, 0, 0, 0);

    // Get companies with at least 1 week of activity
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, created_at")
      .lte("created_at", oneWeekAgo.toISOString());

    if (!companies?.length) {
      return NextResponse.json({ message: "No eligible companies", sent: 0 });
    }

    const results: Array<{ companyId: string; status: string; roi?: number }> = [];

    for (const company of companies) {
      // Check if already sent for this week
      const { data: existing } = await supabase
        .from("roi_emails_sent")
        .select("id")
        .eq("company_id", company.id)
        .eq("week_start", weekStartStr)
        .limit(1);

      if (existing && existing.length > 0) {
        results.push({ companyId: company.id, status: "already_sent" });
        continue;
      }

      // Get manager with email
      const { data: managers } = await supabase
        .from("workers")
        .select("id, name, phone, email")
        .eq("company_id", company.id)
        .eq("role", "manager");

      // Try company-level email as fallback
      const { data: companyData } = await supabase
        .from("companies")
        .select("manager_email, email")
        .eq("id", company.id)
        .single();

      const managerEmail =
        managers?.[0]?.email ||
        companyData?.manager_email ||
        companyData?.email;

      if (!managerEmail) {
        results.push({ companyId: company.id, status: "no_email" });
        continue;
      }

      const managerName = managers?.[0]?.name || "there";

      // This week's questions
      const { count: thisWeekCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString());

      // Previous week's questions (for trend)
      const { count: prevWeekCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .gte("created_at", prevWeekStart.toISOString())
        .lte("created_at", prevWeekEnd.toISOString());

      // Knowledge articles added this week (learn mode)
      const { count: newKnowledge } = await supabase
        .from("knowledge_articles")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString());

      const questionsAnswered = thisWeekCount || 0;
      const prevQuestions = prevWeekCount || 0;
      const learnedCount = newKnowledge || 0;

      if (questionsAnswered === 0) {
        results.push({ companyId: company.id, status: "no_activity" });
        continue;
      }

      // ROI calculations
      const timeSavedMinutes = questionsAnswered * 3;
      const timeSavedHours = timeSavedMinutes / 60;
      const roiValue = Math.round(timeSavedHours * 50);

      // Trend
      let trendText = "";
      if (prevQuestions > 0) {
        const pctChange = Math.round(
          ((questionsAnswered - prevQuestions) / prevQuestions) * 100
        );
        if (pctChange > 0) trendText = `↑ ${pctChange}% vs last week`;
        else if (pctChange < 0)
          trendText = `↓ ${Math.abs(pctChange)}% vs last week`;
        else trendText = "Same as last week";
      } else {
        trendText = "First full week tracked!";
      }

      // Build email HTML
      const html = buildEmailHtml({
        managerName,
        companyName: company.name,
        questionsAnswered,
        timeSavedHours: Number(timeSavedHours.toFixed(1)),
        roiValue,
        trendText,
        learnedCount,
      });

      const subject = `💰 Your Sidekick ROI This Week: $${roiValue} in Saved Time`;

      // Send via Resend
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        results.push({ companyId: company.id, status: "no_resend_key" });
        continue;
      }

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Sidekick <updates@textsidekick.com>",
          to: managerEmail,
          subject,
          html,
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        console.error(`[weekly-roi] Resend error for ${company.id}:`, err);
        results.push({ companyId: company.id, status: "email_failed" });
        continue;
      }

      // Record in roi_emails_sent
      await supabase.from("roi_emails_sent").insert({
        company_id: company.id,
        week_start: weekStartStr,
        roi_value: roiValue,
        questions_count: questionsAnswered,
      });

      // Audit log
      await auditLog({
        companyId: company.id,
        action: "roi_email_sent",
        entityType: "roi_email",
        details: {
          week_start: weekStartStr,
          roi_value: roiValue,
          questions_count: questionsAnswered,
          recipient: managerEmail,
        },
      });

      results.push({ companyId: company.id, status: "sent", roi: roiValue });
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    return NextResponse.json({ success: true, sent: sentCount, results });
  } catch (error: any) {
    console.error("[weekly-roi]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildEmailHtml(data: {
  managerName: string;
  companyName: string;
  questionsAnswered: number;
  timeSavedHours: number;
  roiValue: number;
  trendText: string;
  learnedCount: number;
}): string {
  const knowledgeSection =
    data.learnedCount > 0
      ? `<h3 style="margin-top:24px;">🧠 Knowledge Growing</h3>
         <p>Your team taught Sidekick <strong>${data.learnedCount} new answer${data.learnedCount === 1 ? "" : "s"}</strong> this week through learn mode.</p>`
      : "";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
      <p>Hi ${data.managerName},</p>
      <p>Here's what Sidekick delivered for <strong>${data.companyName}</strong> this week:</p>

      <h3>📊 Stats</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Questions answered:</strong> ${data.questionsAnswered}</li>
        <li><strong>Time saved:</strong> ${data.timeSavedHours} hours</li>
        <li><strong>Estimated value:</strong> $${data.roiValue} <span style="color:#666;">(at $50/hr supervisor cost)</span></li>
        <li><strong>Questions trending:</strong> ${data.trendText}</li>
      </ul>

      ${knowledgeSection}

      <p style="margin-top:24px;">Keep your team engaged — the more they ask, the smarter Sidekick gets.</p>
      <p style="color:#666;">Questions? Reply to this email.</p>

      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
      <p style="color:#999; font-size:13px;">— Sidekick (<a href="https://textsidekick.com" style="color:#999;">textsidekick.com</a>)</p>
    </div>
  `;
}
