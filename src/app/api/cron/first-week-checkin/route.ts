export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function sendSMS(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) return false;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      },
      body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body }),
    }
  );
  return res.ok;
}

import { verifyCronSecret } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get companies created in the last 7 days
    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, created_at")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (!companies || companies.length === 0) {
      return NextResponse.json({ message: "No new companies to check in on" });
    }

    let checkInsSent = 0;

    for (const company of companies) {
      const createdAt = new Date(company.created_at);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));

      // Determine which check-in to send
      let message = "";
      let checkinType = "";

      if (daysSinceCreation === 1) {
        checkinType = "day1";
        message = `Hey! Your team at ${company.name} is set up on Sidekick. Remind your workers to text ${TWILIO_PHONE_NUMBER} with any work questions — procedures, safety, equipment info. The more they use it, the smarter it gets!`;
      } else if (daysSinceCreation === 3) {
        checkinType = "day3";
        // Count questions
        const { count: questionCount } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("company_id", company.id);

        const { count: issueCount } = await supabase
          .from("issues")
          .select("*", { count: "exact", head: true })
          .eq("company_id", company.id)
          .gte("created_at", createdAt.toISOString());

        message = `Sidekick update for ${company.name}: Your team has asked ${questionCount || 0} questions so far. ${
          (questionCount || 0) < 5
            ? "Tip: Encourage your team to text questions they'd normally ask a coworker — that's where Sidekick shines."
            : "Great engagement! Upload more documents at textsidekick.com to make answers even better."
        }`;
      } else if (daysSinceCreation === 7) {
        checkinType = "day7";
        const { count: questionCount } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("company_id", company.id);

        message = `One week with Sidekick! 🎉 ${company.name} stats: ${questionCount || 0} questions answered. Every answer Sidekick gives saves your team from interrupting a supervisor. Keep it going — upload more SOPs and procedures at textsidekick.com to expand what Sidekick knows.`;
      } else {
        continue;
      }

      // Check if this check-in was already sent
      const { data: existing } = await supabase
        .from("audit_log")
        .select("id")
        .eq("company_id", company.id)
        .eq("action", `checkin_${checkinType}`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Get manager phone
      const { data: manager } = await supabase
        .from("workers")
        .select("phone")
        .eq("company_id", company.id)
        .eq("role", "manager")
        .limit(1)
        .single();

      if (manager?.phone) {
        const sent = await sendSMS(manager.phone, message);
        if (sent) {
          await supabase.from("audit_log").insert({
            company_id: company.id,
            action: `checkin_${checkinType}`,
            entity_type: "company",
            details: { message },
          });
          checkInsSent++;
        }
      }
    }

    return NextResponse.json({ checkInsSent, companiesChecked: companies.length });
  } catch (e: any) {
    console.error("[first-week-checkin]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
