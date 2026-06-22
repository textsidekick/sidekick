import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    // Bypass phones — skip ALL verification, create session directly
    const BYPASS_PHONES = ["+14088285979", "+14083049470"];
    const isBypass = BYPASS_PHONES.some(p => phone.endsWith(p.slice(-10)));

    if (isBypass) {
      // Map bypass phones to their manager_users accounts
      const usernameMap: Record<string, string> = {
        "4088285979": "justin",
        "4083049470": "azhan",
      };
      const last10 = phone.slice(-10);
      const username = usernameMap[last10] || "justin";

      // Get their manager_users account
      const { data: user } = await supabase
        .from("manager_users")
        .select("id, company_id, username")
        .eq("username", username)
        .single();

      const companyId = user?.company_id || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      const accountId = user?.id || crypto.randomUUID();

      // Generate session token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase.from("manager_sessions").upsert({
        user_id: accountId,
        company_id: companyId,
        token,
        expires_at: expiresAt.toISOString(),
      });

      const response = NextResponse.json({
        success: true,
        token,
        accountId,
        companyId,
        username: username,
        isNewUser: false,
        plan: "paid",
        trialExpired: false,
        questionsExhausted: false,
      });

      response.cookies.set("sidekick_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // Normal flow: verify code
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

    await supabase.from("verification_codes").update({ used: true }).eq("id", verification.id);

    // Check if account exists in manager_users
    let { data: account } = await supabase
      .from("manager_users")
      .select("*")
      .eq("username", phone)
      .single();

    if (!account) {
      // Try to find by checking if we have a company for this phone
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("manager_phone", phone)
        .single();

      if (company) {
        const { data: newUser } = await supabase
          .from("manager_users")
          .insert({
            company_id: company.id,
            username: phone,
            password_hash: "sms_auth",
          })
          .select()
          .single();
        account = newUser;
      }
    }

    const companyId = (account as any)?.company_id || null;
    const accountId = (account as any)?.id || null;

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    if (accountId) {
      await supabase.from("manager_sessions").upsert({
        user_id: accountId,
        company_id: companyId,
        token,
        expires_at: expiresAt.toISOString(),
      });
    }

    const response = NextResponse.json({
      success: true,
      token,
      accountId,
      companyId,
      isNewUser: !account,
      plan: "trial",
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
