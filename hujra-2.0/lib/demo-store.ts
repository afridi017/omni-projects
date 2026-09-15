"use client";

/**
 * Voice room engine (demo mode).
 *
 * The client is the source of truth for local joins; a leader tab (host tab)
 * owns the global room state and fan-out. Outgoing events go through
 * BroadcastChannel (same origin, same browser) → every tab mirrors state.
 * This gives a convincing multi-user room (join/leave, hand raise, promote,
 * reactions, captions) with ZERO backend. Swap in LiveKit + Supabase realtime
 * with the same API via `getRealtime()` in lib/realtime.ts.
 */

import type { Caption, Participant, Reaction, Room, StoredUser } from "./types";
import { uid } from "./utils";

const DB_KEY = "hujra20_db_v1";

export interface DB {
  user: StoredUser | null;
  rooms: Record<string, Room>;
}

export type HujraEvent =
  | { type: "snapshot"; room: Room | null }
  | { type: "echo"; room: Room | null }
  | { type: "room"; room: Room; silent?: boolean };

export interface RealtimeHandle {
  getRoom(): Room | null;
  patchRoom(updater: (room: Room) => Room): void;
  /** rooms that haven't ended */
  useRooms(): Room[];
  send(event: HujraEvent): void;
  dispose(): void;
  onBeforeUnload(cb: () => void): void;
}

function noop(_room: Room): Room {
  return _room;
}

export function createDemoRealtime(
  roomId: string | null,
  opts: { onBallot: (room: Room) => void } = { onBallot: noop },
): RealtimeHandle {
  let db: DB = { user: null, rooms: {} };

  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) db = JSON.parse(raw);
  } catch {
    /* localStorage unavailable (SSR / hardened browsers) */
  }

  const ch =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("hujra20-bus")
      : null;

  let patched: Room | null = roomId ? (db.rooms[roomId] ?? null) : null;

  function persist(r: Room) {
    db.rooms[r.id] = r;
    save();
  }

  function save() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      /* storage full / private mode */
    }
  }

  function useRooms(): Room[] {
    return Object.values(db.rooms)
      .filter((r) => r.status === "live")
      .sort((a, b) => b.energy - a.energy || b.createdAt - a.createdAt);
  }

  if (ch) {
    ch.onmessage = (ev: MessageEvent<HujraEvent>) => {
      const evt = ev.data;
      if (!evt) return;
      if (evt.type === "snapshot") {
        ch.postMessage({ type: "echo", room: patched });
      } else if (evt.type === "echo") {
        // Only adopt remote state when we haven't made uncommitted local changes —
        // the echo pattern keeps tabs consistent without fighting over edges.
        opts.onBallot(evt.room ?? ({} as Room));
      } else if (evt.type === "room") {
        const remote = evt.room;
        if (!remote) return;
        const local = patched;
        if (
          local &&
          local.createdAt &&
          remote.createdAt &&
          local.createdAt > remote.createdAt
        )
          return;
        db.rooms[remote.id] = remote;
        patched = remote;
        save();
        if (!evt.silent) opts.onBallot(remote);
      }
    };
  }

  return {
    getRoom: () => patched,
    patchRoom(updater) {
      if (!patched) return;
      patched = updater(patched);
      persist(patched);
      // Notify local tab FIRST (BroadcastChannel only reaches other tabs),
      // then fan out so other tabs converge on the same state.
      opts.onBallot(patched);
      if (ch)
        ch.postMessage({ type: "room", room: patched } satisfies HujraEvent);
    },
    useRooms,
    send(evt) {
      if (ch) ch.postMessage(evt);
    },
    dispose() {
      ch?.close();
    },
    onBeforeUnload(cb) {
      const handler = () => cb();
      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", handler);
      }
    },
  };
}

/** Bootstraps seeded demo rooms owned by the local demo user. */
export function seedDemoRooms(): DB {
  const now = Date.now();
  const seedUser: StoredUser = { id: uid("guest"), name: "Demo Host" };
  const mkParticipants = (
    names: string[],
    speakerCount: number,
  ): Participant[] =>
    names.map((name, i) => ({
      id: uid("u"),
      name,
      role: i < speakerCount ? "speaker" : "listener",
      handRaised: false,
      micOn: i < speakerCount,
      talking: false,
      joinedAt: now - (names.length - i) * 45_000,
    }));

  const rooms: Room[] = [
    {
      id: "demo-tapay",
      code: "TAPY",
      name: "Tapay Night",
      topic: "Swag, tapay, aur chai — raat ki baat 🎤",
      host: "Afridi Bhai",
      category: "Tapay Night",
      emoji: "🎤",
      energy: 5,
      status: "live",
      createdAt: now - 1000 * 60 * 47,
      startedAt: now - 1000 * 60 * 42,
      participants: mkParticipants(
        [
          "Afridi Bhai",
          "Chand Sher",
          "Noori Gullu",
          "Parda Apu",
          "Tapay Billa",
          "Dil Dost",
        ],
        3,
      ),
      reactions: [],
      captions: [],
    },
    {
      id: "demo-cricket",
      code: "CRICK",
      name: "Cricket Talk",
      topic: "Match dekh kar aao, panga yahan bhi lagega 🏏",
      host: "Baaz Khan",
      category: "Cricket Talk",
      emoji: "🏏",
      energy: 3,
      status: "live",
      createdAt: now - 1000 * 60 * 18,
      startedAt: now - 1000 * 60 * 15,
      participants: mkParticipants(
        ["Baaz Khan", "Sher Wali", "Shahi Mehmaan", "Chai Kaku", "Gullu Bhai"],
        2,
      ),
      reactions: [],
      captions: [],
    },
    {
      id: "demo-night",
      code: "GUPN",
      name: "Late Night Gup",
      topic: "2 baje tak ki gup — no judgement zone 🌙",
      host: "Janumer",
      category: "Late Night Gup",
      emoji: "🌙",
      energy: 1,
      status: "live",
      createdAt: now - 1000 * 60 * 5,
      startedAt: now - 1000 * 60 * 3,
      participants: mkParticipants(
        [
          "Janumer",
          "Raati Chand",
          "Nimboo Sardaar",
          "Halka Dost",
          "Mama Wali",
          "Bacha Sher",
          "Kaku Jaan",
          "Apu Bhai",
        ],
        2,
      ),
      reactions: [],
      captions: [],
    },
  ];

  const db: DB = { user: seedUser, rooms: {} };
  for (const r of rooms) db.rooms[r.id] = r;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
  return db;
}

export function loadDb(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {
    /* ignore */
  }
  return seedDemoRooms();
}

export function ensureUser(): StoredUser {
  const db = loadDb();
  if (db.user) return db.user;
  db.user = { id: uid("guest"), name: "Guest" };
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
  return db.user;
}

export function setUserName(name: string): StoredUser {
  const db = loadDb();
  db.user = { id: db.user?.id ?? uid("guest"), name: name.trim() || "Guest" };
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
  return db.user;
}

export function getRoomLite(id: string): Room | null {
  return loadDb().rooms[id] ?? null;
}

export function formatRoom(captionStub: {
  text: string;
  speaker: string;
  seg: number;
}): Omit<Caption, "id" | "t"> {
  return captionStub;
}
