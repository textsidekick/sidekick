import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "";

  const redirectUri = "https://app.textsidekick.com/api/integrations/confluence/callback";

  const clientId = process.env.CONFLUENCE_CLIENT_ID || "";
  if (!clientId) {
    return NextResponse.json({ error: "Missing CONFLUENCE_CLIENT_ID" }, { status: 500 });
  }

  const scope = "read:confluence-content.all read:confluence-space.summary offline_access";

  const authUrl = new URL("https://auth.atlassian.com/authorize");
  authUrl.searchParams.set("audience", "api.atlassian.com");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", companyId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
