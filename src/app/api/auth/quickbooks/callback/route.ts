import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const realmId = searchParams.get("realmId");
  const error = searchParams.get("error");

  const baseUrl = origin || "http://localhost:3000";

  if (error) {
    console.error("QuickBooks OAuth error:", error);
    return NextResponse.redirect(new URL(`/manager?error=quickbooks_auth_failed`, baseUrl));
  }

  if (!code || !realmId) {
    return NextResponse.redirect(new URL(`/manager?error=no_code`, baseUrl));
  }

  const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
  const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;

  if (!QUICKBOOKS_CLIENT_ID || !QUICKBOOKS_CLIENT_SECRET) {
    return NextResponse.redirect(new URL(`/manager?error=missing_credentials`, baseUrl));
  }

  const REDIRECT_URI = `${baseUrl}/api/auth/quickbooks/callback`;

  try {
    const basicAuth = Buffer.from(`${QUICKBOOKS_CLIENT_ID}:${QUICKBOOKS_CLIENT_SECRET}`).toString("base64");
    
    const tokenResponse = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log("QuickBooks token response:", JSON.stringify(tokens, null, 2));

    if (!tokens.access_token) {
      console.error("Failed to get QuickBooks access token:", tokens);
      return NextResponse.redirect(new URL(`/manager?error=token_failed`, baseUrl));
    }

    // Get company info
    const companyResponse = await fetch(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: { 
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/json",
        },
      }
    );
    
    let companyName = "QuickBooks Company";
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      companyName = companyData.CompanyInfo?.CompanyName || "QuickBooks Company";
    }

    const { error: dbError } = await supabase
      .from("quickbooks_connections")
      .upsert({
        company_id: state || "demo",
        realm_id: realmId,
        quickbooks_company_name: companyName,
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
      console.error("Failed to store QuickBooks tokens:", dbError);
    }

    console.log("QuickBooks connection successful!");
    return NextResponse.redirect(new URL(`/manager?quickbooks_connected=true&companyId=${state}`, baseUrl));
  } catch (err) {
    console.error("QuickBooks OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/manager?error=oauth_failed`, baseUrl));
  }
}
