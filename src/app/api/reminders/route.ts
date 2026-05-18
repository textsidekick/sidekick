import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "placeholder",
  process.env.TWILIO_AUTH_TOKEN || "placeholder"
);

export async function POST(request: NextRequest) {
  try {
    const { companyId, message, sendAt, sendToAll } = await request.json();

    if (!companyId || !message) {
      return NextResponse.json({ error: "Company ID and message required" }, { status: 400 });
    }

    // Get workers for this company
    const { data: workers } = await supabase
      .from("workers")
      .select("phone, name")
      .eq("company_id", companyId);

    if (!workers || workers.length === 0) {
      return NextResponse.json({ error: "No workers found" }, { status: 400 });
    }

    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (sendAt) {
      // Schedule for later - store in database
      await supabase.from("scheduled_reminders").insert({
        company_id: companyId,
        message,
        send_at: sendAt,
        status: "scheduled",
        worker_count: workers.length,
      });
      return NextResponse.json({ success: true, scheduled: true, workerCount: workers.length, sendAt });
    }

    // Send immediately
    let sent = 0;
    for (const worker of workers) {
      try {
        await twilioClient.messages.create({
          body: `📢 ${message}`,
          from: twilioPhone,
          to: worker.phone,
        });
        sent++;
      } catch {}
    }

    return NextResponse.json({ success: true, sent, total: workers.length });
  } catch (error) {
    console.error("[Reminders] Error:", error);
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  
  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  const { data: reminders } = await supabase
    .from("scheduled_reminders")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ reminders: reminders || [] });
}
