import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // companyId

  if (!code) {
    return NextResponse.redirect(new URL("/manager?error=slack_no_code", request.url));
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID || "",
        client_secret: process.env.SLACK_CLIENT_SECRET || "",
        code,
        redirect_uri: "https://app.textsidekick.com/api/integrations/slack/callback",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.ok) {
      console.error("[Slack OAuth] Error:", tokenData.error);
      return NextResponse.redirect(new URL("/manager?error=slack_auth_failed", request.url));
    }

    const botToken = tokenData.access_token;
    const teamName = tokenData.team?.name || "Slack Workspace";
    const companyId = state || "";

    // Store the connection
    if (companyId) {
      await supabase.from("slack_connections").upsert({
        company_id: companyId,
        bot_token: botToken,
        team_name: teamName,
        connected: true,
        connected_at: new Date().toISOString(),
      });
    }

    return NextResponse.redirect(new URL("/manager?slack=connected", request.url));
  } catch (error) {
    console.error("[Slack OAuth] Callback error:", error);
    return NextResponse.redirect(new URL("/manager?error=slack_callback_failed", request.url));
  }
}
