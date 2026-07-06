create table if not exists public.sms_inbound_messages (
  message_sid text primary key,
  from_phone text not null,
  channel text not null default 'sms',
  body text,
  received_at timestamptz not null default now()
);

create index if not exists sms_inbound_messages_from_phone_received_at_idx
  on public.sms_inbound_messages (from_phone, received_at desc);
