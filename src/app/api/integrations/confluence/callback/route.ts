import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // companyId

  if (!code) {
    return NextResponse.redirect(new URL("/manager?error=confluence_no_code", request.url));
  }

  const clientId = process.env.CONFLUENCE_CLIENT_ID || "";
  const clientSecret = process.env.CONFLUENCE_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/manager?error=confluence_missing_credentials", request.url));
  }

  try {
    const tokenRes = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: "https://app.textsidekick.com/api/integrations/confluence/callback",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error("[Confluence OAuth] Token error:", tokenData);
      return NextResponse.redirect(new URL("/manager?error=confluence_auth_failed", request.url));
    }

    const accessToken = tokenData.access_token as string | undefined;
    const refreshToken = tokenData.refresh_token as string | undefined;
    const companyId = state || "";

    if (companyId && accessToken) {
      await supabase.from("confluence_connections").upsert({
        company_id: companyId,
        access_token: accessToken,
        refresh_token: refreshToken,
        connected_at: new Date().toISOString(),
      });
    }

    return NextResponse.redirect(new URL("/manager?confluence=connected", request.url));
  } catch (error) {
    console.error("[Confluence OAuth] Callback error:", error);
    return NextResponse.redirect(new URL("/manager?error=confluence_callback_failed", request.url));
  }
}
