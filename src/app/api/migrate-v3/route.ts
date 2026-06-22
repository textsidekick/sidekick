import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "migrate-v3-2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ error: "no DATABASE_URL" });

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();

    const statements = [
      // Vendor contacts table
      `CREATE TABLE IF NOT EXISTS vendor_contacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, name text NOT NULL, company_name text, phone text NOT NULL, email text, specialty text, equipment_brands text[], notes text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())`,
      `CREATE INDEX IF NOT EXISTS idx_vendor_company ON vendor_contacts(company_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vendor_specialty ON vendor_contacts(company_id, specialty)`,
      
      // Add cost_config to companies (as jsonb column)
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='cost_config') THEN ALTER TABLE companies ADD COLUMN cost_config jsonb DEFAULT '{}'; END IF; END $$`,
      
      // Add downtime_cost_estimate to work_orders
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_orders' AND column_name='downtime_cost_estimate') THEN ALTER TABLE work_orders ADD COLUMN downtime_cost_estimate numeric DEFAULT 0; END IF; END $$`,
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
