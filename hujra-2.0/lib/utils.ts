import { EMOJI_AVATARS } from "./types";

const ADJ = [
  "Khush",
  "Chand",
  "Chai",
  "Tapay",
  "Gulaal",
  "Parda",
  "Barish",
  "Shoqin",
  "Dil",
  "Jaan",
  "Raati",
  "Shor",
  "Masti",
  "Halka",
  "Noori",
  "Sardaar",
  "Nimboo",
  "Shahi",
  "Baaz",
  "Sheer",
];

const NOUN = [
  "Sher",
  "Khan",
  "Wali",
  "Dost",
  "Mehmaan",
  "Chale",
  "Kaku",
  "Bacha",
  "Janumer",
  "Gullu",
  "Billa",
  "Pahtan",
  "Wazir",
  "Mama",
  "Chacha",
  "Apu",
  "Bhai",
  "Chhota",
  "Bara",
  "Dada",
];

const names = new Set<string>();

export function randomName(): string {
  for (let tries = 0; tries < 60; tries++) {
    const name =
      ADJ[Math.floor(Math.random() * ADJ.length)] +
      " " +
      NOUN[Math.floor(Math.random() * NOUN.length)] +
      (Math.random() < 0.35 ? String(Math.floor(Math.random() * 90) + 10) : "");
    if (!names.has(name)) {
      names.add(name);
      return name;
    }
  }
  names.clear();
  return "Hujra Dost";
}

export function uid(prefix = ""): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${rnd}` : rnd;
}

export function roomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function avatar(userId: string): string {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return EMOJI_AVATARS[hash % EMOJI_AVATARS.length];
}

export function timeAgo(t: number): string {
  const diff = Date.now() - t;
  if (diff < 60_000) return "abhi";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}
