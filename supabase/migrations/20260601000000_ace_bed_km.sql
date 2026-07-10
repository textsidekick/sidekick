-- ============================================================
-- Ace Bed KM tailoring: departments, versioned SOPs,
-- terminology glossary, training, knowledge usage events
-- ============================================================

-- ─── Departments (cross-department applicability) ───────────
create table if not exists departments (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null,
  name        text not null,
  color       text not null default '#C96442',
  created_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index if not exists idx_departments_company on departments (company_id);

-- ─── SOPs: append-only versions grouped by slug ──────────────
create table if not exists sops (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null,
  slug            text not null,                 -- stable id across versions
  title           text not null,
  description     text not null default '',
  content         text not null,
  version_number  integer not null default 1,
  is_current      boolean not null default true,
  status          text not null default 'draft'
                  check (status in ('draft','active','deprecated')),
  change_summary  text not null default '',
  tags            text[] not null default '{}',
  language        text not null default 'ko',
  category        text not null default '',
  department_id   uuid references departments (id) on delete set null,
  created_by      text not null default '',
  approved_by     text not null default '',
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_sops_company_slug on sops (company_id, slug);
create index if not exists idx_sops_department on sops (department_id);
-- Exactly one current version per SOP
create unique index if not exists uq_sops_one_current
  on sops (company_id, slug) where is_current;

-- FTS over current SOPs. 'simple' config keeps Korean tokens intact.
alter table sops add column if not exists search_tsv tsvector
  generated always as (
    to_tsvector('simple',
      coalesce(title,'') || ' ' || coalesce(description,'') || ' ' ||
      coalesce(content,'') || ' ' || array_to_string(tags, ' '))
  ) stored;
create index if not exists idx_sops_search on sops using gin (search_tsv);

-- Atomic version bump
create or replace function create_sop_version(
  p_sop_id uuid,
  p_content text,
  p_title text,
  p_description text,
  p_change_summary text,
  p_created_by text
) returns sops
language plpgsql
as $$
declare
  v_prev sops;
  v_new sops;
begin
  select * into v_prev from sops where id = p_sop_id for update;
  if not found then
    raise exception 'SOP % not found', p_sop_id;
  end if;

  update sops set is_current = false, updated_at = now()
    where company_id = v_prev.company_id and slug = v_prev.slug and is_current;

  insert into sops (
    company_id, slug, title, description, content, version_number,
    is_current, status, change_summary, tags, language, category,
    department_id, created_by
  ) values (
    v_prev.company_id, v_prev.slug,
    coalesce(nullif(p_title,''), v_prev.title),
    coalesce(nullif(p_description,''), v_prev.description),
    p_content,
    (select max(version_number) + 1 from sops
      where company_id = v_prev.company_id and slug = v_prev.slug),
    true, 'draft', coalesce(p_change_summary,''),
    v_prev.tags, v_prev.language, v_prev.category,
    v_prev.department_id, coalesce(p_created_by,'')
  ) returning * into v_new;

  return v_new;
end;
$$;

-- ─── Terminology / industry lingo glossary ───────────────────
create table if not exists terminology (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null,
  term          text not null,          -- canonical term, e.g. "본딩기"
  synonyms      text[] not null default '{}',  -- e.g. {"접착기","bonding machine","본딩"}
  definition    text not null default '',
  language      text not null default 'ko',
  department_id uuid references departments (id) on delete set null,
  created_by    text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (company_id, term)
);
create index if not exists idx_terminology_company on terminology (company_id);

-- ─── Training plans & assignments ─────────────────────────────
create table if not exists training_plans (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null,
  title         text not null,
  description   text not null default '',
  department_id uuid references departments (id) on delete set null,
  role          text not null default '',       -- e.g. operator, technician
  is_active     boolean not null default true,
  created_by    text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_training_plans_company on training_plans (company_id);

create table if not exists training_plan_steps (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references training_plans (id) on delete cascade,
  step_order  integer not null default 0,
  kind        text not null default 'sop'
              check (kind in ('sop','knowledge','checklist','note')),
  ref_slug    text,                              -- sop slug or knowledge id
  title       text not null,
  instructions text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists idx_training_steps_plan on training_plan_steps (plan_id, step_order);

create table if not exists training_assignments (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null,
  plan_id       uuid not null references training_plans (id) on delete cascade,
  worker_phone  text not null,
  worker_name   text not null default '',
  status        text not null default 'assigned'
                check (status in ('assigned','in_progress','completed')),
  assigned_by   text not null default '',
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (plan_id, worker_phone)
);
create index if not exists idx_training_assignments_company
  on training_assignments (company_id, status);

create table if not exists training_step_completions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references training_assignments (id) on delete cascade,
  step_id       uuid not null references training_plan_steps (id) on delete cascade,
  completed_at  timestamptz not null default now(),
  verified_by   text not null default '',
  unique (assignment_id, step_id)
);

-- ─── Knowledge usage events (KM culture metrics) ─────────────
create table if not exists knowledge_events (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null,
  source_type   text not null check (source_type in ('sop','knowledge')),
  source_id     uuid not null,
  event         text not null
                check (event in ('sms_answer','dashboard_view','training_reference','contribution')),
  worker_phone  text,
  department_id uuid references departments (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_knowledge_events_company
  on knowledge_events (company_id, created_at desc);
create index if not exists idx_knowledge_events_source
  on knowledge_events (source_type, source_id);

-- RLS: server uses service-role key which bypasses RLS; lock down anon.
alter table departments enable row level security;
alter table sops enable row level security;
alter table terminology enable row level security;
alter table training_plans enable row level security;
alter table training_plan_steps enable row level security;
alter table training_assignments enable row level security;
alter table training_step_completions enable row level security;
alter table knowledge_events enable row level security;
