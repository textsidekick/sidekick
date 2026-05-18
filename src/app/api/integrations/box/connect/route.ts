import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "";

  const clientId = process.env.BOX_CLIENT_ID || "";
  if (!clientId) {
    return NextResponse.json({ error: "Missing BOX_CLIENT_ID" }, { status: 500 });
  }

  const redirectUri = "https://app.textsidekick.com/api/integrations/box/callback";

  const authUrl = new URL("https://account.box.com/api/oauth2/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", companyId);

  return NextResponse.redirect(authUrl.toString());
}
