-- Harden public schema tables after Supabase flagged rls_disabled_in_public.
-- Public pages may read visible works content, but contact inquiries must only
-- be accessed by Edge Functions using the service role.

alter table public.contact_inquiries enable row level security;
alter table public.contact_inquiries force row level security;

alter table public.works_categories enable row level security;
alter table public.works_categories force row level security;

alter table public.works_images enable row level security;
alter table public.works_images force row level security;

revoke all on table public.contact_inquiries from public;
revoke all on table public.contact_inquiries from anon, authenticated;
grant all on table public.contact_inquiries to service_role;

revoke insert, update, delete on table public.works_categories from public;
revoke insert, update, delete on table public.works_categories from anon, authenticated;
grant select on table public.works_categories to anon, authenticated;
grant all on table public.works_categories to service_role;

revoke insert, update, delete on table public.works_images from public;
revoke insert, update, delete on table public.works_images from anon, authenticated;
grant select on table public.works_images to anon, authenticated;
grant all on table public.works_images to service_role;

do $$
declare
  existing_policy text;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_inquiries'
  loop
    execute format('drop policy if exists %I on public.contact_inquiries', existing_policy);
  end loop;
end $$;

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
  'Stores website contact inquiries. Direct anon/authenticated access is blocked by RLS; Edge Functions use service_role.';
