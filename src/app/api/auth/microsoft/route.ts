import { NextResponse } from "next/server";

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  
  const REDIRECT_URI = `${origin}/api/auth/microsoft/callback`;

  const scopes = [
    "openid",
    "profile", 
    "email",
    "offline_access",
    "User.Read",
    "Files.Read",
    "Files.Read.All",
    "ChannelMessage.Send",
    "Chat.ReadWrite"
  ].join(" ");

  const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  authUrl.searchParams.set("client_id", MICROSOFT_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", companyId);

  return NextResponse.redirect(authUrl.toString());
}
