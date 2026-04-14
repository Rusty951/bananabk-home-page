create table if not exists public.works_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  title text not null,
  description text,
  is_public boolean not null default true,
  sort_order integer not null default 100
);

create table if not exists public.works_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category_slug text not null references public.works_categories(slug)
    on update cascade on delete restrict,
  image_path text not null,
  image_url text,
  sort_order integer not null default 100,
  caption text,
  is_visible boolean not null default true
);

create index if not exists idx_works_categories_public_sort
  on public.works_categories (is_public, sort_order, slug);

create index if not exists idx_works_images_category_sort
  on public.works_images (category_slug, is_visible, sort_order, created_at);

create index if not exists idx_works_images_visible
  on public.works_images (is_visible);

alter table public.works_categories enable row level security;
alter table public.works_images enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'works_categories'
      and policyname = 'public can read works categories'
  ) then
    create policy "public can read works categories"
      on public.works_categories
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'works_images'
      and policyname = 'public can read visible works images'
  ) then
    create policy "public can read visible works images"
      on public.works_images
      for select
      to anon, authenticated
      using (is_visible = true);
  end if;
end $$;

insert into public.works_categories (slug, name, title, description, is_public, sort_order)
values
  ('product', 'Product', 'Product', '제품 촬영', true, 10),
  ('food', 'Food', 'Food', '푸드 촬영', true, 20),
  ('dessert', 'Dessert', 'Dessert', '디저트 촬영', true, 30),
  ('space', 'Space', 'Space', '공간 촬영', true, 40),
  ('portrait', 'Portrait', 'Portrait', '인물 촬영', true, 50),
  ('portrait-private', 'Portrait Private', 'Portrait Private', '비공개 인물 촬영', false, 60)
on conflict (slug) do update
set
  name = excluded.name,
  title = excluded.title,
  description = excluded.description,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;
