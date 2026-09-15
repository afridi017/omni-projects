import { Users, Mic, Radio } from "lucide-react";
import type { Room } from "@/lib/types";
import { formatDuration } from "@/lib/format";

const ENERGY_COLOR: Record<number, string> = {
  0: "#64748b",
  1: "#94a3b8",
  2: "#38bdf8",
  3: "#34d399",
  4: "#fbbf24",
  5: "#f59e0b",
  6: "#f43f5e",
};

export function RoomCard({
  room,
  onClick,
}: {
  room: Room;
  onClick: () => void;
}) {
  const speakers = room.participants.filter((p) => p.role === "speaker");
  const listeners = room.participants.length - speakers.length;
  const started = room.startedAt ?? room.createdAt;

  return (
    <button
      onClick={onClick}
      className="glass-card group relative overflow-hidden p-5 text-left transition hover:border-white/25 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="avatar-ring h-12 w-12 text-2xl">{room.emoji}</div>
        <div className="flex items-center gap-2">
          <span className="chip text-[#f87171]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f87171] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f87171]" />
            </span>
            LIVE
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-display text-lg font-bold leading-tight">
          {room.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/55">{room.topic}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/60">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {room.participants.length}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Mic className="h-3.5 w-3.5" />
          {speakers.length}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5" />
          {formatDuration(started)}
        </span>
      </div>

      {/* energy */}
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background:
                i < room.energy
                  ? (ENERGY_COLOR[room.energy] ?? "#a3e635")
                  : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <span className="avatar-ring h-4 w-4 text-[9px]">
            {room.host.slice(0, 1).toUpperCase()}
          </span>
          Host: {room.host}
        </span>
        <span className="font-mono tracking-widest">{room.code}</span>
      </div>
    </button>
  );
}
