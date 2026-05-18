import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId, fileId, fileName } = await request.json();
    
    // In production: fetch file content via Microsoft Graph API, parse, chunk, embed
    // For now: acknowledge the import request
    return NextResponse.json({
      success: true,
      message: `Import of "${fileName}" queued. Configure Microsoft Graph API to enable full import.`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
