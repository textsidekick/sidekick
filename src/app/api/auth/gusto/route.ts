import { NextResponse } from "next/server";

const GUSTO_CLIENT_ID = process.env.GUSTO_CLIENT_ID || 'placeholder';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  
  const REDIRECT_URI = `${origin}/api/auth/gusto/callback`;

  const authUrl = new URL("https://api.gusto-demo.com/oauth/authorize");
  authUrl.searchParams.set("client_id", GUSTO_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", companyId);

  return NextResponse.redirect(authUrl.toString());
}
