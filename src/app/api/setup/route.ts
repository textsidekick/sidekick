import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // Create verification_codes table
    const { error: e1 } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS verification_codes (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, phone text NOT NULL, code text NOT NULL, expires_at timestamptz NOT NULL, used boolean DEFAULT false, created_at timestamptz DEFAULT now())`
    });

    // Create manager_accounts table
    const { error: e2 } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS manager_accounts (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, phone text UNIQUE NOT NULL, company_id uuid, trial_ends_at timestamptz, questions_used integer DEFAULT 0, questions_limit integer DEFAULT 50, documents_limit integer DEFAULT 3, plan text DEFAULT 'trial', created_at timestamptz DEFAULT now())`
    });

    // Create manager_sessions table
    const { error: e3 } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS manager_sessions (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, account_id uuid REFERENCES manager_accounts(id), token text UNIQUE NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz DEFAULT now())`
    });

    // If rpc doesn't work, try direct SQL via fetch to Supabase
    if (e1 || e2 || e3) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Missing Supabase credentials", errors: [e1?.message, e2?.message, e3?.message] }, { status: 500 });
      }

      const sql = `
        CREATE TABLE IF NOT EXISTS verification_codes (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, phone text NOT NULL, code text NOT NULL, expires_at timestamptz NOT NULL, used boolean DEFAULT false, created_at timestamptz DEFAULT now());
        CREATE TABLE IF NOT EXISTS manager_accounts (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, phone text UNIQUE NOT NULL, company_id uuid, trial_ends_at timestamptz, questions_used integer DEFAULT 0, questions_limit integer DEFAULT 50, documents_limit integer DEFAULT 3, plan text DEFAULT 'trial', created_at timestamptz DEFAULT now());
        CREATE TABLE IF NOT EXISTS manager_sessions (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, account_id uuid REFERENCES manager_accounts(id), token text UNIQUE NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz DEFAULT now());
      `;

      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ sql }),
      });

      if (!res.ok) {
        // Try the pg_net approach or return instructions
        return NextResponse.json({ 
          error: "RPC not available. Tables need manual creation.",
          supabaseUrl: supabaseUrl,
          hasServiceKey: !!serviceKey,
          rpcErrors: [e1?.message, e2?.message, e3?.message],
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Tables created successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
