"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Flame,
  Plus,
  Mic,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Room } from "@/lib/types";
import {
  loadDb,
  ensureUser,
  createDemoRealtime,
  getRoomLite,
} from "@/lib/demo-store";
import type { RealtimeHandle } from "@/lib/demo-store";
import { mode } from "@/lib/realtime";
import { formatDuration } from "@/lib/format";
import { seedDemoRooms } from "@/lib/demo-store";
import { CreateRoomModal } from "@/components/home/CreateRoomModal";
import { IdentityModal } from "@/components/home/IdentityModal";

export default function HomeClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [userName, setUserNameState] = useState("Guest");
  const rtRef = useRef<RealtimeHandle | null>(null);
  const isDemo = mode() === "demo";

  // Seed first-load demo rooms once
  useEffect(() => {
    try {
      if (!localStorage.getItem("hujra20_db_v1")) seedDemoRooms();
      const db = loadDb();
      if (db.user?.name) setUserNameState(db.user.name);
    } catch {
      /* ignore */
    }
  }, []);

  // subscribe to room updates
  useEffect(() => {
    const rt = createDemoRealtime(null, {
      onBallot: () => {
        const live = Object.values(loadDb().rooms).filter(
          (r) => r.status === "live",
        );
        live.sort((a, b) => b.energy - a.energy || b.createdAt - a.createdAt);
        setRooms(live);
      },
    });
    rtRef.current = rt;
    rt.send({ type: "snapshot", room: null });
    const live = Object.values(loadDb().rooms).filter(
      (r) => r.status === "live",
    );
    live.sort((a, b) => b.energy - a.energy || b.createdAt - a.createdAt);
    setRooms(live);
    return () => rt.dispose();
  }, []);

  const openCreate = () => setShowCreate(true);
  const openIdentity = () => setShowIdentity(true);

  const goRoom = useCallback(
    (id: string) => {
      // materialize the room object for the room page
      const room = getRoomLite(id);
      window.location.href = `/room/${id}?mode=${isDemo ? "demo" : "supabase"}`;
    },
    [isDemo],
  );

  const stats = useMemo(() => {
    const total = rooms.reduce((a, r) => a + r.participants.length, 0);
    return { count: rooms.length, total };
  }, [rooms]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
      <header className="glass-strong flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="avatar-ring h-10 w-10 text-lg">🍵</div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight">
              HUJRA <span className="text-grad">2.0</span>
            </div>
            <div className="text-[11px] text-white/50">
              Gen Z ke liye live voice rooms
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">
            {isDemo ? (
              <WifiOff className="h-3.5 w-3.5" />
            ) : (
              <Wifi className="h-3.5 w-3.5" />
            )}
            {isDemo ? "Demo mode" : "Live"}
          </span>
          <button
            onClick={openIdentity}
            className="avatar-ring h-9 w-9 text-sm"
          >
            {userName.slice(0, 1).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12141f] via-[#10101c] to-[#0b0b14] p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#a3e635]/15 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[90px]" />
        <div className="relative">
          <div className="chip mb-4">
            <Flame className="h-3.5 w-3.5 text-[#a3e635]" />
            Raat ki bonfire session live hai
          </div>
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Hujra me <span className="text-grad">bolo</span>, duniya ko chup
            karo.
          </h1>
          <p className="mt-4 max-w-xl text-white/60">
            Speaker bano, listener raho, hand uthao, chai aur qehwa bhejo. Awaaz
            ki mehfil — tapay se cricket tak, raat 2 baje tak.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={openCreate} className="btn-lime">
              <Plus className="h-4 w-4" />
              Hujra banao
            </button>
            <button onClick={openIdentity} className="btn-ghost">
              <Mic className="h-4 w-4" />
              Naam set karo
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5" /> WebRTC live audio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" /> Urdu captions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Recording
            </span>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Live hujras" value={stats.count} />
        <Stat label="Loge andar" value={stats.total} />
        <Stat label="Chai order aaj" value={128} />
        <Stat label="Qehwa tonight" value={64} />
      </div>

      {/* Rooms */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Live hujras</h2>
          <button onClick={openCreate} className="chip hover:bg-white/10">
            <Plus className="h-3.5 w-3.5" /> Naya
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.length === 0 && (
            <div className="glass-card col-span-full p-10 text-center text-white/50">
              Koi hujra live nahi — pehla aap banao 🍵
            </div>
          )}
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} onClick={() => goRoom(r.id)} />
          ))}
        </div>
      </section>

      {showCreate && (
        <CreateRoomModal
          userName={userName}
          onClose={() => setShowCreate(false)}
          onCreated={(name) => {
            setRoomName(name);
            setShowCreate(false);
          }}
        />
      )}

      {showIdentity && (
        <IdentityModal
          currentName={userName}
          onClose={() => setShowIdentity(false)}
          onSaved={(n) => setUserNameState(n)}
        />
      )}

      <div className="mt-14 text-center text-[11px] text-white/30">
        Made with ❤️ for Peshawar · HUJRA 2.0 concept · demo mode (no backend,
        no signup)
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-4">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-xs text-white/50">{label}</div>
    </div>
  );
}

import { RoomCard } from "@/components/home/RoomCard";
