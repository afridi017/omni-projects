"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Sparkles } from "lucide-react";
import { ROOM_PRESETS } from "@/lib/types";
import { uid, roomCode } from "@/lib/utils";
import { loadDb } from "@/lib/demo-store";
import type { Room } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  "Tapay Night": "🎤",
  "Cricket Talk": "🏏",
  "Late Night Gup": "🌙",
};

export function CreateRoomModal({
  userName,
  onClose,
  onCreated,
}: {
  userName: string;
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<string>("Tapay Night");

  const emoji = useMemo(() => CATEGORY_EMOJI[category] ?? "🎤", [category]);

  const submit = () => {
    const finalName = name.trim() || category;
    const db = loadDb();
    const hostId = db.user?.id ?? uid("guest");
    const hostName = userName || "Guest";

    const now = Date.now();
    const room: Room = {
      id: uid("room"),
      code: roomCode(),
      name: finalName,
      topic: topic.trim() || "No topic — bas gup",
      host: hostName,
      category,
      emoji,
      energy: 1,
      status: "live",
      createdAt: now,
      startedAt: now,
      participants: [
        {
          id: hostId,
          name: hostName,
          role: "speaker",
          handRaised: false,
          micOn: false,
          talking: false,
          joinedAt: now,
        },
      ],
      reactions: [],
      captions: [],
    };
    db.rooms[room.id] = room;
    try {
      localStorage.setItem("hujra20_db_v1", JSON.stringify(db));
    } catch {
      /* ignore */
    }
    onCreated(finalName);
    router.push(`/room/${room.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="glass-strong w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Naya hujra banao</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* presets */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {ROOM_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setCategory(p.name)}
              className={`rounded-xl border p-3 text-center transition ${
                category === p.name
                  ? "border-[#a3e635]/60 bg-[#a3e635]/10"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-xl">{p.emoji}</div>
              <div className="mt-1 text-[11px] font-semibold">{p.name}</div>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-xs font-semibold text-white/60">
            Hujra ka naam
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Peshawar Nights"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#a3e635]/50"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-white/60">
            Topic (optional)
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Aaj ki baat kya hai?"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#a3e635]/50"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button onClick={submit} className="btn-lime flex-1">
            <Sparkles className="h-4 w-4" />
            Hujra shuru karo
          </button>
        </div>
      </div>
    </div>
  );
}
