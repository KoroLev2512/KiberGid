create extension if not exists pgcrypto;

alter table if exists public.routes
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists title text default '',
  add column if not exists introduction text default '',
  add column if not exists conclusion text default '',
  add column if not exists locale text default 'ru',
  add column if not exists country text default '',
  add column if not exists city text default '',
  add column if not exists categories text[] default '{}',
  add column if not exists start_point jsonb default '{}'::jsonb,
  add column if not exists end_point jsonb default '{}'::jsonb,
  add column if not exists end_same_as_start boolean default false,
  add column if not exists steps jsonb default '[]'::jsonb,
  add column if not exists has_ticket boolean default false,
  add column if not exists ticket_price numeric(10, 2),
  add column if not exists ticket_currency text,
  add column if not exists status text default 'draft',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create or replace function public.handle_routes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_routes_updated_at on public.routes;
create trigger trg_routes_updated_at
before update on public.routes
for each row
execute function public.handle_routes_updated_at();

alter table if exists public.routes enable row level security;

drop policy if exists "routes_select_own" on public.routes;
create policy "routes_select_own"
on public.routes
for select
using (auth.uid() = owner_id);

drop policy if exists "routes_insert_own" on public.routes;
create policy "routes_insert_own"
on public.routes
for insert
with check (auth.uid() = owner_id);

drop policy if exists "routes_update_own" on public.routes;
create policy "routes_update_own"
on public.routes
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "routes_delete_own" on public.routes;
create policy "routes_delete_own"
on public.routes
for delete
using (auth.uid() = owner_id);

drop policy if exists "routes_admin_select_all" on public.routes;
create policy "routes_admin_select_all"
on public.routes
for select
using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

drop policy if exists "routes_admin_update_all" on public.routes;
create policy "routes_admin_update_all"
on public.routes
for update
using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin')
with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');
