# 🍵 HUJRA 2.0 — Live Voice Rooms for Gen Z

> **"Hujra me bolo, duniya ko chup karo."**

Live voice rooms — **Tapay Night**, **Cricket Talk**, **Late Night Gup** — with
speaker/listener roles, hand raising, chai & qehwa reactions, Urdu live captions,
room recording, and PWA install. Dark glassmorphism UI, Peshawar energy.

![HUJRA](https://img.shields.io/badge/HUJRA-2.0-a3e635?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-000?style=for-the-badge&logo=nextdotjs)
![Tailwind](https://img.shields.io/badge/Tailwind-38BDF8?style=for-the-badge&logo=tailwindcss)
![Made in Peshawar](https://img.shields.io/badge/MADE%20IN-PESHAWAR%20%F0%9F%8F%B1-168F48?style=for-the-badge)

---

## ✨ What's inside

| Feature            | How                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Create room        | Presets (Tapay Night / Cricket Talk / Late Night Gup) + custom name & topic, shareable room code        |
| Voice rooms        | **LiveKit** WebRTC when configured; instant **demo mode** (mic test) without any keys                   |
| Speaker / Listener | Join as speaker 🎙️ or listener 🎧, toggle mic anytime                                                   |
| Raise hand         | Listener ✋ → host sees hand → promotes to speaker                                                      |
| React              | 🍵 Chai, ☕ Qehwa, 😂 LOL, 👏 Clap, 🔥 Fire, 🫰 Love — float over the stage                             |
| Urdu live captions | Urdu-script ticker under the room; swap engine for real ASR later                                       |
| Room recording     | MediaRecorder (real mic/loopback) with mock-recording fallback — always downloads a file                |
| PWA                | `manifest.json` + icons, installable, theme `#07060d`                                                   |
| Real-time sync     | **BroadcastChannel** multi-tab demo mode (works instantly), **Supabase Realtime** when env keys present |

## 🚀 Run it

```bash
npm install
npm run icons     # generate PWA icons (zero-dep PNG writer)
npm run dev       # → http://localhost:3001
```

**Demo mode works with zero configuration.** Open the app in two tabs and you'll
see each other join the same room via BroadcastChannel — real-time join/leave,
hand raise, reactions, mic state, captions.

## 🔌 Go live (optional)

### LiveKit — real audio

```bash
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=wss://your-subdomain.livekit.cloud
```

`/api/livekit` mints an ephemeral token; `lib/audio.ts` switches from the sim
engine to a real `livekit-client` room automatically.

### Supabase Realtime — cloud-synced rooms

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Run `supabase/schema.sql` in the SQL Editor (rooms table + realtime publication +
RLS + seed). `lib/realtime.ts` then syncs room state via `postgres_changes`.

## 🗂 Structure

```
app/
  page.tsx              # Home: live rooms grid + hero
  room/[id]/page.tsx    # Live voice room (stage, controls, captions, reactions)
  api/livekit/route.ts  # Ephemeral LiveKit token endpoint
  layout.tsx            # Fonts (Space Grotesk + Noto Nastaliq Urdu), glass bg
components/
  home/                 # RoomCard, CreateRoomModal, IdentityModal
lib/
  types.ts              # Room / Participant / Reaction / Caption models
  demo-store.ts         # zero-backend room engine (localStorage + BroadcastChannel)
  realtime.ts           # demo ⇄ supabase adapter
  audio.ts              # LiveKit WebRTC engine + sim engine
  captions.ts           # Urdu caption ticker pipeline
  recorder.ts           # MediaRecorder + mock WAV fallback
supabase/schema.sql     # cloud schema + seed
scripts/gen-icons.mjs   # zero-dep PWA icon generator
```

## 🎨 Design

- **Glassmorphism dark** — `#07060d` base, `backdrop-blur` cards, lime `#a3e635` accent
- **Fonts** — Space Grotesk display, Noto Sans body, Noto Nastaliq Urdu captions
- **Micro-interactions** — pulsing mic rings, reaction pop animations, toast messages,
  live-dot energy bars on cards

<!-- Footer -->
<div align="center">

_Made with ❤️ in Peshawar by IB Afridi — CODEX series_

</div>
