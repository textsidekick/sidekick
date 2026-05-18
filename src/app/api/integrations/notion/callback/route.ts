import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // companyId

  if (!code) {
    return NextResponse.redirect(new URL("/manager?error=notion_no_code", request.url));
  }

  try {
    // Exchange code for access token
    const credentials = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://app.textsidekick.com/api/integrations/notion/callback",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[Notion OAuth] Error:", tokenData.error);
      return NextResponse.redirect(new URL("/manager?error=notion_auth_failed", request.url));
    }

    const accessToken = tokenData.access_token;
    const workspaceName = tokenData.workspace_name || "Notion Workspace";
    const companyId = state || "";

    // Store the connection
    if (companyId) {
      await supabase.from("notion_connections").upsert({
        company_id: companyId,
        api_key: accessToken,
        workspace_name: workspaceName,
        connected: true,
        connected_at: new Date().toISOString(),
      });
    }

    return NextResponse.redirect(new URL("/manager?notion=connected", request.url));
  } catch (error) {
    console.error("[Notion OAuth] Callback error:", error);
    return NextResponse.redirect(new URL("/manager?error=notion_callback_failed", request.url));
  }
}
