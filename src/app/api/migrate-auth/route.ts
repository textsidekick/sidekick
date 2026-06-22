import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "migrate-auth-2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ error: "no DATABASE_URL" });

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();

    const statements = [
      `CREATE TABLE IF NOT EXISTS verification_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), phone text NOT NULL, code text NOT NULL, used boolean DEFAULT false, expires_at timestamptz NOT NULL, created_at timestamptz DEFAULT now())`,
      `CREATE INDEX IF NOT EXISTS idx_vc_phone ON verification_codes(phone, code, used)`,
    ];

    const results: { i: number; ok: boolean; err?: string }[] = [];
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
        results.push({ i, ok: true });
      } catch (e: any) {
        results.push({ i, ok: false, err: (e.message || "").slice(0, 100) });
      }
    }

    client.release();
    await pool.end();
    return NextResponse.json({ total: results.length, ok: results.filter(r => r.ok).length, failures: results.filter(r => !r.ok) });
  } catch (e: any) {
    return NextResponse.json({ error: "connection_failed", message: e.message?.slice(0, 200) });
  }
}
