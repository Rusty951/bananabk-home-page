create extension if not exists pgcrypto;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  brand_name text,
  contact_name text not null,
  email text not null,
  phone text not null,
  message text not null,
  privacy_agreed boolean not null default true,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'replied', 'done')),
  admin_memo text,
  source_page text not null default 'contact',
  notification_sent boolean not null default false,
  notification_sent_at timestamptz,
  constraint contact_inquiries_privacy_agreed_check
    check (privacy_agreed = true)
);

create index if not exists idx_contact_inquiries_created_at
  on public.contact_inquiries (created_at desc);

create index if not exists idx_contact_inquiries_status
  on public.contact_inquiries (status);

create index if not exists idx_contact_inquiries_notification_sent
  on public.contact_inquiries (notification_sent);

alter table public.contact_inquiries enable row level security;

comment on table public.contact_inquiries is
  'Stores website contact inquiries before any downstream notification succeeds or fails.';
