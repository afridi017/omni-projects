-- ============================================================
-- HUJRA 2.0 — Supabase SQL schema
-- Run once in the Supabase SQL Editor.
-- Realtime: rooms table (ROW-level data broadcast via
--   postgres_changes). The app uses a single "rooms" table with
--   an envelope `data` column to keep the wire format identical
--   to the demo-mode store (standard, self-describing JSONB).
-- ============================================================

create table if not exists public.rooms (
  id text primary key,
  code text not null default '',
  name text not null,
  topic text not null default '',
  host text not null default '',
  category text not null default 'Late Night Gup',
  emoji text not null default '🍵',
  energy integer not null default 1,
  status text not null default 'live'
    check (status in ('live', 'ended')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_status_idx on public.rooms (status);
create index if not exists rooms_created_idx on public.rooms (created_at desc);

-- Realtime broadcast for the whole rooms table.
alter publication supabase_realtime add table public.rooms;

-- Touch updated_at on every change.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists rooms_touch on public.rooms;
create trigger rooms_touch before update on public.rooms
for each row execute function public.touch_updated_at();

-- Optional: allow anonymous writes so clients can upsert rooms
-- without Firebase-style auth. For production lock this down
-- (e.g. only allow writes where auth.uid() = host_id).
alter table public.rooms enable row level security;
drop policy if exists "anon can read rooms" on public.rooms;
create policy "anon can read rooms" on public.rooms
  for select using (true);
drop policy if exists "anon can insert rooms" on public.rooms;
create policy "anon can insert rooms" on public.rooms
  for insert with check (true);
drop policy if exists "anon can update rooms" on public.rooms;
create policy "anon can update rooms" on public.rooms
  for update using (true);

-- ============================================================
-- SEED — 3 demo hujras
-- ============================================================
insert into public.rooms (id, code, name, topic, host, category, emoji, energy, data) values
('demo-tapay', 'TAPY', 'Tapay Night', 'Swag, tapay, aur chai — raat ki baat 🎤', 'Afridi Bhai', 'Tapay Night', '🎤', 5, '{}'::jsonb),
('demo-cricket', 'CRICK', 'Cricket Talk', 'Match dekh kar aao, panga yahan bhi lagega 🏏', 'Baaz Khan', 'Cricket Talk', '🏏', 3, '{}'::jsonb),
('demo-night', 'GUPN', 'Late Night Gup', '2 baje tak ki gup — no judgement zone 🌙', 'Janumer', 'Late Night Gup', '🌙', 1, '{}'::jsonb)
on conflict (id) do nothing;