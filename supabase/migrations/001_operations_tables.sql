-- 001_operations_tables.sql
-- Foundational operations/maintenance tables for Sidekick (MaintainX-style core)

-- Extensions
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Work order short id: per-company sequence via counter table
create table if not exists public.work_order_counters (
  company_id uuid primary key references public.companies(id) on delete cascade,
  next_number bigint not null default 1,
  updated_at timestamptz not null default now()
);

create or replace function public.generate_work_order_short_id(p_company_id uuid)
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  insert into public.work_order_counters(company_id, next_number)
  values (p_company_id, 1)
  on conflict (company_id) do nothing;

  update public.work_order_counters
    set next_number = next_number + 1,
        updated_at = now()
    where company_id = p_company_id
    returning (next_number - 1) into n;

  return 'WO-' || lpad(n::text, 4, '0');
end;
$$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  asset_tag text not null,
  type text not null,
  manufacturer text,
  model text,
  serial_number text,
  location text not null,
  install_date date,
  status text not null default 'operational' check (status in ('operational', 'degraded', 'down', 'decommissioned')),
  health_score integer not null default 100 check (health_score >= 0 and health_score <= 100),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_company_asset_tag_unique unique (company_id, asset_tag)
);

create trigger assets_set_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

create index if not exists idx_assets_company_id on public.assets(company_id);
create index if not exists idx_assets_company_status on public.assets(company_id, status);
create index if not exists idx_assets_company_type on public.assets(company_id, type);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  short_id text not null,
  asset_id uuid references public.assets(id) on delete set null,
  reported_by text not null,
  assigned_to uuid references public.workers(id) on delete set null,
  title text not null,
  description text not null,
  original_message text,
  ai_triage jsonb not null default '{}'::jsonb,
  priority text not null default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  status text not null default 'open' check (status in ('open','assigned','in_progress','on_hold','completed','cancelled')),
  category text not null default 'other' check (category in ('mechanical','electrical','plumbing','safety','quality','preventive','inspection','other')),
  source text not null default 'sms' check (source in ('sms','voice_note','photo','web','qr_code','pm_schedule','ai_generated')),
  estimated_time_minutes integer,
  actual_time_minutes integer,
  started_at timestamptz,
  completed_at timestamptz,
  resolution_notes text,
  parts_used jsonb not null default '[]'::jsonb,
  photos text[] not null default '{}'::text[],
  follow_up_wo_id uuid references public.work_orders(id) on delete set null,
  parent_wo_id uuid references public.work_orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_orders_company_short_id_unique unique (company_id, short_id)
);

create or replace function public.work_orders_set_short_id()
returns trigger
language plpgsql
as $$
begin
  if new.short_id is null or new.short_id = '' then
    new.short_id := public.generate_work_order_short_id(new.company_id);
  end if;
  return new;
end;
$$;

create trigger work_orders_set_short_id
before insert on public.work_orders
for each row execute function public.work_orders_set_short_id();

create trigger work_orders_set_updated_at
before update on public.work_orders
for each row execute function public.set_updated_at();

create index if not exists idx_work_orders_company_id on public.work_orders(company_id);
create index if not exists idx_work_orders_company_asset on public.work_orders(company_id, asset_id);
create index if not exists idx_work_orders_company_status on public.work_orders(company_id, status);
create index if not exists idx_work_orders_company_priority on public.work_orders(company_id, priority);
create index if not exists idx_work_orders_company_assigned_to on public.work_orders(company_id, assigned_to);

