import { NextResponse } from "next/server";

const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  const origin = new URL(req.url).origin;
  
  const REDIRECT_URI = `${origin}/api/auth/dropbox/callback`;

  const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
  authUrl.searchParams.set("client_id", DROPBOX_APP_KEY);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("token_access_type", "offline");
  authUrl.searchParams.set("state", companyId);

  return NextResponse.redirect(authUrl.toString());
}
