create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_profiles_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data ->> 'role', 'user')
  )
  on conflict (id) do update
    set email = excluded.email,
        role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

insert into public.profiles (id, email, role)
select
  u.id,
  u.email,
  coalesce(u.raw_app_meta_data ->> 'role', 'user')
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      role = excluded.role;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_select_all_for_admin" on public.profiles;
create policy "profiles_select_all_for_admin"
on public.profiles
for select
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
);

drop policy if exists "profiles_update_own_email" on public.profiles;
create policy "profiles_update_own_email"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select p.role from public.profiles p where p.id = auth.uid())
);

drop policy if exists "tours_admin_select_all" on public.tours;
create policy "tours_admin_select_all"
on public.tours
for select
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
);

drop policy if exists "tours_admin_update_all" on public.tours;
create policy "tours_admin_update_all"
on public.tours
for update
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
);
