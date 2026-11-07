-- Jalankan seluruh isi file ini di Supabase > SQL Editor > New query > Run

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  role text not null default 'member'
);

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- orang pertama yang mendaftar otomatis menjadi admin (daftar akunmu sendiri lebih dulu!)
  insert into profiles(id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          case when exists (select 1 from profiles) then 'member' else 'admin' end);
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

create function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create table items (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                 -- media | achievement | member | role | setting
  owner uuid default auth.uid(),
  owner_name text,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table items enable row level security;

create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles admin update" on profiles for update to authenticated using (is_admin());

create policy "items read" on items for select to authenticated using (true);
create policy "items insert" on items for insert to authenticated
  with check (owner = auth.uid() and (kind in ('media','achievement') or is_admin()));
create policy "items update" on items for update to authenticated using (is_admin());
create policy "items delete" on items for delete to authenticated
  using (is_admin() or (owner = auth.uid() and kind in ('media','achievement')));

-- Penyimpanan foto (setiap orang menyimpan di folder bernama ID-nya sendiri)
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "photos read" on storage.objects for select
  using (bucket_id = 'photos');
create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));

-- Realtime: perubahan dari satu perangkat langsung muncul di perangkat lain
alter publication supabase_realtime add table items;
