import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from("manager_users")
      .select("id, company_id, password_hash")
      .eq("username", username)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Store session
    await supabase.from("manager_sessions").insert({
      user_id: user.id,
      company_id: user.company_id,
      token,
      expires_at: expiresAt.toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      token,
      companyId: user.company_id,
    });

    // Set secure cookie
    response.cookies.set("sidekick_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Login] Error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
