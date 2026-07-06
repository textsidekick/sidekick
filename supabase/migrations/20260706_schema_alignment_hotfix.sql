alter table public.knowledge_articles
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.knowledge_articles
set metadata = '{}'::jsonb
where metadata is null;

alter table public.work_orders
  add column if not exists assigned_to_phone text;

alter table public.workers
  add column if not exists preferred_language text;

alter table public.companies
  add column if not exists default_language text not null default 'en';

alter table public.companies
  add column if not exists preferred_channel text not null default 'sms';

alter table public.questions
  add column if not exists channel text default 'sms';

alter table public.questions
  add column if not exists topic text;

update public.questions
set channel = 'sms'
where channel is null;
