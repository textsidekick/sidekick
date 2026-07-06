import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    // Auto-paid phone numbers
    const PAID_PHONES = ["+14088285979", "+12243348775", "+14083049470", "+17813252655"];
    const isPaidUser = PAID_PHONES.some(p => phone.endsWith(p.slice(-10)));

    // Verify code from verification_codes table
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

    // Find the user's company — check manager_users by looking up via company manager_phone
    let companyId: string | null = null;
    let userId: string | null = null;
    let username: string | null = null;

    // Method 1: Check if there's a manager_users entry associated with this phone
    // (via company's manager_phone)
    const { data: company } = await supabase
      .from("companies")
      .select("id, name, manager_phone")
      .eq("manager_phone", phone)
      .single();

    if (company) {
      companyId = company.id;
      // Find or create manager_users entry
      const { data: user } = await supabase
        .from("manager_users")
        .select("id, username")
        .eq("company_id", companyId)
        .limit(1)
        .single();
      
      if (user) {
        userId = user.id;
        username = user.username;
      }
    }

    // Method 2: Check if phone belongs to a manager_profile
    if (!companyId) {
      const { data: profile } = await supabase
        .from("manager_profiles")
        .select("company_id")
        .eq("phone", phone)
        .limit(1)
        .single();
      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    }

    // Method 3: Check PAID_PHONES mapping or single-company demo mode
    if (!companyId) {
      const { data: allCompanies } = await supabase.from("companies").select("id, name").limit(2);
      if (isPaidUser && allCompanies && allCompanies.length > 0) {
        companyId = allCompanies[0].id;
      } else if (allCompanies && allCompanies.length === 1) {
        // Single-company demo mode
        companyId = allCompanies[0].id;
      }
    }

    if (companyId && !userId) {
      const { data: user } = await supabase
        .from("manager_users")
        .select("id, username")
        .eq("company_id", companyId)
        .limit(1)
        .single();
      if (user) {
        userId = user.id;
        username = user.username;
      }
    }

    const isNewUser = !companyId;

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create session
    const sessionData: any = {
      token,
      company_id: companyId,
      expires_at: expiresAt.toISOString(),
    };
    if (userId) sessionData.user_id = userId;

    await supabase.from("manager_sessions").insert(sessionData);

    const response = NextResponse.json({
      success: true,
      token,
      accountId: userId,
      companyId,
      username: username || phone,
      isNewUser,
      plan: isPaidUser ? "paid" : "trial",
      trialExpired: false,
      questionsExhausted: false,
    });

    // Set both cookies so middleware and APIs both work
    response.cookies.set("sidekick_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    response.cookies.set("sidekick_auth", "true", {
      httpOnly: false,
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
