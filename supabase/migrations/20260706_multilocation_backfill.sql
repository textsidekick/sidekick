-- Backfill default locations and attach existing company-scoped records.
-- Safe to run multiple times.

insert into public.locations (id, company_id, name, address, is_primary)
select
  'loc_' || c.id,
  c.id,
  coalesce(nullif(trim(c.name), ''), 'Primary Site'),
  null,
  true
from public.companies c
where not exists (
  select 1 from public.locations l where l.company_id = c.id
);

with primary_locations as (
  select distinct on (company_id) company_id, id
  from public.locations
  order by company_id, is_primary desc, created_at asc, id asc
)
update public.workers w
set location_id = p.id
from primary_locations p
where w.company_id = p.company_id and w.location_id is null;

with primary_locations as (
  select distinct on (company_id) company_id, id
  from public.locations
  order by company_id, is_primary desc, created_at asc, id asc
)
update public.assets a
set location_id = p.id
from primary_locations p
where a.company_id = p.company_id and a.location_id is null;

with primary_locations as (
  select distinct on (company_id) company_id, id
  from public.locations
  order by company_id, is_primary desc, created_at asc, id asc
)
update public.work_orders w
set location_id = p.id
from primary_locations p
where w.company_id = p.company_id and w.location_id is null;

with primary_locations as (
  select distinct on (company_id) company_id, id
  from public.locations
  order by company_id, is_primary desc, created_at asc, id asc
)
update public.pm_schedules pms
set location_id = p.id
from primary_locations p
where pms.company_id = p.company_id and pms.location_id is null;

with primary_locations as (
  select distinct on (company_id) company_id, id
  from public.locations
  order by company_id, is_primary desc, created_at asc, id asc
)
update public.parts_inventory pi
set location_id = p.id
from primary_locations p
where pi.company_id = p.company_id and pi.location_id is null;

with primary_locations as (
  select distinct on (company_id) company_id, id
  from public.locations
  order by company_id, is_primary desc, created_at asc, id asc
)
update public.shift_handoffs sh
set location_id = p.id
from primary_locations p
where sh.company_id = p.company_id and sh.location_id is null;
