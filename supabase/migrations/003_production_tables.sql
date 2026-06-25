-- 003_production_tables.sql
-- Production-readiness tables for Sidekick

-- -------------------------------------------------------
-- Shifts
-- -------------------------------------------------------
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_shifts_company on public.shifts(company_id);

-- -------------------------------------------------------
-- Worker <-> Shift junction
-- -------------------------------------------------------
create table if not exists public.worker_shifts (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (worker_id, shift_id)
);

-- -------------------------------------------------------
-- Audit log
-- -------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_log_company on public.audit_log(company_id);
create index if not exists idx_audit_log_entity on public.audit_log(entity_type, entity_id);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);

-- -------------------------------------------------------
-- Company settings
-- -------------------------------------------------------
create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade unique,
  working_hours_start time not null default '06:00',
  working_hours_end time not null default '22:00',
  escalation_rules jsonb not null default '[]',
  notification_preferences jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------
-- Webhooks
-- -------------------------------------------------------
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  url text not null,
  events text[] not null default '{}',
  secret text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_webhooks_company on public.webhooks(company_id);

-- -------------------------------------------------------
-- Work order categories
-- -------------------------------------------------------
create table if not exists public.wo_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  color text not null default '#6b7280',
  created_at timestamptz not null default now()
);
create index if not exists idx_wo_categories_company on public.wo_categories(company_id);

-- -------------------------------------------------------
-- Work order priorities
-- -------------------------------------------------------
create table if not exists public.wo_priorities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  level int not null,
  sla_hours numeric not null default 24,
  created_at timestamptz not null default now()
);
create index if not exists idx_wo_priorities_company on public.wo_priorities(company_id);

-- -------------------------------------------------------
-- Add columns to assets (safe, idempotent via DO blocks)
-- -------------------------------------------------------
do $$ begin
  alter table public.assets add column if not exists make text;
  alter table public.assets add column if not exists year int;
exception when others then null;
end $$;

-- serial_number already exists per migration 001, safe re-add
do $$ begin
  alter table public.assets add column if not exists serial_number text;
exception when others then null;
end $$;

-- -------------------------------------------------------
-- Add asset_id to documents
-- -------------------------------------------------------
do $$ begin
  alter table public.documents add column if not exists asset_id uuid references public.assets(id) on delete set null;
exception when others then null;
end $$;

-- -------------------------------------------------------
-- Asset health history (for health score over time charts)
-- -------------------------------------------------------
create table if not exists public.asset_health_history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  health_score numeric not null,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_ahh_asset on public.asset_health_history(asset_id, recorded_at desc);

-- -------------------------------------------------------
-- Webhook delivery log
-- -------------------------------------------------------
create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references public.webhooks(id) on delete cascade,
  event text not null,
  payload jsonb,
  status_code int,
  success boolean,
  delivered_at timestamptz not null default now()
);
