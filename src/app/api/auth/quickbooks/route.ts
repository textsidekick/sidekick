import { NextResponse } from "next/server";

const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!;

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  
  const REDIRECT_URI = `${origin}/api/auth/quickbooks/callback`;

  // QuickBooks requires specific scope format
  const scopes = encodeURIComponent("com.intuit.quickbooks.accounting openid profile email");

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${QUICKBOOKS_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopes}&state=${companyId}`;

  return NextResponse.redirect(authUrl);
}
