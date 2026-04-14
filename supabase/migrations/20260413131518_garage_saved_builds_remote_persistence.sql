begin;

create extension if not exists pgcrypto;

alter table if exists public.garage_bikes
  add column if not exists garage_bike_name text null;

update public.garage_bikes
set garage_bike_name = nickname
where garage_bike_name is null
  and nickname is not null;

alter table if exists public.garage_builds
  add column if not exists provenance_json jsonb null,
  add column if not exists version_json jsonb null,
  add column if not exists version_summary_json jsonb null,
  add column if not exists lineage_json jsonb null,
  add column if not exists history_json jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('garage-build-photos', 'garage-build-photos', true)
on conflict (id) do nothing;

create table if not exists public.garage_build_photos (
  id uuid primary key default gen_random_uuid(),
  build_id text not null references public.garage_builds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  storage_path text null,
  caption text null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  constraint garage_build_photos_storage_path_unique unique (storage_path)
);

create index if not exists garage_build_photos_build_id_idx
  on public.garage_build_photos(build_id, sort_order);

create index if not exists garage_build_photos_user_id_idx
  on public.garage_build_photos(user_id);

create unique index if not exists garage_build_photos_one_cover_per_build_idx
  on public.garage_build_photos(user_id, build_id)
  where is_cover = true;

alter table public.garage_build_photos enable row level security;

drop policy if exists "garage_build_photos_select_own" on public.garage_build_photos;
create policy "garage_build_photos_select_own"
on public.garage_build_photos
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_build_photos_insert_own" on public.garage_build_photos;
create policy "garage_build_photos_insert_own"
on public.garage_build_photos
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

drop policy if exists "garage_build_photos_update_own" on public.garage_build_photos;
create policy "garage_build_photos_update_own"
on public.garage_build_photos
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

drop policy if exists "garage_build_photos_delete_own" on public.garage_build_photos;
create policy "garage_build_photos_delete_own"
on public.garage_build_photos
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "garage_build_photos_storage_read" on storage.objects;
create policy "garage_build_photos_storage_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'garage-build-photos');

drop policy if exists "garage_build_photos_storage_insert" on storage.objects;
create policy "garage_build_photos_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'garage-build-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "garage_build_photos_storage_update" on storage.objects;
create policy "garage_build_photos_storage_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'garage-build-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'garage-build-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "garage_build_photos_storage_delete" on storage.objects;
create policy "garage_build_photos_storage_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'garage-build-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

commit;
