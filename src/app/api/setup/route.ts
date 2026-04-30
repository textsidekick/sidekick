import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    // Extract project ref from URL
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

    // Use the Supabase Management API SQL endpoint
    // POST https://api.supabase.com/v1/projects/{ref}/sql
    // But this requires a management API token, not service role key

    // Alternative: use the pg-meta endpoint which accepts service role key
    const sql = `
      CREATE TABLE IF NOT EXISTS verification_codes (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        phone text NOT NULL,
        code text NOT NULL,
        expires_at timestamptz NOT NULL,
        used boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS manager_accounts (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        phone text UNIQUE NOT NULL,
        company_id uuid,
        trial_ends_at timestamptz,
        questions_used integer DEFAULT 0,
        questions_limit integer DEFAULT 50,
        documents_limit integer DEFAULT 3,
        plan text DEFAULT 'trial',
        created_at timestamptz DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS manager_sessions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        account_id uuid REFERENCES manager_accounts(id),
        token text UNIQUE NOT NULL,
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `;

    // Try the pg-meta query endpoint
    const pgRes = await fetch(`${supabaseUrl}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (pgRes.ok) {
      const result = await pgRes.json();
      return NextResponse.json({ success: true, method: "pg/query", result });
    }

    // Try alternate endpoint
    const altRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
        "Prefer": "return=minimal",
      },
      body: sql,
    });

    return NextResponse.json({
      error: "Could not run DDL",
      pgStatus: pgRes.status,
      pgBody: await pgRes.text().catch(() => ""),
      altStatus: altRes.status,
      projectRef,
    }, { status: 500 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
