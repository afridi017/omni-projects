import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Replace with your Supabase project URL + anon key, or set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY || "YOUR-ANON-KEY",
  {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  },
);

export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

/**
 * Local fallback store used when Supabase isn't configured (demo mode).
 * Mirrors the queues/orders/menu shape so the app works end-to-end offline.
 */
const LOCAL_KEY = "sabar_local_db_v1";

type LocalDB = {
  queues: any[];
  menu: any[];
  counter: number;
};

const seedMenu = [
  {
    id: "p1",
    name: "Chicken Tikka Pizza (S)",
    emoji: "🍕",
    category: "Pizza",
    price: 650,
    desc: "Classic masaledar tikka — smoky, spicy, perfect.",
    available: true,
  },
  {
    id: "p2",
    name: "Chicken Tikka Pizza (M)",
    emoji: "🍕",
    category: "Pizza",
    price: 800,
    desc: "Smoky tikka, extra cheese.",
    available: true,
  },
  {
    id: "p3",
    name: "Chicken Fajita Pizza (M)",
    emoji: "🍕",
    category: "Pizza",
    price: 850,
    desc: "Fajita veggies with juicy chicken & herbs.",
    available: true,
  },
  {
    id: "p4",
    name: "X Special Loaded Pizza (M)",
    emoji: "⭐",
    category: "Pizza",
    price: 1000,
    desc: "Extra cheese + boti + tikka + fajita — sab kuch ek me.",
    available: true,
  },
  {
    id: "b1",
    name: "Classic Zinger",
    emoji: "🍔",
    category: "Burger",
    price: 350,
    desc: "Crispy zinger fillet, mayo, lettuce — the OG.",
    available: true,
  },
  {
    id: "b2",
    name: "Zinger Cheese",
    emoji: "🧀",
    category: "Burger",
    price: 400,
    desc: "Classic zinger + extra cheddar cheese slice.",
    available: true,
  },
  {
    id: "b3",
    name: "Loaded Zinger",
    emoji: "🍔",
    category: "Burger",
    price: 450,
    desc: "Double fillet with cheese — heavy zaiqa, light price.",
    available: true,
  },
  {
    id: "b4",
    name: "Mighty Zinger",
    emoji: "🦾",
    category: "Burger",
    price: 550,
    desc: "Double decker monster — fillet in fillet, cheese melt.",
    available: true,
  },
  {
    id: "s1",
    name: "Chicken Shawarma",
    emoji: "🌯",
    category: "Shawarma",
    price: 250,
    desc: "Fresh flatbread, garlic sauce, juicy chicken.",
    available: true,
  },
  {
    id: "s2",
    name: "Loaded Shawarma",
    emoji: "🌯",
    category: "Shawarma",
    price: 350,
    desc: "Extra chicken + cheese + fries ke saath.",
    available: true,
  },
  {
    id: "s3",
    name: "Zinger Shawarma",
    emoji: "🌯",
    category: "Shawarma",
    price: 380,
    desc: "Crispy zinger fillet wrapped shawarma style.",
    available: true,
  },
  {
    id: "f1",
    name: "Fries",
    emoji: "🍟",
    category: "Sides",
    price: 200,
    desc: "Crispy golden fries with ketchup.",
    available: true,
  },
  {
    id: "f2",
    name: "Loaded Fries",
    emoji: "🧀",
    category: "Sides",
    price: 350,
    desc: "Fries with cheese sauce + garlic mayo.",
    available: true,
  },
  {
    id: "f3",
    name: "Nuggets (6 pcs)",
    emoji: "🍗",
    category: "Sides",
    price: 350,
    desc: "Crunchy chicken nuggets — kids ki pasand.",
    available: true,
  },
  {
    id: "f4",
    name: "Cold Drink 250ml",
    emoji: "🥤",
    category: "Sides",
    price: 100,
    desc: "Chilled — 250ml bottle.",
    available: true,
  },
  {
    id: "d1",
    name: "Deal 1 — Family Feast",
    emoji: "🔥",
    category: "Deals",
    price: 999,
    desc: "4x Loaded Zinger + 3x Shawarma + 1 Cold Drink.",
    available: true,
  },
  {
    id: "d2",
    name: "Deal 2 — X Mega Combo",
    emoji: "⚡",
    category: "Deals",
    price: 1199,
    desc: "5x Loaded Zinger + 5x Loaded Shawarma + 1.5L Drink.",
    available: true,
  },
  {
    id: "d3",
    name: "Budget Pizza Deal",
    emoji: "🍕",
    category: "Deals",
    price: 800,
    desc: "Any Medium Pizza — sirf Rs 800. Din ka best deal!",
    available: true,
  },
];

function loadLocal(): LocalDB {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { queues: [], menu: seedMenu, counter: 100 };
}

function saveLocal(db: LocalDB) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(db));
}

export const localStore = {
  getQueues(): any[] {
    return loadLocal().queues;
  },
  getMenu(): any[] {
    return loadLocal().menu;
  },
  getNextToken(queues?: any[]): string {
    const db = loadLocal();
    const qs = queues ?? db.queues;
    const nums = qs.map((q) =>
      parseInt((q.token_no || "A0").replace("A", ""), 10),
    );
    const max = Math.max(db.counter, ...nums);
    return "A" + (max + 1);
  },
  addQueue(entry: any): any {
    const db = loadLocal();
    const created = {
      ...entry,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.queues.push(created);
    db.counter = Math.max(
      db.counter,
      parseInt((entry.token_no || "A0").replace("A", ""), 10),
    );
    saveLocal(db);
    return created;
  },
  updateQueue(id: string, patch: any): any {
    const db = loadLocal();
    const idx = db.queues.findIndex((q) => q.id === id);
    if (idx < 0) return null;
    db.queues[idx] = {
      ...db.queues[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    saveLocal(db);
    return db.queues[idx];
  },
  updateMenu(itemId: string, patch: any): any {
    const db = loadLocal();
    const idx = db.menu.findIndex((m) => m.id === itemId);
    if (idx < 0) return null;
    db.menu[idx] = { ...db.menu[idx], ...patch };
    saveLocal(db);
    return db.menu[idx];
  },
  addMenuItem(item: any): any {
    const db = loadLocal();
    db.menu.push(item);
    saveLocal(db);
    return item;
  },
  resetLocal() {
    localStorage.removeItem(LOCAL_KEY);
  },
};
