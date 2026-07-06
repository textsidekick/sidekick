import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDigestSMS, generateOperationsDigest } from "@/lib/operations-digest";
import { sendDigestEmail } from "@/lib/email";

import { verifyCronSecret } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { data: companies } = await supabase.from("companies").select("id, name, manager_phone").limit(100);
    const results: any[] = [];

    for (const company of companies || []) {
      try {
        const smsSent = await sendDigestSMS(company.id, 24);

        // Also send email digest if manager has a profile with email
        let emailSent = false;
        const { data: profile } = await supabase
          .from("manager_profiles")
          .select("email")
          .eq("company_id", company.id)
          .not("email", "is", null)
          .limit(1)
          .single();

        if (profile?.email) {
          const digest = await generateOperationsDigest(company.id, 24);
          const emailResult = await sendDigestEmail(profile.email, {
            companyName: company.name,
            period: "Last 24 hours",
            totalQuestions: digest.metrics.issuesCaught,
            uniqueWorkers: 0,
            totalWorkers: 0,
            avgConfidence: 0,
            topQuestions: digest.highlights,
          });
          emailSent = emailResult.sent;
        }

        results.push({ companyId: company.id, name: company.name, smsSent, emailSent });
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
