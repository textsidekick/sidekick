import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "";
  const subdomain = searchParams.get("subdomain") || "";

  if (!subdomain) {
    return NextResponse.json({ error: "Missing Zendesk subdomain" }, { status: 400 });
  }

  const clientId = process.env.ZENDESK_CLIENT_ID || "";
  if (!clientId) {
    return NextResponse.json({ error: "Missing ZENDESK_CLIENT_ID" }, { status: 500 });
  }

  const redirectUri = "https://app.textsidekick.com/api/integrations/zendesk/callback";
  const scope = "read hc:read";

  const authUrl = new URL(`https://${subdomain}.zendesk.com/oauth/authorizations/new`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", `${companyId}:${subdomain}`);

  return NextResponse.redirect(authUrl.toString());
}
