import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, localStore, isSupabaseConfigured } from "../lib/supabase";
import type { QueueEntry, MenuItem } from "../types";
import { playTokenCallSound, playReadySound } from "../lib/sound";

/**
 * Central realtime store.
 * - Supabase configured  → live data + realtime subscriptions
 * - Not configured       → localStorage demo mode (mirrors same shape)
 */
export function useRealtimeData() {
  const [queues, setQueues] = useState<QueueEntry[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const notified = useRef<Set<string>>(new Set());
  const readyNotified = useRef<Set<string>>(new Set());

  // ---- Initial load + realtime subscribe ----
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const load = async () => {
      if (isSupabaseConfigured) {
        const [qRes, mRes] = await Promise.all([
          supabase
            .from("queues")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("menu")
            .select("*")
            .order("category", { ascending: true }),
        ]);
        if (!qRes.error) setQueues(qRes.data ?? []);
        if (!mRes.error) setMenu(mRes.data ?? []);
        setLoaded(true);

        channel = supabase
          .channel("sabar-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "queues" },
            async () => {
              const r = await supabase
                .from("queues")
                .select("*")
                .order("created_at", { ascending: true });
              if (!r.error) setQueues(r.data ?? []);
            },
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "menu" },
            async () => {
              const r = await supabase
                .from("menu")
                .select("*")
                .order("category", { ascending: true });
              if (!r.error) setMenu(r.data ?? []);
            },
          )
          .subscribe();
      } else {
        setQueues(localStore.getQueues());
        setMenu(localStore.getMenu());
        setLoaded(true);
      }
    };

    load();

    // Demo-mode polling so the kitchen and customer sync via localStorage
    const poll = window.setInterval(() => {
      if (!isSupabaseConfigured) {
        setQueues(localStore.getQueues());
        setMenu(localStore.getMenu());
      }
    }, 1200);

    return () => {
      window.clearInterval(poll);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // ---- Effects (sound alerts when token near / ready) ----
  useEffect(() => {
    if (!loaded) return;
    // Token near → buzz (like being called)
    const waiting = queues.filter((q) => q.status === "waiting");
    for (const q of waiting) {
      const ahead = queues.filter(
        (x) =>
          x.id !== q.id &&
          ["waiting", "preparing", "ready"].includes(x.status) &&
          new Date(x.created_at).getTime() < new Date(q.created_at).getTime(),
      ).length;
      if (ahead <= 2 && !notified.current.has(q.id)) {
        notified.current.add(q.id);
        playTokenCallSound();
        notifyBrowser(
          "🔔 Token aap kareeb hai!",
          `Sirf ${ahead + 1} orders pehle — ${q.token_no} ready hone wala hai!`,
        );
      }
    }
    // Order ready → celebration chime + notify
    for (const q of queues) {
      if (q.status === "ready" && !readyNotified.current.has(q.id)) {
        readyNotified.current.add(q.id);
        playReadySound();
        notifyBrowser(
          "✅ Aapka order ready!",
          `${q.token_no} — counter se utha lein!`,
        );
      }
    }
  }, [queues, loaded]);

  // ---- Mutations ----
  const joinQueue = async (
    phone: string,
    name: string,
    items: QueueEntry["items"],
  ) => {
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const newQueue = {
      phone,
      name: name || "Guest",
      items,
      total,
      status: "waiting",
    };
    if (isSupabaseConfigured) {
      const { data: rows, error: fetchErr } = await supabase
        .from("queues")
        .select("token_no");
      if (fetchErr) throw fetchErr;
      const record = {
        ...newQueue,
        token_no: nextTokenFrom(rows),
      };
      const { data, error } = await supabase
        .from("queues")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data as QueueEntry;
    } else {
      const entry = {
        id: `local-${Date.now()}`,
        ...newQueue,
        token_no: localStore.getNextToken(),
      };
      return localStore.addQueue(entry);
    }
  };

  const updateQueue = async (id: string, patch: Partial<QueueEntry>) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("queues")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    } else {
      localStore.updateQueue(id, patch);
      setQueues(localStore.getQueues());
    }
  };

  const upsertMenu = async (item: Partial<MenuItem> & { id?: string }) => {
    if (isSupabaseConfigured) {
      const { error } = item.id
        ? await supabase.from("menu").update(item).eq("id", item.id)
        : await supabase.from("menu").insert(item);
      if (error) throw error;
    } else {
      if (item.id) localStore.updateMenu(item.id, item);
      else localStore.addMenuItem({ id: `m-${Date.now()}`, ...item });
      setMenu(localStore.getMenu());
    }
  };

  return { queues, menu, loaded, joinQueue, updateQueue, upsertMenu };
}

function nextTokenFrom(rows: { token_no: string }[] | null): string {
  const nums = (rows ?? [])
    .map((r) => r.token_no)
    .filter((t) => /^A\d+$/.test(t))
    .map((t) => parseInt(t.slice(1), 10));
  return "A" + ((nums.length ? Math.max(...nums) : 100) + 1);
}

/** Browser notification (if permission granted) — best-effort */
function notifyBrowser(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icons/icon-192.png" });
    }
  } catch {
    /* ignore */
  }
}
