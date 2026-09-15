export type QueueStatus =
  | "waiting"
  | "preparing"
  | "ready"
  | "delivered"
  | "rejected";

export type MenuItem = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  desc: string;
  available: boolean;
};

export type QueueEntry = {
  id: string;
  token_no: string; // A101, A102...
  phone: string;
  name: string;
  status: QueueStatus;
  items: CartItem[];
  total: number;
  created_at: string;
  called_at: string | null;
  updated_at: string;
};

export type CartItem = {
  item_id: string;
  name: string;
  emoji: string;
  price: number;
  qty: number;
};

export type RushLevel = "khaali" | "normal" | "rush";

export const RUSH_META: Record<
  RushLevel,
  { label: string; emoji: string; tagline: string; color: string }
> = {
  khaali: {
    label: "Khaali",
    emoji: "🟢",
    tagline: "Aram se aao — koi line nahi!",
    color: "#22c55e",
  },
  normal: {
    label: "Normal",
    emoji: "🟡",
    tagline: "Thora busy hai — theek hai, sabar ka phal meetha!",
    color: "#eab308",
  },
  rush: {
    label: "Full Rush",
    emoji: "🔴",
    tagline: "Sabar karo bhai — kitchen garam hai! 🔥",
    color: "#ef4444",
  },
};

export const ORDER_MINUTES = 7; // queue algorithm: each order ≈ 7 min
export const NEAR_ALERT_AHEAD = 2; // notify when this many people before you
export const SASTA_DISCOUNT_MIN = 30; // wait > 30 min => 10% discount badge
