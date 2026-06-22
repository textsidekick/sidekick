import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { detectSkillGaps } from "@/lib/skill-gap-detector";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: session } = await supabase
      .from("manager_sessions")
      .select("company_id, expires_at")
      .eq("token", token)
      .single();

    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: "session_expired" }, { status: 401 });
    }

    const report = await detectSkillGaps(session.company_id);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[skill-gaps] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
