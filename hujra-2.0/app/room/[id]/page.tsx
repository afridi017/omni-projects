"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Hand,
  Users,
  Radio,
  Copy,
  Check,
  Play,
  Square,
  Volume2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { Participant, Reaction, Room } from "@/lib/types";
import { REACTION_META, MSGS } from "@/lib/types";
import { avatar, uid } from "@/lib/utils";
import { getRealtime, mode } from "@/lib/realtime";
import type { RealtimeHandle } from "@/lib/demo-store";
import { ensureUser, loadDb } from "@/lib/demo-store";
import { createAudioEngine } from "@/lib/audio";
import type { AudioEngine } from "@/lib/audio";
import { UrduCaptionTicker } from "@/lib/captions";
import type { Caption } from "@/lib/types";
import { createRoomRecorder, saveRecording } from "@/lib/recorder";
import type { Recorder } from "@/lib/recorder";
import { formatClock } from "@/lib/format";

const REACTION_ORDER = [
  "chai",
  "qehwa",
  "lol",
  "clap",
  "fire",
  "heart",
] as const;

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const [room, setRoom] = useState<Room | null>(null);
  const [joined, setJoined] = useState(false);
  const [joinRole, setJoinRole] = useState<"speaker" | "listener">("listener");
  const [micOn, setMicOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [recording, setRecording] = useState<"idle" | "recording" | "stopped">(
    "idle",
  );
  const [recordingNote, setRecordingNote] = useState("");
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [liveBadge, setLiveBadge] = useState(true);

  const rtRef = useRef<RealtimeHandle | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const tickerRef = useRef<UrduCaptionTicker | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const myPidRef = useRef<string>("");

  const me = useMemo(() => ensureUser(), []);
  const myPid = myPidRef.current || me.id;
  const isDemo = mode() === "demo";

  // ------- toast helper
  const pushToast = useCallback((msg: string) => {
    setToasts((t) => [...t.slice(-3), msg]);
  }, []);

  // ------- realtime subscribe -------
  useEffect(() => {
    const rt = getRealtime(roomId, (r) => {
      if (r && r.id === roomId)
        setRoom((prev) => {
          const next = mergeRoom(prev ?? r, r);
          return next;
        });
    });
    rtRef.current = rt;
    const initial = rt.getRoom();
    if (initial && initial.id === roomId) setRoom(initial);
    return () => {
      rt.dispose();
      tickerRef.current?.stop();
      recorderRef.current?.stop();
      audioRef.current?.leave();
    };
  }, [roomId]);

  // ------- join -------
  const join = useCallback(
    async (role: "speaker" | "listener", isHost = false) => {
      const rt = rtRef.current;
      if (!rt) return;
      const existing = rt.getRoom();
      if (!existing) return;

      const pid = isHost ? me.id : uid("u");
      myPidRef.current = pid;

      const audio = createAudioEngine();
      audioRef.current = audio;
      await audio.join(roomId);

      const meName = loadDb().user?.name ?? "Guest";
      const participant: Participant = {
        id: pid,
        name: meName,
        role,
        handRaised: false,
        micOn: role === "speaker",
        talking: false,
        joinedAt: Date.now(),
      };

      rt.patchRoom((r) => {
        // dedupe: if my participant already exists (e.g. page refresh), update role
        const exists = r.participants.some((p) => p.id === pid);
        return {
          ...r,
          participants: exists
            ? r.participants.map((p) =>
                p.id === pid ? { ...p, ...participant } : p,
              )
            : [...r.participants, participant],
          energy: Math.min(6, r.energy + (exists ? 0 : 1)),
        };
      });

      if (role === "speaker") {
        setMicOn(true);
        await audio.setMic(true);
      }
      setJoined(true);
      setJoinRole(role);
      pushToast(
        `${meName} ${role === "speaker" ? MSGS.JOIN_AS_SPEAKER : MSGS.JOIN_AS_LISTENER}`,
      );

      // reaction from the room (someone joined)
      rtRef.current?.patchRoom((r) => ({
        ...r,
        reactions: [
          ...r.reactions,
          {
            id: uid("rx"),
            emoji: role === "speaker" ? "🎙️" : "🎧",
            t: Date.now(),
            from: meName,
          },
        ].slice(-12),
      }));
    },
    [roomId, me.id, pushToast],
  );

  // ------- mic toggle -------
  const toggleMic = useCallback(async () => {
    const rt = rtRef.current;
    const audio = audioRef.current;
    if (!rt || !audio) return;
    const next = !audio.micEnabled();
    await audio.setMic(next);
    setMicOn(next);
    rt.patchRoom((r) => ({
      ...r,
      participants: r.participants.map((p) =>
        p.id === myPidRef.current ? { ...p, micOn: next, talking: next } : p,
      ),
    }));
  }, []);

  // ------- hand raise -------
  const toggleHand = useCallback(() => {
    const rt = rtRef.current;
    if (!rt) return;
    setHandRaised((prev) => {
      const next = !prev;
      rt.patchRoom((r) => ({
        ...r,
        participants: r.participants.map((p) =>
          p.id === myPidRef.current ? { ...p, handRaised: next } : p,
        ),
      }));
      return next;
    });
  }, []);

  // ------- promote listener to speaker -------
  const promote = useCallback(
    (pid: string) => {
      const rt = rtRef.current;
      if (!rt) return;
      rt.patchRoom((r) => ({
        ...r,
        participants: r.participants.map((p) =>
          p.id === pid && p.role === "listener"
            ? { ...p, role: "speaker", handRaised: false, micOn: true }
            : p,
        ),
        energy: Math.min(6, r.energy + 1),
      }));
      const target = rt.getRoom()?.participants.find((p) => p.id === pid);
      if (target) pushToast(`${target.name} ${MSGS.PROMOTED}`);
    },
    [pushToast],
  );

  // ------- leave -------
  const leave = useCallback(() => {
    const rt = rtRef.current;
    if (!rt) return;
    const roomBefore = rt.getRoom();
    if (roomBefore) {
      const meName = roomBefore.participants.find(
        (p) => p.id === myPidRef.current,
      )?.name;
      rt.patchRoom((r) => ({
        ...r,
        participants: r.participants.filter((p) => p.id !== myPidRef.current),
        energy: Math.max(0, r.energy - 1),
        reactions: [
          ...r.reactions,
          {
            id: uid("rx"),
            emoji: "🚪",
            t: Date.now(),
            from: meName ?? "Guest",
          },
        ].slice(-12),
      }));
    }
    audioRef.current?.leave();
    tickerRef.current?.stop();
    recorderRef.current?.stop();
    window.location.href = "/";
  }, []);

  // ------- live captions -------
  useEffect(() => {
    if (!joined) return;
    const ticker = new UrduCaptionTicker({
      onLine: (c) => {
        setCaptions((prev) => [
          ...prev.slice(-29),
          {
            id: c.id,
            text: c.text,
            speaker: c.speaker,
            t: c.t,
            seg: c.seg,
          },
        ]);
      },
      speed: 3800,
    });
    tickerRef.current = ticker;
    ticker.start([room?.name ?? "gup"]);
    return () => ticker.stop();
  }, [joined, room?.name]);

  // ------- reactions -------
  const sendReaction = useCallback((type: keyof typeof REACTION_META) => {
    const rt = rtRef.current;
    if (!rt) return;
    rt.patchRoom((r) => ({
      ...r,
      reactions: [
        ...r.reactions,
        {
          id: uid("rx"),
          emoji: REACTION_META[type].emoji,
          t: Date.now(),
          from: loadDb().user?.name ?? "Guest",
        },
      ].slice(-12),
    }));
    setShowReactions(false);
  }, []);

  // auto-expire reactions after 4s
  useEffect(() => {
    if (!room) return;
    const now = Date.now();
    const stale = room.reactions.filter((r) => now - r.t > 4000);
    if (stale.length && room.reactions.length !== stale.length) {
      const t = setTimeout(() => {
        rtRef.current?.patchRoom((r) => ({
          ...r,
          reactions: r.reactions.filter((rx) => Date.now() - rx.t <= 4000),
        }));
      }, 400);
      return () => clearTimeout(t);
    }
  }, [room]);

  // ------- recording -------
  const startRecording = useCallback(async () => {
    const rt = rtRef.current;
    if (!rt) return;
    const recorder = createRoomRecorder(async () => {
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          return await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          return null;
        }
      }
      return null;
    });
    recorderRef.current = recorder;
    recorder.onData = (blob, mime) => {
      const note = saveRecording(blob, rt.getRoom()?.name ?? "hujra");
      setRecordingNote(note);
    };
    await recorder.start();
    setRecording("recording");
    pushToast("Recording shuru 🎙️");
  }, [pushToast]);

  const stopRecording = useCallback(async () => {
    await recorderRef.current?.stop();
    setRecording("stopped");
    pushToast("Recording stopped");
  }, [pushToast]);

  // ------- UI state -------
  const myParticipant = joined
    ? room?.participants.find((p) => p.id === myPidRef.current)
    : null;
  const isSpeaker = myParticipant?.role === "speaker";
  const isHost = room?.host === me.name;
  const speakers = room?.participants.filter((p) => p.role === "speaker") ?? [];
  const listeners =
    room?.participants.filter((p) => p.role === "listener") ?? [];
  const allReactions = useMemo(
    () => [...(room?.reactions ?? []), ...reactions].slice(-14),
    [room, reactions],
  );

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl">🍵</div>
          <p className="mt-3 text-white/60">Room dhoond rahe hain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-5">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/[0.05] p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="font-display text-lg font-bold leading-tight">
              {room.name}
            </div>
            <div className="text-xs text-white/50">{room.topic}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip text-[#f87171]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f87171] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f87171]" />
            </span>
            LIVE
          </span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(
                `${window.location.origin}/room/${room.id}`,
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="chip hover:bg-white/10"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {room.code}
          </button>
        </div>
      </div>

      {/* ---- pre-join ---- */}
      {!joined && (
        <div className="mt-10">
          <div className="glass-strong mx-auto max-w-xl p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#a3e635]/25 to-transparent text-4xl">
              {room.emoji}
            </div>
            <h1 className="font-display mt-5 text-2xl font-bold">
              {room.name}
            </h1>
            <p className="mt-2 text-white/55">{room.topic}</p>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {room.participants.length}{" "}
                andar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5" /> {room.code}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => join("speaker")} className="btn-lime">
                <Mic className="h-4 w-4" />
                Speaker bano
              </button>
              <button onClick={() => join("listener")} className="btn-ghost">
                <Volume2 className="h-4 w-4" />
                Listener raho
              </button>
            </div>

            <p className="mt-4 text-[11px] text-white/35">
              {isDemo
                ? "Demo mode — mic ka test, login free hai"
                : "Live WebRTC audio via LiveKit"}
            </p>
          </div>
        </div>
      )}

      {/* ---- joined ----
      We render the voice room with a "stage", speaker area, controls, captions, reactions.
      */}
      {joined && myParticipant && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* left: voice room */}
          <div className="space-y-4">
            {/* stage */}
            <div className="glass-strong relative overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="avatar-ring h-6 w-6 text-[11px]">
                    {room.emoji}
                  </span>
                  Stage
                </div>
                <div className="chip">
                  {speakers.length} speakers · {listeners.length} listeners
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {speakers.map((p) => (
                  <SpeakerTile
                    key={p.id}
                    p={p}
                    isMe={p.id === myPidRef.current}
                    onPromote={
                      isHost && p.role === "listener"
                        ? () => promote(p.id)
                        : undefined
                    }
                  />
                ))}
                {speakers.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-white/40">
                    Stage khaali hai — pehla speaker ban ke baat shuru karo 🎙️
                  </div>
                )}
              </div>
            </div>

            {/* speak bar */}
            <div className="glass-card flex flex-wrap items-center gap-3 p-4">
              <button
                onClick={toggleMic}
                className={`relative rounded-full p-3.5 transition ${
                  micOn
                    ? "bg-[#a3e635] text-[#141902] hover:bg-[#bef264]"
                    : "bg-white/10 text-white/60 hover:bg-white/15"
                }`}
              >
                {micOn ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
                {micOn && (
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#141902]/30" />
                )}
              </button>

              {isSpeaker && (
                <button
                  onClick={toggleHand}
                  className={`rounded-full p-3.5 transition ${
                    handRaised
                      ? "bg-[#fbbf24] text-[#1a1300]"
                      : "bg-white/10 text-white/60 hover:bg-white/15"
                  }`}
                >
                  <Hand className="h-5 w-5" />
                </button>
              )}

              {!isSpeaker && (
                <button
                  onClick={toggleHand}
                  className={`rounded-full p-3.5 transition ${
                    handRaised
                      ? "bg-[#fbbf24] text-[#1a1300]"
                      : "bg-white/10 text-white/60 hover:bg-white/15"
                  }`}
                >
                  <Hand className="h-5 w-5" />
                </button>
              )}

              <div className="mx-1 h-6 w-px bg-white/10" />

              {/* reactions */}
              <button
                onClick={() => setShowReactions((v) => !v)}
                className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white/75 hover:bg-white/15"
              >
                🍵 Chai bhejo
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={
                    recording === "recording" ? stopRecording : startRecording
                  }
                  className="rounded-full px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background:
                      recording === "recording"
                        ? "rgba(244,63,94,0.15)"
                        : "rgba(255,255,255,0.06)",
                    color: recording === "recording" ? "#f87171" : "#fff",
                  }}
                >
                  {recording === "recording" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Square className="h-3.5 w-3.5" /> REC
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5" /> Record
                    </span>
                  )}
                </button>
                <button onClick={leave} className="btn-ghost !px-4 !py-2.5">
                  Bahar jao
                </button>
              </div>
            </div>

            {/* reaction tray */}
            {showReactions && (
              <div className="glass-card animate-toast-in flex flex-wrap gap-2 p-4">
                {REACTION_ORDER.map((type) => (
                  <button
                    key={type}
                    onClick={() => sendReaction(type)}
                    className="rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/15"
                  >
                    {REACTION_META[type].emoji} {REACTION_META[type].label}
                  </button>
                ))}
              </div>
            )}

            {/* listeners row */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/55">
                  Listeners ({listeners.length})
                </div>
                <span className="text-[11px] text-white/35">
                  Hand uthao, speaker ban jao
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {listeners.map((p) => (
                  <div
                    key={p.id}
                    className="chip !cursor-default !text-white/70"
                    title={p.name}
                  >
                    <span>{avatar(p.id)}</span>
                    {p.name}
                    {p.handRaised && (
                      <span className="ml-0.5 inline-block rounded-full bg-[#fbbf24]/20 px-1.5 text-[10px] text-[#fbbf24]">
                        ✋
                      </span>
                    )}
                    {isHost && p.handRaised && (
                      <button
                        onClick={() => promote(p.id)}
                        className="ml-0.5 rounded-full bg-[#a3e635]/20 px-1.5 text-[10px] font-bold text-[#a3e635] hover:bg-[#a3e635]/35"
                      >
                        UP
                      </button>
                    )}
                  </div>
                ))}
                {listeners.length === 0 && (
                  <div className="py-2 text-xs text-white/30">
                    Abhi koi listener nahi — link share karo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* right: captions */}
          <div className="glass-card flex min-h-[320px] flex-col p-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70">
                <MessageSquare className="h-3.5 w-3.5" />
                Urdu captions
              </div>
              <span className="chip">
                <Sparkles className="h-3 w-3" /> live
              </span>
            </div>

            <div
              className="scrollbar-thin mt-3 flex-1 space-y-3 overflow-y-auto pr-1"
              style={{ maxHeight: 380 }}
            >
              {captions.length === 0 && (
                <div className="py-8 text-center text-xs text-white/30">
                  Captions aane wali hain... 🍵
                </div>
              )}
              {captions.map((c) => (
                <div key={c.id} className="animate-toast-in">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <span className="avatar-ring h-3.5 w-3.5 text-[8px]">
                      {avatar(c.speaker)}
                    </span>
                    {c.speaker}
                    <span>· {formatClock(c.t)}</span>
                  </div>
                  <p
                    className="font-urdu mt-0.5 text-[15px] leading-relaxed text-white/85"
                    dir="rtl"
                  >
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* floating reactions */}
      <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
        {allReactions.map((r) => (
          <div
            key={r.id}
            className="animate-reaction-pop text-3xl"
            style={{ fontSize: 26 }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* toasts */}
      <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t, i) => (
          <div
            key={`${t}-${i}`}
            className="animate-toast-in rounded-full border border-white/10 bg-[#10101c]/90 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-xl"
          >
            {t}
          </div>
        ))}
        {recordingNote && (
          <div
            className="animate-toast-in rounded-full border border-[#a3e635]/30 bg-[#10101c]/90 px-4 py-2 text-xs font-medium text-[#bef264] backdrop-blur-xl"
            onClick={() => setRecordingNote("")}
          >
            {recordingNote} ✓
          </div>
        )}
      </div>
    </div>
  );
}

// helper: don't lose local transient state when echo merges happen
function mergeRoom(prev: Room, next: Room): Room {
  // keep newest version of each participant
  const mergedParts = new Map<string, Participant>();
  for (const p of [...prev.participants, ...next.participants])
    mergedParts.set(p.id, p);
  return {
    ...next,
    participants: Array.from(mergedParts.values()),
    reactions: next.reactions,
    captions: [...prev.captions, ...next.captions].slice(-40),
  };
}

function SpeakerTile({
  p,
  isMe,
  onPromote,
}: {
  p: Participant;
  isMe: boolean;
  onPromote?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        p.micOn
          ? "border-[#a3e635]/30 bg-[#a3e635]/[0.06]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`avatar-ring h-11 w-11 text-lg ${p.micOn ? "animate-pulse-ring" : ""}`}
        >
          {avatar(p.id)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{p.name}</span>
            {isMe && <span className="chip !text-[#a3e635]">you</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/45">
            {p.micOn ? (
              <span className="inline-flex items-center gap-1 text-[#bef264]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-[#bef264]" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[#bef264]" />
                </span>
                bola raha hai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <MicOff className="h-3 w-3" /> muted
              </span>
            )}
            {p.handRaised && (
              <span className="inline-flex items-center gap-1 text-[#fbbf24]">
                ✋ hand
              </span>
            )}
          </div>
        </div>
        {onPromote && (
          <button
            onClick={onPromote}
            className="rounded-full bg-[#a3e635]/15 px-2.5 py-1 text-[10px] font-bold text-[#a3e635] hover:bg-[#a3e635]/30"
          >
            UP
          </button>
        )}
      </div>
    </div>
  );
}
