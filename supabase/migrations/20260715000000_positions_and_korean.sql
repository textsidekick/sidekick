-- ============================================================
-- Ace Bed: Role-based onboarding (positions) + Korean support
--
--  * positions              — company job positions (직무)
--  * position_sops          — SOPs required per position (by slug, versioned)
--  * position_training_paths— training paths auto-assigned per position
--  * position_knowledge     — knowledge articles tagged to positions
--  * workers.position_id    — worker → position link
--  * workers.position_prompted_at — SMS position-onboarding state
-- ============================================================

-- ─── Positions ───────────────────────────────────────────────
create table if not exists public.positions (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null,
  department_id   uuid references public.departments(id) on delete set null,
  name            text not null,                    -- e.g. '매트리스 봉제 기사'
  name_en         text,                             -- e.g. 'Mattress Sewing Technician'
  description     text not null default '',
  required_skills text[] not null default '{}',     -- e.g. {'재봉기 운용','원단 취급'}
  headcount_target integer,                         -- optional planned headcount
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (company_id, name)
);

create index if not exists idx_positions_company on public.positions (company_id);
create index if not exists idx_positions_department on public.positions (department_id);

-- FTS with 'simple' config → Korean tokens are preserved intact
alter table public.positions add column if not exists search_tsv tsvector
  generated always as (
    to_tsvector('simple',
      coalesce(name,'') || ' ' || coalesce(name_en,'') || ' ' ||
      coalesce(description,'') || ' ' || array_to_string(required_skills, ' '))
  ) stored;
create index if not exists idx_positions_search on public.positions using gin (search_tsv);

create trigger positions_set_updated_at
before update on public.positions
for each row execute function public.set_updated_at();

-- ─── Position ↔ SOP mapping (by slug — SOPs are versioned) ───
create table if not exists public.position_sops (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null,
  position_id uuid not null references public.positions(id) on delete cascade,
  sop_slug    text not null,
  required    boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (position_id, sop_slug)
);
create index if not exists idx_position_sops_position on public.position_sops (position_id);
create index if not exists idx_position_sops_company_slug on public.position_sops (company_id, sop_slug);

-- ─── Position ↔ Training path mapping ────────────────────────
create table if not exists public.position_training_paths (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null,
  position_id      uuid not null references public.positions(id) on delete cascade,
  training_path_id uuid not null references public.training_paths(id) on delete cascade,
  auto_enroll      boolean not null default true,   -- enroll new hires automatically
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  unique (position_id, training_path_id)
);
create index if not exists idx_position_paths_position on public.position_training_paths (position_id);
create index if not exists idx_position_paths_path on public.position_training_paths (training_path_id);

-- ─── Position ↔ Knowledge article tagging ────────────────────
create table if not exists public.position_knowledge (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null,
  position_id uuid not null references public.positions(id) on delete cascade,
  article_id  uuid not null,
  created_at  timestamptz not null default now(),
  unique (position_id, article_id)
);
create index if not exists idx_position_knowledge_position on public.position_knowledge (position_id);

-- ─── Workers: position link + SMS position-onboarding state ──
alter table public.workers add column if not exists position_id uuid references public.positions(id) on delete set null;
alter table public.workers add column if not exists position_name text;          -- denormalized for fast prompt building
alter table public.workers add column if not exists position_prompted_at timestamptz; -- when we asked "what's your position?" over SMS
create index if not exists idx_workers_position on public.workers (position_id);

-- ─── SMS onboarding sessions may carry position choice ───────
-- (onboarding_sessions.data JSONB already covers this — no schema change needed)

-- ─── Korean language defaults for Ace Bed rollouts ───────────
-- companies.default_language / workers.preferred_language already exist
-- (20260706_schema_alignment_hotfix.sql). Nothing further required here.
