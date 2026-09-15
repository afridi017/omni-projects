export type Role = "speaker" | "listener";

export type RoomStatus = "live" | "ended";

export interface Participant {
  /** stable id within the room (demo mode) or external identity (LiveKit) */
  id: string;
  name: string;
  role: Role;
  /** listener with hand raised waiting to become speaker */
  handRaised: boolean;
  /** mic enabled (speakers only) */
  micOn: boolean;
  /** true when any of this user's tabs is an active speaker on mic */
  talking: boolean;
  joinedAt: number;
}

export type ReactionType = "chai" | "qehwa" | "lol" | "clap" | "fire" | "heart";

export interface Reaction {
  id: string;
  emoji: string;
  /** RFC 3339-ish timestamp so captions/reactions render relative */
  t: number;
  from: string;
}

export interface Caption {
  id: string;
  text: string;
  speaker: string;
  t: number;
  /** the conversation thread – message group – this caption belongs to */
  seg: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  topic: string;
  host: string;
  /** "Tapay Night" | "Cricket Talk" | "Late Night Gup" | custom */
  category: string;
  emoji: string;
  /** 0–6 from most recent active salek */
  energy: number;
  status: RoomStatus;
  createdAt: number;
  endedAt?: number;
  startedAt?: number;
  participants: Participant[];
  reactions: Reaction[];
  captions: Caption[];
}

export interface StoredUser {
  id: string;
  name: string;
}

export const REACTION_META: Record<
  ReactionType,
  { emoji: string; label: string }
> = {
  chai: { emoji: "🍵", label: "Chai" },
  qehwa: { emoji: "☕", label: "Qehwa" },
  lol: { emoji: "😂", label: "LOL" },
  clap: { emoji: "👏", label: "Clap" },
  fire: { emoji: "🔥", label: "Fire" },
  heart: { emoji: "🫰", label: "Love" },
};

export const ROOM_PRESETS = [
  {
    name: "Tapay Night",
    emoji: "🎤",
    topic: "Swag, tapay, aur chai — raat ki baat",
    color: "#22d3ee",
  },
  {
    name: "Cricket Talk",
    emoji: "🏏",
    topic: "Match dekh kar aao, panga yahan bhi lagega",
    color: "#34d399",
  },
  {
    name: "Late Night Gup",
    emoji: "🌙",
    topic: "2 baje tak ki gup — no judgement zone",
    color: "#a78bfa",
  },
] as const;

export const EMOJI_AVATARS = [
  "🦁",
  "🐺",
  "🦊",
  "🐻",
  "🦅",
  "🐉",
  "🦋",
  "🐼",
  "🦚",
  "🐯",
];

export const MSGS: Record<string, string> = {
  JOIN_AS_SPEAKER: "joined as speaker 🎙️",
  JOIN_AS_LISTENER: "joined as listener 🎧",
  LEFT: "left the hujra",
  HAND_UP: "raised hand ✋",
  HAND_DOWN: "lowered hand",
  PROMOTED: "promoted to speaker 🎙️",
};
