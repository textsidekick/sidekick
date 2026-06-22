import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "run-sidekick-migration-2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Build connection string from Supabase URL
  // Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const ref = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
  
  // If DATABASE_URL is set, use it directly
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return NextResponse.json({ 
      error: "DATABASE_URL not set. Add it to Vercel env vars.",
      hint: "Go to Supabase Dashboard → Settings → Database → Connection string (URI). Copy the 'Transaction pooler' string and add it as DATABASE_URL in Vercel.",
      ref 
    }, { status: 500 });
  }

  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  const statements = [
    `CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql`,
    `CREATE TABLE IF NOT EXISTS work_order_counters (company_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE, counter bigint NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS assets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name text NOT NULL, asset_tag text, type text, manufacturer text, model text, serial_number text, location text, install_date date, status text NOT NULL DEFAULT 'operational' CHECK (status IN ('operational','degraded','down','decommissioned')), health_score integer NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100), notes text, metadata jsonb DEFAULT '{}', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS idx_assets_company ON assets(company_id)`,
    `CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(company_id, status)`,
    `CREATE TABLE IF NOT EXISTS work_orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE, short_id text, asset_id uuid REFERENCES assets(id) ON DELETE SET NULL, asset_name text, asset_tag text, reported_by text, assigned_to uuid REFERENCES workers(id) ON DELETE SET NULL, title text NOT NULL, description text, original_message text, ai_triage jsonb, priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')), status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','on_hold','completed','cancelled')), category text DEFAULT 'other' CHECK (category IN ('mechanical','electrical','plumbing','hydraulic','pneumatic','safety','quality','preventive','inspection','environmental','other')), source text DEFAULT 'sms' CHECK (source IN ('sms','voice_note','photo','web','qr_code','pm_schedule','ai_generated','other')), estimated_time_minutes integer, actual_time_minutes integer, started_at timestamptz, completed_at timestamptz, resolution_notes text, parts_used jsonb DEFAULT '[]', photos text[], follow_up_wo_id uuid, parent_wo_id uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS idx_wo_company ON work_orders(company_id)`,
    `CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(company_id, status)`,
    `CREATE INDEX IF NOT EXISTS idx_wo_priority ON work_orders(company_id, priority)`,
    `CREATE INDEX IF NOT EXISTS idx_wo_asset ON work_orders(asset_id)`,
    `CREATE INDEX IF NOT EXISTS idx_wo_assigned ON work_orders(assigned_to)`,
    `CREATE INDEX IF NOT EXISTS idx_wo_created ON work_orders(company_id, created_at DESC)`,
    `CREATE OR REPLACE FUNCTION generate_work_order_short_id() RETURNS TRIGGER AS $$ DECLARE next_val bigint; BEGIN INSERT INTO work_order_counters (company_id, counter) VALUES (NEW.company_id, 1) ON CONFLICT (company_id) DO UPDATE SET counter = work_order_counters.counter + 1 RETURNING counter INTO next_val; NEW.short_id := 'WO-' || lpad(next_val::text, 4, '0'); RETURN NEW; END; $$ LANGUAGE plpgsql`,
    `DROP TRIGGER IF EXISTS work_orders_set_short_id ON work_orders`,
    `CREATE TRIGGER work_orders_set_short_id BEFORE INSERT ON work_orders FOR EACH ROW WHEN (NEW.short_id IS NULL) EXECUTE FUNCTION generate_work_order_short_id()`,
    `CREATE TABLE IF NOT EXISTS pm_schedules (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE, asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE, title text NOT NULL, description text, checklist jsonb DEFAULT '[]', frequency_type text NOT NULL DEFAULT 'calendar' CHECK (frequency_type IN ('calendar','meter','condition')), frequency_value integer NOT NULL DEFAULT 30, last_completed_at timestamptz, next_due_at timestamptz NOT NULL, assigned_to uuid REFERENCES workers(id) ON DELETE SET NULL, status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed')), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS idx_pm_company ON pm_schedules(company_id)`,
    `CREATE INDEX IF NOT EXISTS idx_pm_asset ON pm_schedules(asset_id)`,
    `CREATE INDEX IF NOT EXISTS idx_pm_due ON pm_schedules(status, next_due_at)`,
    `CREATE TABLE IF NOT EXISTS pm_completions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), pm_schedule_id uuid REFERENCES pm_schedules(id) ON DELETE SET NULL, work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL, completed_by uuid REFERENCES workers(id) ON DELETE SET NULL, checklist_results jsonb DEFAULT '[]', findings text, photos text[], completed_at timestamptz DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS parts_inventory (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name text NOT NULL, part_number text, location text, quantity_on_hand integer NOT NULL DEFAULT 0, reorder_point integer NOT NULL DEFAULT 0, unit_cost numeric, supplier text, compatible_assets uuid[], created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS idx_parts_company ON parts_inventory(company_id)`,
    `CREATE TABLE IF NOT EXISTS shift_handoffs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE, shift_name text, outgoing_supervisor text, incoming_supervisor text, auto_summary text, manual_notes text, work_orders_summary jsonb, acknowledged_at timestamptz, created_at timestamptz DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS idx_handoffs_company ON shift_handoffs(company_id, created_at DESC)`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='role') THEN ALTER TABLE workers ADD COLUMN role text DEFAULT 'operator'; END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='skills') THEN ALTER TABLE workers ADD COLUMN skills text[]; END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='shift') THEN ALTER TABLE workers ADD COLUMN shift text; END IF; END $$`,
    `DROP TRIGGER IF EXISTS assets_updated_at ON assets`,
    `CREATE TRIGGER assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
    `DROP TRIGGER IF EXISTS work_orders_updated_at ON work_orders`,
    `CREATE TRIGGER work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
    `DROP TRIGGER IF EXISTS pm_schedules_updated_at ON pm_schedules`,
    `CREATE TRIGGER pm_schedules_updated_at BEFORE UPDATE ON pm_schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
    `DROP TRIGGER IF EXISTS parts_inventory_updated_at ON parts_inventory`,
    `CREATE TRIGGER parts_inventory_updated_at BEFORE UPDATE ON parts_inventory FOR EACH ROW EXECUTE FUNCTION set_updated_at()`,
    `CREATE TABLE IF NOT EXISTS failure_patterns (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), equipment_type text NOT NULL, manufacturer text, model text, failure_category text, symptoms text, root_cause text, fix_applied text, repair_time_minutes integer, created_at timestamptz DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS idx_failure_patterns_equipment ON failure_patterns(equipment_type)`,
    `CREATE INDEX IF NOT EXISTS idx_failure_patterns_mfg ON failure_patterns(equipment_type, manufacturer)`,
  ];

  const results: { i: number; status: string }[] = [];
  const client = await pool.connect();

  try {
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
        results.push({ i, status: "ok" });
      } catch (e: any) {
        results.push({ i, status: "error: " + (e.message || String(e)).slice(0, 120) });
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  const failures = results.filter(r => r.status !== "ok");
  return NextResponse.json({ 
    total: statements.length, 
    successes: results.length - failures.length,
    failures: failures.length,
    failureDetails: failures 
  });
}
