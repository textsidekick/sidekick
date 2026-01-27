import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = origin || "http://localhost:3000";

  if (error) {
    console.error("Gusto OAuth error:", error);
    return NextResponse.redirect(new URL(`/manager?error=gusto_auth_failed`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/manager?error=no_code`, baseUrl));
  }

  const GUSTO_CLIENT_ID = process.env.GUSTO_CLIENT_ID;
  const GUSTO_CLIENT_SECRET = process.env.GUSTO_CLIENT_SECRET;

  if (!GUSTO_CLIENT_ID || !GUSTO_CLIENT_SECRET) {
    return NextResponse.redirect(new URL(`/manager?error=missing_credentials`, baseUrl));
  }

  const REDIRECT_URI = `${baseUrl}/api/auth/gusto/callback`;

  try {
    const tokenResponse = await fetch("https://api.gusto-demo.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: GUSTO_CLIENT_ID,
        client_secret: GUSTO_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log("Gusto token response:", JSON.stringify(tokens, null, 2));

    if (!tokens.access_token) {
      console.error("Failed to get Gusto access token:", tokens);
      return NextResponse.redirect(new URL(`/manager?error=token_failed`, baseUrl));
    }

    // Get company info
    const companyResponse = await fetch("https://api.gusto-demo.com/v1/me", {
      headers: { 
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    const companyText = await companyResponse.text();
    console.log("Gusto company response:", companyText);
    
    let gustoCompanyId = "";
    let gustoCompanyName = "Connected Company";
    try {
      const companyInfo = JSON.parse(companyText);
      if (companyInfo.companies && companyInfo.companies.length > 0) {
        gustoCompanyId = companyInfo.companies[0].id;
        gustoCompanyName = companyInfo.companies[0].name;
      }
    } catch (e) {
      console.error("Failed to parse company info:", e);
    }

    const { error: dbError } = await supabase
      .from("gusto_connections")
      .upsert({
        company_id: state || "demo",
        gusto_company_id: gustoCompanyId,
        gusto_company_name: gustoCompanyName,
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
      console.error("Failed to store Gusto tokens:", dbError);
    }

    console.log("Gusto connection successful!");
    return NextResponse.redirect(new URL(`/manager?gusto_connected=true&companyId=${state}`, baseUrl));
  } catch (err) {
    console.error("Gusto OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/manager?error=oauth_failed`, baseUrl));
  }
}
