-- ============================================================
-- SABAR — X Cafe Peshawar
-- Supabase SQL schema (run in Supabase SQL Editor)
-- Tables: queues (token/status/orders), menu
-- Realtime: queues + menu (public changes)
-- ============================================================

-- ---------- MENU ----------
create table if not exists public.menu (
  id text primary key,
  name text not null,
  emoji text default '🍕',
  category text not null default 'Pizza',
  price integer not null default 0,
  desc text default '',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- QUEUES (virtual queue + orders + tokens) ----------
create table if not exists public.queues (
  id uuid primary key default gen_random_uuid(),
  token_no text not null unique,      -- A101, A102...
  phone text not null,                -- WhatsApp number
  name text not null default 'Guest',
  status text not null default 'waiting'
    check (status in ('waiting','preparing','ready','delivered','rejected')),
  items jsonb not null default '[]'::jsonb,  -- [{item_id,name,emoji,price,qty}]
  total integer not null default 0,
  called_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders table — MVP uses queues.items (jsonb) for simplicity.
-- If you want a normalized orders table later:
-- create table if not exists public.orders (
--   id uuid primary key default gen_random_uuid(),
--   queue_id uuid references public.queues(id) on delete cascade,
--   item_id text,
--   qty int,
--   price int
-- );

-- ---------- INDEXES ----------
create index if not exists queues_status_idx on public.queues (status);
create index if not exists queues_created_idx on public.queues (created_at);

-- ---------- REALTIME ----------
alter publication supabase_realtime add table public.queues;
alter publication supabase_realtime add table public.menu;

-- ---------- UPDATED_AT TRIGGER ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists queues_touch on public.queues;
create trigger queues_touch before update on public.queues
for each row execute function public.touch_updated_at();

-- ============================================================
-- SEED MENU (X Cafe Peshawar — real prices from xcafe.pk)
-- ============================================================
insert into public.menu (id, name, emoji, category, price, desc, available) values
  ('p1', 'Chicken Tikka Pizza (S)', '🍕', 'Pizza', 650, 'Classic masaledar tikka — smoky, spicy, perfect.', true),
  ('p2', 'Chicken Tikka Pizza (M)', '🍕', 'Pizza', 800, 'Smoky tikka, extra cheese.', true),
  ('p3', 'Chicken Fajita Pizza (M)', '🍕', 'Pizza', 850, 'Fajita veggies with juicy chicken & herbs.', true),
  ('p4', 'X Special Loaded Pizza (M)', '⭐', 'Pizza', 1000, 'Extra cheese + boti + tikka + fajita — sab kuch ek me.', true),
  ('b1', 'Classic Zinger', '🍔', 'Burger', 350, 'Crispy zinger fillet, mayo, lettuce — the OG.', true),
  ('b2', 'Zinger Cheese', '🧀', 'Burger', 400, 'Classic zinger + extra cheddar cheese slice.', true),
  ('b3', 'Loaded Zinger', '🍔', 'Burger', 450, 'Double fillet with cheese — heavy zaiqa, light price.', true),
  ('b4', 'Mighty Zinger', '🦾', 'Burger', 550, 'Double decker monster — fillet in fillet, cheese melt.', true),
  ('s1', 'Chicken Shawarma', '🌯', 'Shawarma', 250, 'Fresh flatbread, garlic sauce, juicy chicken.', true),
  ('s2', 'Loaded Shawarma', '🌯', 'Shawarma', 350, 'Extra chicken + cheese + fries ke saath.', true),
  ('s3', 'Zinger Shawarma', '🌯', 'Shawarma', 380, 'Crispy zinger fillet wrapped shawarma style.', true),
  ('f1', 'Fries', '🍟', 'Sides', 200, 'Crispy golden fries with ketchup.', true),
  ('f2', 'Loaded Fries', '🧀', 'Sides', 350, 'Fries with cheese sauce + garlic mayo.', true),
  ('f3', 'Nuggets (6 pcs)', '🍗', 'Sides', 350, 'Crunchy chicken nuggets — kids ki pasand.', true),
  ('f4', 'Cold Drink 250ml', '🥤', 'Sides', 100, 'Chilled — 250ml bottle.', true),
  ('d1', 'Deal 1 — Family Feast', '🔥', 'Deals', 999, '4x Loaded Zinger + 3x Shawarma + 1 Cold Drink.', true),
  ('d2', 'Deal 2 — X Mega Combo', '⚡', 'Deals', 1199, '5x Loaded Zinger + 5x Loaded Shawarma + 1.5L Drink.', true),
  ('d3', 'Budget Pizza Deal', '🍕', 'Deals', 800, 'Any Medium Pizza — sirf Rs 800. Din ka best deal!', true)
on conflict (id) do update set
  price = excluded.price,
  available = excluded.available;

-- ============================================================
-- Optional: RLS (basic)
-- ============================================================
alter table public.queues enable row level security;
alter table public.menu enable row level security;

create policy "public read queues" on public.queues for select using (true);
create policy "public insert queues" on public.queues for insert with check (true);
create policy "public update queues" on public.queues for update using (true);

create policy "public read menu" on public.menu for select using (true);
create policy "public write menu" on public.menu for all using (true) with check (true);