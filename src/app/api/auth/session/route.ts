import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Find session
    const { data: session, error } = await supabase
      .from("manager_sessions")
      .select("user_id, company_id, expires_at")
      .eq("token", token)
      .single();

    if (error || !session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase.from("manager_sessions").delete().eq("token", token);
      return NextResponse.json({ authenticated: false, reason: "expired" }, { status: 401 });
    }

    // Get company info
    const { data: company } = await supabase
      .from("companies")
      .select("id, name, access_code")
      .eq("id", session.company_id)
      .single();

    return NextResponse.json({
      authenticated: true,
      companyId: session.company_id,
      company: company || null,
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
