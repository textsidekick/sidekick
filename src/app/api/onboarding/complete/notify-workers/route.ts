import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId, workerPhones } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return NextResponse.json({ error: "SMS service not configured" }, { status: 503 });
    }

    // Get company info
    const { data: company } = await supabase
      .from("companies")
      .select("company_name, access_code")
      .eq("id", companyId)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get worker phones either from param or from DB
    let phones: string[] = workerPhones || [];
    if (phones.length === 0) {
      const { data: workers } = await supabase
        .from("workers")
        .select("phone")
        .eq("company_id", companyId);
      phones = (workers || []).map((w: any) => w.phone).filter(Boolean);
    }

    if (phones.length === 0) {
      return NextResponse.json({ error: "No workers to notify" }, { status: 400 });
    }

    const message = `${company.company_name} just set up Sidekick -- your AI work assistant. Have a question about work? Just text it here and get an instant answer. Try asking: "What's the PTO policy?" or "Where do I park?"`;

    let sent = 0;
    let failed = 0;

    for (const phone of phones) {
      try {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
            },
            body: new URLSearchParams({
              To: phone,
              From: TWILIO_PHONE_NUMBER,
              Body: message,
            }),
          }
        );
        if (res.ok) sent++;
        else failed++;
      } catch {
        failed++;
      }
      // Small delay to avoid Twilio rate limits
      await new Promise(r => setTimeout(r, 200));
    }

    return NextResponse.json({ success: true, sent, failed, total: phones.length });
  } catch (error) {
    console.error("[Notify Workers] Error:", error);
    return NextResponse.json({ error: "Failed to notify workers" }, { status: 500 });
  }
}
