-- KakaoTalk channel + position onboarding schema
-- Safe to run on existing databases (IF NOT EXISTS everywhere).

-- Map a Kakao i Open Builder bot to a Sidekick company
create table if not exists kakao_channels (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  bot_id text not null unique,           -- Kakao i Open Builder bot ID
  channel_public_id text,               -- 카카오톡 채널 ID (@acebed 등)
  created_at timestamptz not null default now()
);

-- Link a Kakao botUserKey to a worker phone (Kakao does not expose phone numbers)
create table if not exists kakao_worker_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  kakao_user_key text not null,          -- userRequest.user.id (botUserKey)
  plusfriend_user_key text,              -- channel-scoped key, if provided
  worker_phone text not null,
  linked_at timestamptz not null default now(),
  unique (company_id, kakao_user_key)
);
create index if not exists idx_kakao_worker_links_key on kakao_worker_links (kakao_user_key);

-- Rotating OAuth tokens (Kakao rotates refresh tokens)
create table if not exists service_tokens (
  provider text primary key,             -- 'kakao'
  refresh_token text,
  updated_at timestamptz not null default now()
);

-- Positions (직무)
create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  department_id uuid references departments(id) on delete set null,
  name text not null,                    -- 매트리스 봉제 기사
  name_en text,                          -- Mattress Sewing Technician
  description text default '',
  required_skills text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

create table if not exists position_sops (
  position_id uuid not null references positions(id) on delete cascade,
  sop_slug text not null,
  required boolean not null default true,
  sort_order int not null default 0,
  primary key (position_id, sop_slug)
);

create table if not exists position_training_paths (
  position_id uuid not null references positions(id) on delete cascade,
  training_path_id uuid not null references training_paths(id) on delete cascade,
  auto_enroll boolean not null default true,
  sort_order int not null default 0,
  primary key (position_id, training_path_id)
);

create table if not exists training_enrollments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  worker_id uuid not null references workers(id) on delete cascade,
  training_path_id uuid not null references training_paths(id) on delete cascade,
  status text not null default 'active', -- active | completed | dropped
  enrolled_via text not null default 'manual', -- manual | position_auto
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (worker_id, training_path_id)
);

-- Worker columns used by position onboarding
alter table workers add column if not exists position_id uuid references positions(id) on delete set null;
alter table workers add column if not exists onboarding_stage text; -- 'position_selection' | null
alter table workers add column if not exists preferred_language text; -- 'ko' | 'en' | ...
