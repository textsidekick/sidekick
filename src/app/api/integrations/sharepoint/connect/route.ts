import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId, siteUrl } = await request.json();
    
    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // Store connection info
    await supabase.from("sharepoint_connections").upsert({
      company_id: companyId,
      site_url: siteUrl || null,
      connected: true,
      connected_at: new Date().toISOString(),
    });

    // In production, this would use Microsoft Graph API to list files
    // For now, return a placeholder that shows the integration is connected
    return NextResponse.json({
      success: true,
      files: [
        { id: "placeholder-1", name: "Connect Microsoft account to see files" },
      ],
      message: "SharePoint connection saved. Configure Microsoft Graph API credentials to enable file listing.",
    });
  } catch (error) {
    console.error("[SharePoint] Connect error:", error);
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}
