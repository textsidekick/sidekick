import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sidekick_session")?.value;

  // Delete server-side session
  if (token) {
    await supabase.from("manager_sessions").delete().eq("token", token);
  }

  const response = NextResponse.json({ success: true });

  // Clear both cookies
  response.cookies.set("sidekick_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("sidekick_auth", "", { path: "/", maxAge: 0 });

  return response;
}
