import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  
  const baseUrl = origin || "http://localhost:3000";

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL(`/manager?error=google_auth_failed`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/manager?error=no_code`, baseUrl));
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  console.log("GOOGLE_CLIENT_ID exists:", !!GOOGLE_CLIENT_ID);
  console.log("GOOGLE_CLIENT_SECRET exists:", !!GOOGLE_CLIENT_SECRET);
  console.log("Client ID:", GOOGLE_CLIENT_ID?.slice(0, 20) + "...");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Missing Google credentials");
    return NextResponse.redirect(new URL(`/manager?error=missing_credentials`, baseUrl));
  }

  const REDIRECT_URI = `${baseUrl}/api/auth/google/callback`;
  console.log("Using redirect URI:", REDIRECT_URI);

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log("Token response:", JSON.stringify(tokens, null, 2));

    if (!tokens.access_token) {
      console.error("Failed to get access token:", tokens);
      return NextResponse.redirect(new URL(`/manager?error=token_failed`, baseUrl));
    }

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const userInfo = await userInfoResponse.json();
    console.log("User info:", userInfo.email);

    const { error: dbError } = await supabase
      .from("google_drive_connections")
      .upsert({
        company_id: state || "demo",
        google_email: userInfo.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        connected_at: new Date().toISOString(),
      }, {
        onConflict: "company_id"
      });

    if (dbError) {
      console.error("Failed to store tokens:", dbError);
    }

    return NextResponse.redirect(new URL(`/onboarding?google_connected=true&companyId=${state}`, baseUrl));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/manager?error=oauth_failed`, baseUrl));
  }
}
