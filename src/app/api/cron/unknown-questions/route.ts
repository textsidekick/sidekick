export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { completeTextOpenAIFirst } from "@/lib/sms-ai";

const LOW_CONFIDENCE_PHRASES = [
  "don't have information",
  "do not have information",
  "couldn't find",
  "could not find",
  "no information",
  "check with your manager",
  "not sure",
  "don't know",
  "do not know",
  "unable to find",
  "not mentioned",
  "doesn't appear",
  "does not appear",
  "no details",
  "not specified",
  "consult the employee handbook",
  "consult your manager",
];

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

function isLowConfidenceAnswer(answer: string | null | undefined): boolean {
  const lower = (answer || "").toLowerCase();
  return LOW_CONFIDENCE_PHRASES.some((phrase) => lower.includes(phrase));
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-cron-secret");
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const authHeader = req.headers.get("authorization");
  const authOk = Boolean(
    process.env.CRON_SECRET &&
      (secret === process.env.CRON_SECRET || authHeader === `Bearer ${process.env.CRON_SECRET}`)
  );

  if (!authOk) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: companies } = await supabase.from("companies").select("id, name, manager_phone");

    if (!companies || companies.length === 0) {
      return NextResponse.json({ message: "No companies" });
    }

    let reportsSent = 0;
    const results: Array<Record<string, unknown>> = [];

    for (const company of companies) {
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("question, answer, confidence, manager_response, created_at")
        .eq("company_id", company.id)
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false })
        .limit(200);

      if (questionsError) {
        results.push({ companyId: company.id, name: company.name, error: questionsError.message });
        continue;
      }

      const unansweredQuestions = (questions || [])
        .filter((q: any) => {
          const confidence = Number(q.confidence || 0);
          return !q.manager_response && (confidence < 50 || isLowConfidenceAnswer(q.answer));
        })
        .map((q: any) => q.question)
        .filter(Boolean);

      if (unansweredQuestions.length < 2) {
        results.push({ companyId: company.id, name: company.name, skipped: true, unansweredCount: unansweredQuestions.length });
        continue;
      }

      let topics = "various topics";
      try {
        topics = await completeTextOpenAIFirst({
          openaiModel: process.env.OPENAI_SMS_MODEL || "gpt-4.1",
          maxTokens: 300,
          user: `These are questions workers asked that Sidekick couldn't confidently answer. Group them into 2-4 topic categories.\n\nQuestions:\n${unansweredQuestions.slice(0, 20).map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nReturn a short comma-separated list of topic names (e.g. \"safety procedures, equipment maintenance, HR policies\"). Keep it brief. Respond with ONLY the comma-separated topics.`,
        });
      } catch (error) {
        console.error("[unknown-questions][categorize]", error);
      }

      let managerPhone = company.manager_phone || null;
      if (!managerPhone) {
        const { data: manager } = await supabase
          .from("workers")
          .select("phone")
          .eq("company_id", company.id)
          .eq("role", "manager")
          .limit(1)
          .maybeSingle();
        managerPhone = manager?.phone || null;
      }

      if (!managerPhone) {
        results.push({ companyId: company.id, name: company.name, skipped: true, reason: "no_manager_phone", unansweredCount: unansweredQuestions.length });
        continue;
      }

      const message = `📊 Sidekick weekly report for ${company.name}: Your team asked ${unansweredQuestions.length} questions this week that Sidekick couldn't confidently answer. Topics: ${topics}. Upload docs about these at textsidekick.com, or reply to workers' open questions so Sidekick can learn.`.slice(0, 480);

      const sent = dryRun ? false : await sendSMS(managerPhone, message);
      if (sent) reportsSent++;

      results.push({
        companyId: company.id,
        name: company.name,
        sent,
        dryRun,
        wouldSend: unansweredQuestions.length >= 2,
        unansweredCount: unansweredQuestions.length,
        topics,
      });
    }

    return NextResponse.json({ dryRun, reportsSent, companiesChecked: companies.length, results });
  } catch (e: any) {
    console.error("[unknown-questions]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