create table if not exists public.pm_schedules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  title text not null,
  description text not null,
  checklist jsonb not null default '[]'::jsonb,
  frequency_type text not null check (frequency_type in ('calendar','meter','condition')),
  frequency_value integer not null,
  last_completed_at timestamptz,
  next_due_at timestamptz not null,
  assigned_to uuid references public.workers(id) on delete set null,
  status text not null default 'active' check (status in ('active','paused','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pm_schedules_set_updated_at
before update on public.pm_schedules
for each row execute function public.set_updated_at();

create index if not exists idx_pm_schedules_company_id on public.pm_schedules(company_id);
create index if not exists idx_pm_schedules_company_asset on public.pm_schedules(company_id, asset_id);
create index if not exists idx_pm_schedules_company_status on public.pm_schedules(company_id, status);
create index if not exists idx_pm_schedules_company_next_due on public.pm_schedules(company_id, next_due_at);

create table if not exists public.pm_completions (
  id uuid primary key default gen_random_uuid(),
  pm_schedule_id uuid not null references public.pm_schedules(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  completed_by uuid not null references public.workers(id) on delete restrict,
  checklist_results jsonb not null default '[]'::jsonb,
  findings text,
  photos text[] not null default '{}'::text[],
  completed_at timestamptz not null default now()
);

create index if not exists idx_pm_completions_schedule on public.pm_completions(pm_schedule_id);
create index if not exists idx_pm_completions_work_order on public.pm_completions(work_order_id);
create index if not exists idx_pm_completions_completed_by on public.pm_completions(completed_by);
create index if not exists idx_pm_completions_completed_at on public.pm_completions(completed_at);

create table if not exists public.parts_inventory (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  part_number text not null,
  location text not null,
  quantity_on_hand integer not null default 0,
  reorder_point integer not null default 0,
  unit_cost numeric,
  supplier text,
  compatible_assets uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parts_inventory_company_part_number_unique unique (company_id, part_number)
);

create trigger parts_inventory_set_updated_at
before update on public.parts_inventory
for each row execute function public.set_updated_at();

create index if not exists idx_parts_inventory_company_id on public.parts_inventory(company_id);
create index if not exists idx_parts_inventory_company_part_number on public.parts_inventory(company_id, part_number);

create table if not exists public.shift_handoffs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  shift_name text not null,
  outgoing_supervisor text not null,
  incoming_supervisor text,
  auto_summary text not null,
  manual_notes text,
  work_orders_summary jsonb not null default '{}'::jsonb,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_shift_handoffs_company_id on public.shift_handoffs(company_id);
create index if not exists idx_shift_handoffs_company_shift on public.shift_handoffs(company_id, shift_name);
create index if not exists idx_shift_handoffs_created_at on public.shift_handoffs(created_at);

-- -----------------------------------------------------------------------------
-- Workers table extension
-- -----------------------------------------------------------------------------
alter table public.workers
  add column if not exists role text not null default 'operator' check (role in ('operator','technician','supervisor','manager'));

alter table public.workers
  add column if not exists skills text[] not null default '{}'::text[];

alter table public.workers
  add column if not exists shift text;

create index if not exists idx_workers_company_role on public.workers(company_id, role);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.assets enable row level security;
alter table public.work_orders enable row level security;
alter table public.pm_schedules enable row level security;
alter table public.pm_completions enable row level security;
alter table public.parts_inventory enable row level security;
alter table public.shift_handoffs enable row level security;
alter table public.work_order_counters enable row level security;

-- Policies: company-scoped access. Assumes JWT has company_id claim.
-- If your auth uses a different claim, update current_setting keys accordingly.

create policy "assets_select_company" on public.assets
  for select using (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "assets_insert_company" on public.assets
  for insert with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "assets_update_company" on public.assets
  for update using (company_id = (auth.jwt() ->> 'company_id')::uuid)
  with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "assets_delete_company" on public.assets
  for delete using (company_id = (auth.jwt() ->> 'company_id')::uuid);

create policy "work_orders_select_company" on public.work_orders
  for select using (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "work_orders_insert_company" on public.work_orders
  for insert with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "work_orders_update_company" on public.work_orders
  for update using (company_id = (auth.jwt() ->> 'company_id')::uuid)
  with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "work_orders_delete_company" on public.work_orders
  for delete using (company_id = (auth.jwt() ->> 'company_id')::uuid);

create policy "pm_schedules_select_company" on public.pm_schedules
  for select using (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "pm_schedules_insert_company" on public.pm_schedules
  for insert with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "pm_schedules_update_company" on public.pm_schedules
  for update using (company_id = (auth.jwt() ->> 'company_id')::uuid)
  with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "pm_schedules_delete_company" on public.pm_schedules
  for delete using (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- pm_completions: via schedule's company
create policy "pm_completions_select_company" on public.pm_completions
  for select using (
    exists (
      select 1 from public.pm_schedules s
      where s.id = pm_completions.pm_schedule_id
        and s.company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );
create policy "pm_completions_insert_company" on public.pm_completions
  for insert with check (
    exists (
      select 1 from public.pm_schedules s
      where s.id = pm_completions.pm_schedule_id
        and s.company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );
create policy "pm_completions_update_company" on public.pm_completions
  for update using (
    exists (
      select 1 from public.pm_schedules s
      where s.id = pm_completions.pm_schedule_id
        and s.company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  )
  with check (
    exists (
      select 1 from public.pm_schedules s
      where s.id = pm_completions.pm_schedule_id
        and s.company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );
create policy "pm_completions_delete_company" on public.pm_completions
  for delete using (
    exists (
      select 1 from public.pm_schedules s
      where s.id = pm_completions.pm_schedule_id
        and s.company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );

create policy "parts_inventory_select_company" on public.parts_inventory
  for select using (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "parts_inventory_insert_company" on public.parts_inventory
  for insert with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "parts_inventory_update_company" on public.parts_inventory
  for update using (company_id = (auth.jwt() ->> 'company_id')::uuid)
  with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "parts_inventory_delete_company" on public.parts_inventory
  for delete using (company_id = (auth.jwt() ->> 'company_id')::uuid);

create policy "shift_handoffs_select_company" on public.shift_handoffs
  for select using (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "shift_handoffs_insert_company" on public.shift_handoffs
  for insert with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "shift_handoffs_update_company" on public.shift_handoffs
  for update using (company_id = (auth.jwt() ->> 'company_id')::uuid)
  with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "shift_handoffs_delete_company" on public.shift_handoffs
  for delete using (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- work_order_counters: via company
create policy "work_order_counters_select_company" on public.work_order_counters
  for select using (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "work_order_counters_insert_company" on public.work_order_counters
  for insert with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "work_order_counters_update_company" on public.work_order_counters
  for update using (company_id = (auth.jwt() ->> 'company_id')::uuid)
  with check (company_id = (auth.jwt() ->> 'company_id')::uuid);
create policy "work_order_counters_delete_company" on public.work_order_counters
  for delete using (company_id = (auth.jwt() ->> 'company_id')::uuid);
