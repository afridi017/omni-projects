"use client";

/**
 * Realtime adapter.
 * - Demo mode (default): localStorage + BroadcastChannel — works instantly,
 *   multi-tab, fully featured voice-room UX without any backend.
 * - Supabase mode: when NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set, room
 *   presence/state/reactions/captions sync through Supabase Realtime.
 *
 * Both modes expose the same RealtimeHandle, so the UI never knows the diff.
 */

import { createClient } from "@supabase/supabase-js";
import type { Room } from "./types";
import { createDemoRealtime, seedDemoRooms } from "./demo-store";
import type { HujraEvent, RealtimeHandle } from "./demo-store";

const DEMO = "demo";
const SUPABASE = "supabase";

export function mode(): "demo" | "supabase" {
  if (
    typeof window !== "undefined" &&
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return SUPABASE;
  }
  return DEMO;
}

let supabaseRef: ReturnType<typeof createClient> | null = null;

export function supabase() {
  if (!supabaseRef) {
    supabaseRef = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return supabaseRef;
}

export function getRealtime(
  roomId: string | null,
  onBallot: (r: Room) => void,
): RealtimeHandle {
  if (mode() === SUPABASE) {
    return createSupabaseRealtime(roomId, onBallot);
  }
  const handle = createDemoRealtime(roomId, { onBallot });
  // make sure seed data exists lazily, in a try-safe way
  try {
    if (
      typeof localStorage !== "undefined" &&
      !localStorage.getItem("hujra20_db_v1")
    ) {
      seedDemoRooms();
    }
  } catch {
    /* ignore */
  }
  return handle;
}

function createSupabaseRealtime(
  _roomId: string | null,
  onBallot: (r: Room) => void,
): RealtimeHandle {
  let localRoom: Room | null = null;
  const supabaseClient = supabase();

  async function bootstrap() {
    const { data, error } = await supabaseClient
      .from("rooms")
      .select("*")
      .eq("status", "live")
      .order("energy", { ascending: false });
    if (!error && Array.isArray(data)) {
      // refresh local cache of live rooms
      const roomById: Record<string, Room> = {};
      for (const row of data as Array<{ id: string; data: Room }>) {
        roomById[row.id] = row.data as Room;
      }
      const anyRoom = Object.values(roomById)[0] ?? null;
      if (anyRoom) onBallot(anyRoom);
    }
  }

  bootstrap();

  const ch =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("hujra20-supabase")
      : null;

  const roomChannel = supabaseClient
    .channel("hujra-rooms")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rooms" },
      (payload) => {
        const row = payload.new as { data?: Room } | null;
        if (row?.data) {
          localRoom = row.data;
          onBallot(row.data);
        }
      },
    )
    .subscribe();

  return {
    getRoom: () => localRoom,
    patchRoom(updater) {
      if (!localRoom) return;
      localRoom = updater(localRoom);
      void supabaseClient
        .from("rooms")
        .upsert([
          {
            id: localRoom.id,
            data: localRoom,
            status: localRoom.status,
            energy: localRoom.energy,
          },
        ] as unknown as never)
        .then(({ error }) => {
          if (error) console.warn("[hujra] sync failed", error.message);
        });
      if (ch)
        ch.postMessage({
          type: "room",
          room: localRoom,
          silent: true,
        } satisfies HujraEvent);
    },
    useRooms() {
      return localRoom ? [localRoom] : [];
    },
    send(_evt) {
      /* supabase mode doesn't fan out via broadcast; realtime covers it */
    },
    dispose() {
      supabaseClient.removeChannel(roomChannel);
      ch?.close();
    },
    onBeforeUnload(_cb) {
      /* presence cleanup handled by room page */
    },
  };
}
