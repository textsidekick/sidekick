export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get active companies
    const { data: companies } = await supabase.from("companies").select("id, name");
    if (!companies || companies.length === 0) {
      return NextResponse.json({ message: "No companies" });
    }

    let reportsSent = 0;

    for (const company of companies) {
      // Find unanswered questions (issues where AI couldn't help)
      const { data: unknowns } = await supabase
        .from("issues")
        .select("description, created_at")
        .eq("company_id", company.id)
        .gte("created_at", weekAgo)
        .ilike("description", "%don%t have information%")
        .limit(50);

      // Also check conversations for "I don't have information" responses
      const { data: convUnknowns } = await supabase
        .from("conversations")
        .select("question, created_at")
        .eq("company_id", company.id)
        .gte("created_at", weekAgo)
        .limit(200);

      // Filter conversations where AI couldn't answer (check response field if available)
      const unansweredQuestions: string[] = [];
      if (unknowns) {
        for (const u of unknowns) {
          if (u.description) unansweredQuestions.push(u.description);
        }
      }

      if (unansweredQuestions.length < 2) continue; // Not enough to report

      // Use Claude to categorize the unanswered questions
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `These are questions workers asked that Sidekick couldn't answer. Group them into 2-4 topic categories.

Questions:
${unansweredQuestions.slice(0, 20).map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return a short comma-separated list of topic names (e.g. "safety procedures, equipment maintenance, HR policies"). Keep it brief.
Respond with ONLY the comma-separated topics.`,
          },
        ],
      });

      const topics = response.content[0].type === "text" ? response.content[0].text.trim() : "various topics";

      // Get manager phone
      const { data: manager } = await supabase
        .from("workers")
        .select("phone")
        .eq("company_id", company.id)
        .eq("role", "manager")
        .limit(1)
        .single();

      if (manager?.phone) {
        const message = `📊 Sidekick weekly report for ${company.name}: Your team asked ${unansweredQuestions.length} questions this week that Sidekick couldn't answer. Topics: ${topics}. Upload docs about these at textsidekick.com, or reply to this text with answers and Sidekick will remember them!`;

        const sent = await sendSMS(manager.phone, message);
        if (sent) reportsSent++;
      }
    }

    return NextResponse.json({ reportsSent, companiesChecked: companies.length });
  } catch (e: any) {
    console.error("[unknown-questions]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
