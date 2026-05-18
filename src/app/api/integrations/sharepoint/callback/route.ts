import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // companyId

  if (!code) {
    return NextResponse.redirect(new URL("/manager?error=sharepoint_no_code", request.url));
  }

  try {
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID || "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
        code,
        redirect_uri: "https://app.textsidekick.com/api/integrations/sharepoint/callback",
        grant_type: "authorization_code",
        scope: "Files.Read.All Sites.Read.All offline_access",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[SharePoint OAuth] Error:", tokenData.error_description);
      return NextResponse.redirect(new URL("/manager?error=sharepoint_auth_failed", request.url));
    }

    const companyId = state || "";
    if (companyId) {
      await supabase.from("sharepoint_connections").upsert({
        company_id: companyId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        connected: true,
        connected_at: new Date().toISOString(),
      });
    }

    return NextResponse.redirect(new URL("/manager?sharepoint=connected", request.url));
  } catch (error) {
    console.error("[SharePoint OAuth] Callback error:", error);
    return NextResponse.redirect(new URL("/manager?error=sharepoint_callback_failed", request.url));
  }
}
