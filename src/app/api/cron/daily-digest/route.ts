import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDigestSMS } from "@/lib/operations-digest";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret") || request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { data: companies } = await supabase.from("companies").select("id, name").limit(100);
    const results: any[] = [];

    for (const company of companies || []) {
      try {
        const sent = await sendDigestSMS(company.id, 24);
        results.push({ companyId: company.id, name: company.name, sent });
      } catch (e: any) {
        results.push({ companyId: company.id, error: e.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[daily-digest]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
