import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { handleManagerQuery } from "@/lib/manager-query";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await handleManagerQuery(query.trim(), session.company_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[manager/query] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
