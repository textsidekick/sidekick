export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function sendSMS(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio not configured");
  }
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

export async function POST(req: NextRequest) {
  try {
    const { companyId, phones } = await req.json();

    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ error: "phones array required" }, { status: 400 });
    }

    // Get company name
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();

    const companyName = company?.name || "your company";
    const smsNumber = TWILIO_PHONE_NUMBER || "+1 888 707 4659";

    let sent = 0;
    let failed = 0;

    for (const phone of phones.slice(0, 50)) { // Cap at 50
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      const normalizedPhone = cleanPhone.startsWith("+") ? cleanPhone : "+1" + cleanPhone;

      const message = `Hey! Your manager at ${companyName} just set up Sidekick — a text assistant for your team. Text any work question to this number and get an instant answer. Try it now — ask about any procedure, safety rule, or equipment info!`;

      try {
        const ok = await sendSMS(normalizedPhone, message);
        if (ok) sent++;
        else failed++;
      } catch {
        failed++;
      }

      // Small delay between sends
      await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({ sent, failed, total: phones.length });
  } catch (e: any) {
    console.error("[bulk-invite]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
