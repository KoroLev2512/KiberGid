create extension if not exists pgcrypto;

create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  introduction text not null default '',
  conclusion text not null default '',
  locale text not null default 'ru',
  country text not null default '',
  city text not null default '',
  categories text[] not null default '{}',
  start_point jsonb not null default '{}'::jsonb,
  end_point jsonb not null default '{}'::jsonb,
  end_same_as_start boolean not null default false,
  steps jsonb not null default '[]'::jsonb,
  has_ticket boolean not null default false,
  ticket_price numeric(10, 2),
  ticket_currency text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tours_owner_id_idx on public.tours (owner_id);
create index if not exists tours_owner_updated_idx on public.tours (owner_id, updated_at desc);

create or replace function public.handle_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tours_updated_at on public.tours;
create trigger trg_tours_updated_at
before update on public.tours
for each row
execute function public.handle_set_updated_at();

alter table public.tours enable row level security;

drop policy if exists "tours_select_own" on public.tours;
create policy "tours_select_own"
on public.tours
for select
using (auth.uid() = owner_id);

drop policy if exists "tours_insert_own" on public.tours;
create policy "tours_insert_own"
on public.tours
for insert
with check (auth.uid() = owner_id);

drop policy if exists "tours_update_own" on public.tours;
create policy "tours_update_own"
on public.tours
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "tours_delete_own" on public.tours;
create policy "tours_delete_own"
on public.tours
for delete
using (auth.uid() = owner_id);
