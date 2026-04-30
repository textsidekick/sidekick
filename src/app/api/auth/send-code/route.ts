import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
    }

    // Normalize phone
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    const normalizedPhone = cleanPhone.startsWith("+") ? cleanPhone : "+1" + cleanPhone;

    // Rate limit: max 3 codes per hour per phone
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("verification_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", normalizedPhone)
      .gte("created_at", oneHourAgo);

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Store code
    await supabase.from("verification_codes").insert({
      phone: normalizedPhone,
      code,
      expires_at: expiresAt,
      used: false,
    });

    // Send via Twilio
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioAuth || !twilioPhone) {
      console.error("[Auth] Twilio not configured");
      return NextResponse.json({ error: "SMS service unavailable" }, { status: 503 });
    }

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64"),
        },
        body: new URLSearchParams({
          To: normalizedPhone,
          From: twilioPhone,
          Body: `Your Sidekick verification code is: ${code}. It expires in 10 minutes.`,
        }),
      }
    );

    if (!twilioRes.ok) {
      const err = await twilioRes.text();
      console.error("[Auth] Twilio error:", err);
      return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
    }

    return NextResponse.json({ success: true, phone: normalizedPhone });
  } catch (error) {
    console.error("[Auth] Send code error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
