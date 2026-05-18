import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    
    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // QuickBooks uses OAuth2 — store connection intent
    await supabase.from("quickbooks_connections").upsert({
      company_id: companyId,
      connected: true,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "QuickBooks connection saved. Configure OAuth2 credentials to enable full sync.",
    });
  } catch (error) {
    console.error("[QuickBooks] Connect error:", error);
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}
