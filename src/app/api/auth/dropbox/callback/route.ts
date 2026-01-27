import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = origin || "http://localhost:3000";

  if (error) {
    console.error("Dropbox OAuth error:", error);
    return NextResponse.redirect(new URL(`/manager?error=dropbox_auth_failed`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/manager?error=no_code`, baseUrl));
  }

  const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
  const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;

  if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET) {
    return NextResponse.redirect(new URL(`/manager?error=missing_credentials`, baseUrl));
  }

  const REDIRECT_URI = `${baseUrl}/api/auth/dropbox/callback`;

  try {
    const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log("Dropbox token response:", JSON.stringify(tokens, null, 2));

    if (!tokens.access_token) {
      console.error("Failed to get Dropbox access token:", tokens);
      return NextResponse.redirect(new URL(`/manager?error=token_failed`, baseUrl));
    }

    // Get user info - note: this endpoint needs null body, not empty object
    const userResponse = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${tokens.access_token}`,
      },
      body: null,
    });
    
    const userText = await userResponse.text();
    console.log("Dropbox user response:", userText);
    
    let userEmail = "unknown@dropbox.com";
    try {
      const userInfo = JSON.parse(userText);
      userEmail = userInfo.email || "unknown@dropbox.com";
    } catch (e) {
      console.error("Failed to parse user info:", e);
    }

    const { error: dbError } = await supabase
      .from("dropbox_connections")
      .upsert({
        company_id: state || "demo",
        dropbox_email: userEmail,
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
      console.error("Failed to store Dropbox tokens:", dbError);
    }

    console.log("Dropbox connection successful!");
    return NextResponse.redirect(new URL(`/manager?dropbox_connected=true&companyId=${state}`, baseUrl));
  } catch (err) {
    console.error("Dropbox OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/manager?error=oauth_failed`, baseUrl));
  }
}
