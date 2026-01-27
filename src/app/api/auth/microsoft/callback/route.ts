import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = origin || "http://localhost:3000";

  if (error) {
    console.error("Microsoft OAuth error:", error);
    return NextResponse.redirect(new URL(`/manager?error=microsoft_auth_failed`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/manager?error=no_code`, baseUrl));
  }

  const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    return NextResponse.redirect(new URL(`/manager?error=missing_credentials`, baseUrl));
  }

  const REDIRECT_URI = `${baseUrl}/api/auth/microsoft/callback`;

  try {
    const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log("Microsoft token response:", JSON.stringify(tokens, null, 2));

    if (!tokens.access_token) {
      console.error("Failed to get Microsoft access token:", tokens);
      return NextResponse.redirect(new URL(`/manager?error=token_failed`, baseUrl));
    }

    // Get user info
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { 
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    const userText = await userResponse.text();
    console.log("Microsoft user response:", userText);
    
    let userEmail = "unknown@microsoft.com";
    try {
      const userInfo = JSON.parse(userText);
      userEmail = userInfo.mail || userInfo.userPrincipalName || "unknown@microsoft.com";
    } catch (e) {
      console.error("Failed to parse user info:", e);
    }

    const { error: dbError } = await supabase
      .from("microsoft_connections")
      .upsert({
        company_id: state || "demo",
        microsoft_email: userEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        connected_at: new Date().toISOString(),
      }, {
        onConflict: "company_id"
      });

    if (dbError) {
      console.error("Failed to store Microsoft tokens:", dbError);
    }

    console.log("Microsoft connection successful!");
    return NextResponse.redirect(new URL(`/manager?microsoft_connected=true&companyId=${state}`, baseUrl));
  } catch (err) {
    console.error("Microsoft OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/manager?error=oauth_failed`, baseUrl));
  }
}
