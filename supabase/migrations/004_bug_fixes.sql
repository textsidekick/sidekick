-- Bug 2: Add worker_phone column to work_orders
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS worker_phone text;

-- Bug 6: Add UUID default to companies.id
-- Note: companies.id is text type in live DB, not uuid
-- Generate random IDs using gen_random_uuid()::text
ALTER TABLE companies ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
