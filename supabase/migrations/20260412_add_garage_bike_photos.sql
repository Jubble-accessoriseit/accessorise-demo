begin;

create extension if not exists pgcrypto;

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

insert into storage.buckets (id, name, public)
values ('garage-bike-photos', 'garage-bike-photos', true)
on conflict (id) do nothing;

create table if not exists public.garage_bike_photos (
  id uuid primary key default gen_random_uuid(),
  bike_id text not null references public.garage_bikes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  storage_path text null,
  caption text null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  constraint garage_bike_photos_storage_path_unique unique (storage_path)
);

create index if not exists garage_bike_photos_bike_id_idx
  on public.garage_bike_photos(bike_id, sort_order);

create index if not exists garage_bike_photos_user_id_idx
  on public.garage_bike_photos(user_id);

create unique index if not exists garage_bike_photos_one_cover_per_bike_idx
  on public.garage_bike_photos(user_id, bike_id)
  where is_cover = true;

alter table public.garage_bike_photos enable row level security;

drop policy if exists "garage_bike_photos_select_own" on public.garage_bike_photos;
create policy "garage_bike_photos_select_own"
on public.garage_bike_photos
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_bike_photos_insert_own" on public.garage_bike_photos;
create policy "garage_bike_photos_insert_own"
on public.garage_bike_photos
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes gb
    where gb.id = bike_id
      and gb.user_id = auth.uid()
  )
);

drop policy if exists "garage_bike_photos_update_own" on public.garage_bike_photos;
create policy "garage_bike_photos_update_own"
on public.garage_bike_photos
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes gb
    where gb.id = bike_id
      and gb.user_id = auth.uid()
  )
);

drop policy if exists "garage_bike_photos_delete_own" on public.garage_bike_photos;
create policy "garage_bike_photos_delete_own"
on public.garage_bike_photos
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_bike_photos_storage_read" on storage.objects;
create policy "garage_bike_photos_storage_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'garage-bike-photos');

drop policy if exists "garage_bike_photos_storage_insert" on storage.objects;
create policy "garage_bike_photos_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'garage-bike-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "garage_bike_photos_storage_update" on storage.objects;
create policy "garage_bike_photos_storage_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'garage-bike-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'garage-bike-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "garage_bike_photos_storage_delete" on storage.objects;
create policy "garage_bike_photos_storage_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'garage-bike-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

commit;
