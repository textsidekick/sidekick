import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || ""; // companyId:subdomain

  if (!code) {
    return NextResponse.redirect(new URL("/manager?error=zendesk_no_code", request.url));
  }

  const clientId = process.env.ZENDESK_CLIENT_ID || "";
  const clientSecret = process.env.ZENDESK_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/manager?error=zendesk_missing_credentials", request.url));
  }

  const [companyId, subdomain] = state.split(":");
  if (!companyId || !subdomain) {
    return NextResponse.redirect(new URL("/manager?error=zendesk_bad_state", request.url));
  }

  try {
    const tokenRes = await fetch(`https://${subdomain}.zendesk.com/oauth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: "https://app.textsidekick.com/api/integrations/zendesk/callback",
        scope: "read hc:read",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error("[Zendesk OAuth] Token error:", tokenData);
      return NextResponse.redirect(new URL("/manager?error=zendesk_auth_failed", request.url));
    }

    const accessToken = tokenData.access_token as string | undefined;
    const refreshToken = tokenData.refresh_token as string | undefined;

    if (companyId && accessToken) {
      await supabase.from("zendesk_connections").upsert({
        company_id: companyId,
        subdomain,
        access_token: accessToken,
        refresh_token: refreshToken,
        connected_at: new Date().toISOString(),
      });
    }

    return NextResponse.redirect(new URL("/manager?zendesk=connected", request.url));
  } catch (error) {
    console.error("[Zendesk OAuth] Callback error:", error);
    return NextResponse.redirect(new URL("/manager?error=zendesk_callback_failed", request.url));
  }
}
