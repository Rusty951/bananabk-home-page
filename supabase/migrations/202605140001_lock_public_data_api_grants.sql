-- Keep Data API exposure explicit for Supabase's 2026 public schema grant change.
-- Public pages only need to read works content. Contact inquiries stay service-role only.

alter table public.contact_inquiries enable row level security;
alter table public.contact_inquiries force row level security;

alter table public.works_categories enable row level security;
alter table public.works_categories force row level security;

alter table public.works_images enable row level security;
alter table public.works_images force row level security;

revoke all on table public.contact_inquiries from public;
revoke all on table public.contact_inquiries from anon, authenticated;
grant all on table public.contact_inquiries to service_role;

revoke all on table public.works_categories from public;
revoke all on table public.works_categories from anon, authenticated;
grant select on table public.works_categories to anon, authenticated;
grant all on table public.works_categories to service_role;

revoke all on table public.works_images from public;
revoke all on table public.works_images from anon, authenticated;
grant select on table public.works_images to anon, authenticated;
grant all on table public.works_images to service_role;

drop policy if exists "public can read works categories"
  on public.works_categories;

create policy "public can read works categories"
  on public.works_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public can read visible works images"
  on public.works_images;

create policy "public can read visible works images"
  on public.works_images
  for select
  to anon, authenticated
  using (is_visible = true);

comment on table public.contact_inquiries is
  'Stores website contact inquiries. Direct anon/authenticated access is blocked; Edge Functions use service_role.';

comment on table public.works_categories is
  'Works category metadata exposed to the Data API with explicit select grants for public rendering.';

comment on table public.works_images is
  'Works image metadata exposed to the Data API with explicit select grants and RLS filtering visible rows.';
