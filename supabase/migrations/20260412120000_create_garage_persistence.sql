begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.garage_bikes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_bike_id text null,
  make text not null,
  model text not null,
  year integer not null check (year between 1900 and 2100),
  variant text null,
  nickname text null,
  ownership_status text null,
  is_archived boolean not null default false,
  hero_image_url text null,
  cover_photo_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint garage_bikes_ownership_status_check
    check (
      ownership_status is null
      or ownership_status in ('Owned', 'In service', 'Previously owned', 'Wishlist')
    )
);

create table if not exists public.garage_builds (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  bike_id text not null references public.garage_bikes(id) on delete cascade,
  name text not null,
  status text not null default 'Saved',
  build_type text not null default 'Personal Build',
  is_primary boolean not null default false,
  is_archived boolean not null default false,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint garage_builds_status_check
    check (status in ('Draft', 'Saved', 'Archived')),
  constraint garage_builds_build_type_check
    check (build_type in ('Personal Build', 'Expert Match', 'Travel Setup', 'Daily Setup'))
);

create table if not exists public.garage_build_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  build_id text not null references public.garage_builds(id) on delete cascade,
  product_id bigint not null,
  product_snapshot jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint garage_build_items_snapshot_object_check
    check (jsonb_typeof(product_snapshot) = 'object')
);

create index if not exists garage_bikes_user_id_idx
  on public.garage_bikes(user_id);

create index if not exists garage_bikes_user_active_idx
  on public.garage_bikes(user_id, updated_at desc)
  where is_archived = false;

create index if not exists garage_builds_bike_id_idx
  on public.garage_builds(bike_id);

create index if not exists garage_builds_user_bike_idx
  on public.garage_builds(user_id, bike_id, updated_at desc);

create index if not exists garage_builds_active_bike_idx
  on public.garage_builds(bike_id, updated_at desc)
  where is_archived = false;

create unique index if not exists garage_builds_one_primary_per_bike_idx
  on public.garage_builds(user_id, bike_id)
  where is_primary = true and is_archived = false;

create index if not exists garage_build_items_build_id_idx
  on public.garage_build_items(build_id, sort_order);

create index if not exists garage_build_items_user_id_idx
  on public.garage_build_items(user_id);

drop trigger if exists set_garage_bikes_updated_at on public.garage_bikes;
create trigger set_garage_bikes_updated_at
before update on public.garage_bikes
for each row
execute function public.set_updated_at();

drop trigger if exists set_garage_builds_updated_at on public.garage_builds;
create trigger set_garage_builds_updated_at
before update on public.garage_builds
for each row
execute function public.set_updated_at();

alter table public.garage_bikes enable row level security;
alter table public.garage_builds enable row level security;
alter table public.garage_build_items enable row level security;

drop policy if exists "garage_bikes_select_own" on public.garage_bikes;
create policy "garage_bikes_select_own"
on public.garage_bikes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_bikes_insert_own" on public.garage_bikes;
create policy "garage_bikes_insert_own"
on public.garage_bikes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "garage_bikes_update_own" on public.garage_bikes;
create policy "garage_bikes_update_own"
on public.garage_bikes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "garage_bikes_delete_own" on public.garage_bikes;
create policy "garage_bikes_delete_own"
on public.garage_bikes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_builds_select_own" on public.garage_builds;
create policy "garage_builds_select_own"
on public.garage_builds
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_builds_insert_own" on public.garage_builds;
create policy "garage_builds_insert_own"
on public.garage_builds
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes b
    where b.id = bike_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "garage_builds_update_own" on public.garage_builds;
create policy "garage_builds_update_own"
on public.garage_builds
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes b
    where b.id = bike_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "garage_builds_delete_own" on public.garage_builds;
create policy "garage_builds_delete_own"
on public.garage_builds
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_build_items_select_own" on public.garage_build_items;
create policy "garage_build_items_select_own"
on public.garage_build_items
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_build_items_insert_own" on public.garage_build_items;
create policy "garage_build_items_insert_own"
on public.garage_build_items
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_builds gb
    where gb.id = build_id
      and gb.user_id = auth.uid()
  )
);

drop policy if exists "garage_build_items_update_own" on public.garage_build_items;
create policy "garage_build_items_update_own"
on public.garage_build_items
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_builds gb
    where gb.id = build_id
      and gb.user_id = auth.uid()
  )
);

drop policy if exists "garage_build_items_delete_own" on public.garage_build_items;
create policy "garage_build_items_delete_own"
on public.garage_build_items
for delete
to authenticated
using (auth.uid() = user_id);

commit;
