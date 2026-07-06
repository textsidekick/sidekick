import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'AC00000000000000000000000000000001',
  process.env.TWILIO_AUTH_TOKEN || "placeholder"
);

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { message, sendAt, sendToAll, locationId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Get workers for this company (optionally scoped by location)
    let workersQuery = supabase
      .from("workers")
      .select("phone, name")
      .eq("company_id", companyId);
    if (locationId && locationId !== "all") workersQuery = workersQuery.eq("location_id", locationId);
    const { data: workers } = await workersQuery;

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
          body: `NOTICE: ${message}`,
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
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: reminders } = await supabase
    .from("scheduled_reminders")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ reminders: reminders || [] });
}
