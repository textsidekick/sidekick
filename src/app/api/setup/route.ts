import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Try inserting a test row to check if tables exist, create them via individual operations
    // Since we can't run raw DDL via PostgREST, we'll test if tables exist

    // Test verification_codes
    const { error: e1 } = await supabase.from("verification_codes").select("id").limit(1);
    const { error: e2 } = await supabase.from("manager_accounts").select("id").limit(1);
    const { error: e3 } = await supabase.from("manager_sessions").select("id").limit(1);

    const tables = {
      verification_codes: e1 ? `missing (${e1.message})` : "exists",
      manager_accounts: e2 ? `missing (${e2.message})` : "exists",
      manager_sessions: e3 ? `missing (${e3.message})` : "exists",
    };

    // Return the actual Supabase URL and service key prefix for debugging
    return NextResponse.json({
      supabaseUrl,
      serviceKeyPrefix: serviceKey.substring(0, 20) + "...",
      tables,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
