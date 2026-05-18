import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId, token } = await request.json();
    
    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // If no token provided, return OAuth URL for Slack
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Slack integration requires a bot token. Create a Slack app at api.slack.com/apps, add bot scopes (channels:read, channels:history), and install to your workspace.",
        oauthUrl: "https://api.slack.com/apps",
      });
    }

    // Verify token and list channels
    const channelsRes = await fetch("https://slack.com/api/conversations.list?types=public_channel&limit=50", {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const channelsData = await channelsRes.json();

    if (!channelsData.ok) {
      return NextResponse.json({ error: "Invalid Slack token" }, { status: 401 });
    }

    const channels = (channelsData.channels || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      memberCount: c.num_members,
    }));

    await supabase.from("slack_connections").upsert({
      company_id: companyId,
      bot_token: token,
      connected: true,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, channels });
  } catch (error) {
    console.error("[Slack] Connect error:", error);
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}
