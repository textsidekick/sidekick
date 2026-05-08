import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    // Find valid code
    const { data: verification, error: verifyError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verifyError || !verification) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    // Mark code as used
    await supabase.from("verification_codes").update({ used: true }).eq("id", verification.id);

    // Check if account exists
    let { data: account } = await supabase
      .from("manager_accounts")
      .select("*")
      .eq("phone", phone)
      .single();

    let isNewUser = false;

    // Auto-paid phone numbers (no trial limits, but only see their own data)
    const PAID_PHONES = ["+14088285979", "+12243348775"];
    const isPaidUser = PAID_PHONES.some(p => phone.endsWith(p.slice(-10)));

    if (!account) {
      // Create new account
      isNewUser = true;
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 7);

      const { data: newAccount, error: createError } = await supabase
        .from("manager_accounts")
        .insert({
          phone,
          trial_ends_at: trialEnds.toISOString(),
          questions_used: 0,
          questions_limit: 50,
          documents_limit: 3,
          plan: isPaidUser ? "paid" : "trial",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("[Auth] Account creation error:", createError);
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      }
      account = newAccount;
    }

    // Check trial status
    const trialExpired = account.plan === "trial" && new Date(account.trial_ends_at) < new Date();
    const questionsExhausted = account.plan === "trial" && account.questions_used >= account.questions_limit;

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from("manager_sessions").upsert({
      account_id: account.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      token,
      accountId: account.id,
      companyId: account.company_id || null,
      isNewUser,
      plan: account.plan,
      trialExpired,
      questionsExhausted,
      trialEndsAt: account.trial_ends_at,
      questionsUsed: account.questions_used,
      questionsLimit: account.questions_limit,
    });

    response.cookies.set("sidekick_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth] Verify code error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
