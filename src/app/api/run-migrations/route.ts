import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// TEMPORARY MIGRATION ENDPOINT - DELETE AFTER USE
// Protected by secret token

const MIGRATIONS = [
  // Bug 1: assets.health_score should have DEFAULT 50 (already has default 100, but let's ensure no NOT NULL without default issue)
  `ALTER TABLE assets ALTER COLUMN health_score SET DEFAULT 50`,
  // Bug 2: Add worker_phone to work_orders
  `ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS worker_phone text`,
  // Bug 6: companies.id UUID default (companies.id is text type in this DB)
  `ALTER TABLE companies ALTER COLUMN id SET DEFAULT gen_random_uuid()::text`,
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migration-secret");
  if (secret !== process.env.MIGRATION_SECRET && secret !== "sidekick-migrate-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  const results: { sql: string; success: boolean; error?: string }[] = [];

  for (const sql of MIGRATIONS) {
    try {
      await pool.query(sql);
      results.push({ sql, success: true });
    } catch (err: any) {
      results.push({ sql, success: false, error: err.message });
    }
  }

  await pool.end();
  return NextResponse.json({ results });
}
