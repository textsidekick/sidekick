-- Multi-location foundation for Sidekick
-- Keeps one company/org, with multiple sites underneath.

create table if not exists public.locations (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  city text,
  state text,
  address text,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists locations_company_id_idx on public.locations(company_id);
create unique index if not exists locations_company_name_idx on public.locations(company_id, lower(name));

alter table public.assets add column if not exists location_id text references public.locations(id) on delete set null;
alter table public.work_orders add column if not exists location_id text references public.locations(id) on delete set null;
alter table public.pm_schedules add column if not exists location_id text references public.locations(id) on delete set null;
alter table public.parts_inventory add column if not exists location_id text references public.locations(id) on delete set null;
alter table public.shift_handoffs add column if not exists location_id text references public.locations(id) on delete set null;
alter table public.workers add column if not exists location_id text references public.locations(id) on delete set null;

create index if not exists assets_location_id_idx on public.assets(location_id);
create index if not exists work_orders_location_id_idx on public.work_orders(location_id);
create index if not exists pm_schedules_location_id_idx on public.pm_schedules(location_id);
create index if not exists parts_inventory_location_id_idx on public.parts_inventory(location_id);
create index if not exists shift_handoffs_location_id_idx on public.shift_handoffs(location_id);
create index if not exists workers_location_id_idx on public.workers(location_id);
