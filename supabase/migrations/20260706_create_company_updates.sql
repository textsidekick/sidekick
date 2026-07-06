create table if not exists public.company_updates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  author_name text,
  source text not null default 'dashboard',
  message text not null,
  assistant_response text,
  summary text,
  applied_changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_company_updates_company_created
  on public.company_updates(company_id, created_at desc);
