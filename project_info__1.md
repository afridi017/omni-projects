# CODEX — IB Afridi's Project Universe — Codebase Overview

## Summary

`CODEX` is a **monorepo** owned by IB Afridi (Ishaq Afridi), a self-taught cybersecurity enthusiast and web/3D developer based in Peshawar, Pakistan. It is not a single application but a **collection of loosely-coupled standalone projects** — mixture of static HTML/CSS/JS prototypes, a full-stack Next.js + Express + Prisma bug-bounty arena, and PWA concepts. The root `README.md` is essentially the developer's public portfolio/branding document. There is **one shared npm workspace** (`huntverse-arena-2`) that actually runs a full-stack app; the rest are dependency-light static prototypes.

The value of this workspace is as a **showcase of the developer's range** — security tooling concepts, super-app prototypes, a bug-bounty arena, and personal brand sites. There is no unified runtime; each sub-project is independent.

## Architecture

**Primary pattern:** Monorepo-of-standalone-projects. There is no shared framework, no central build step, and no cross-project dependency. Each subdirectory is self-contained.

**Two distinct project archetypes exist:**

1. **Static prototypes** (the majority) — plain `index.html` + optional `manifest.json`, `script.js`, `style.css`. These are zero-dependency, open-in-browser, often PWA-wired with a `manifest.json` and sometimes a `capacitor.config.json` for Android packaging. Examples: `afridiverse-os`, `for-my-noor`, `ib-afridi-huntverse`, `ib-afridi-portfolio`, `khyberverse`, `noors-blush-garden`, `port`, `school-managment-system`, `sehatverse-qanoonverse`.

2. **Full-stack workspace** (`huntverse-arena-2`) — an npm workspaces monorepo with three packages: `client` (Next.js 14 App Router), `server` (Express + Prisma + PostgreSQL), `socket` (Socket.IO). This is the only project with a real runtime, a database schema, and a build pipeline.

**Technology stack (the full-stack project):**

- **Client:** Next.js 14.2.5 (App Router), React 18.3.1, framer-motion, three.js, xterm (terminal emulation), socket.io-client, @monaco-editor/react
- **Server:** Express 4.19.2, Prisma 5.18.0, PostgreSQL (`postgresql` provider), JWT, bcryptjs, zod, helmet, cors, ioredis
- **Socket:** Socket.IO (port 4001)
- **Orchestration:** `concurrently` runs all three; `docker-compose.yml` is provided for the challenge containers + services

**How execution starts (for huntverse-arena-2):**

- `npm run dev` → `concurrently` launches `dev:client`, `dev:server`, `dev:socket`.
- Client runs Next.js on port 3000; server on 4000; socket on 4001.
- `db:generate` / `db:migrate` delegate to the `server` workspace's Prisma scripts.

## Directory Structure

```
CODEX/
├── README.md                    # Developer's public portfolio / brand document (not project docs)
├── package-lock.json            # Empty root lockfile — no root dependencies
├── huntverse-arena-2/           # ★ The ONLY real full-stack app (npm workspaces)
│   ├── package.json             # root: workspaces ["client","server","socket"], concurrently dev
│   ├── docker-compose.yml
│   ├── .env.example             # DATABASE_URL, REDIS_URL, JWT_SECRET, API/SOCKET URLs, CHALLENGE_NETWORK
│   ├── client/                  # Next.js 14 App Router frontend (port 3000)
│   │   └── app/
│   │       ├── layout.js, page.js, globals.css
│   │       ├── arena/           # Bug-bounty arena UI
│   │       ├── labs/            # Challenge labs UI
│   │       ├── leaderboard/     # Leaderboard page
│   │       └── profile/[username]/
│   ├── server/                  # Express + Prisma backend (port 4000)
│   │   ├── prisma/schema.prisma # User, Room, RoomMember, Challenge, Submission + enums
│   │   └── src/index.js         # Single-file Express app (tsx watch)
│   └── socket/                  # Socket.IO server (port 4001)
├── ib-afridi-huntverse/         # Static bug-bounty arena prototype (HTML/CSS/JS)
├── ib-afridi-portfolio/         # Dark cybersecurity portfolio (index.html, Three.js/GSAP)
├── khyberverse/                 # Bara/Peshawar super-app PWA concept
├── sehatverse-qanoonverse/      # Health + justice OS PWA concept
├── afridiverse-os/              # Static web OS concept (index.html + manifest)
├── for-my-noor/                 # Static personal PWA (index.html + manifest)
├── noors-blush-garden/          # Flower-pink morning diary PWA
├── school-managment-system/     # EduCore school ERP prototype (static)
└── port/                        # Earlier portfolio iteration (index.html, style.css, script.js)
```

## Key Abstractions

The meaningful abstractions live **only** in `huntverse-arena-2`, because that is the only actual application. The other projects are HTML documents with no programmatic abstraction worth documenting.

### Prisma Data Model (`server/prisma/schema.prisma`)

- **File:** `huntverse-arena-2/server/prisma/schema.prisma`
- **Models:** `User` (id, username unique, email unique, passwordHash, reputation, firstBloods, submissions, memberships), `Room` (id, code unique, status enum, flagSeed, members, submissions), `RoomMember` (composite unique on roomId+userId, score, joinedAt), `Challenge` (slug unique, name, category, points, containerImage, submissions), `Submission` (roomId, userId, challengeId, flagHash, status enum, points, createdAt)
- **Enums:** `RoomStatus` (WAITING, ACTIVE, FINISHED), `SubmissionStatus` (PENDING, ACCEPTED, REJECTED)
- **Key decision:** Uses `cuid()` for all primary keys and `String` for IDs (not auto-increment ints), which is the Prisma idiom for distributed-friendly IDs.

### Server (`server/src/index.js`)

- **File:** `huntverse-arena-2/server/src/index.js`
- **Responsibility:** Single-file Express app — routes, auth (JWT + bcryptjs), validation (zod), Prisma data access, helmet/cors security middleware, ioredis integration.
- **Lifecycle:** Started via `tsx watch` in dev; runs on port 4000.

### Client (`client/app/`)

- **File:** `huntverse-arena-2/client/app/*`
- **Responsibility:** Next.js App Router UI. Routes: `/`, `/arena`, `/labs`, `/leaderboard`, `/profile/[username]`.
- **Key libraries:** framer-motion for animation, three.js for 3D visuals, xterm for an embedded terminal, socket.io-client for real-time room updates, @monaco-editor/react for code editing.
- **Lifecycle:** Next.js dev server on port 3000; consumes the API at `NEXT_PUBLIC_API_URL` and socket at `NEXT_PUBLIC_SOCKET_URL`.

### Socket Server (`socket/`)

- **File:** `huntverse-arena-2/socket/`
- **Responsibility:** Real-time layer — broadcasts room state changes, submissions, leaderboard updates to connected clients.
- **Lifecycle:** Runs on port 4001, connected to by `socket.io-client` in the Next.js frontend.

## Data Flow (huntverse-arena-2)

1. Browser loads Next.js app on port 3000 → `app/layout.js` + route pages render.
2. Client makes HTTP calls to API at `NEXT_PUBLIC_API_URL` (localhost:4000 in dev).
3. Express server (`server/src/index.js`) authenticates with JWT, validates with zod, queries Prisma.
4. Prisma connects to PostgreSQL via `DATABASE_URL` env var.
5. For real-time features, client opens a Socket.IO connection to `NEXT_PUBLIC_SOCKET_URL` (port 4001); the socket server broadcasts room/submission events.
6. Challenge containers are orchestrated via docker-compose; the `CHALLENGE_NETWORK` env var defines the Docker network they attach to.

This is a **classic three-tier architecture** (React SPA-ish Next.js → Express API → PostgreSQL/Redis), with an added real-time layer (Socket.IO) and an infrastructure layer (Docker challenge containers).

## Non-Obvious Behaviors & Design Decisions

- **The root README is a portfolio, not documentation.** It describes aspirational projects (IAPF, Recon Suite, Afridi.Store) that do NOT have directories in this workspace. Several listed projects are hosted elsewhere (e.g., "Afridi.Store" links to a separate Vercel deployment, "IB Afridi Pentest Framework" links to a separate GitHub repo). The files present in `CODEX/` are only a subset of the projects the README describes. A newcomer must not assume every README item maps to a local directory.

- **`package-lock.json` at root is empty.** `packages: {}` means nothing is installed at the root. All real dependencies live under `huntverse-arena-2`. This is unusual — most monorepos put shared dependencies at the root, but here workspaces are isolated. The root is effectively a landing page + folder container.

- **Only one project has a database schema and a runtime.** Every other subdirectory is static HTML. So "codebase" knowledge is overwhelmingly concentrated in `huntverse-arena-2`. Everything else is readable as-is in a browser.

- **`huntverse-arena-2` is not the same as the older `ib-afridi-huntverse`.** The latter is a static prototype (HTML/CSS/JS); the former is the full-stack rewrite with Next.js + Express + Prisma + Socket.IO. They share the same concept (a bug-bounty arena) but are entirely different codebases with no shared code. This is a common source of confusion — the README links to the static one in the Atlas table while the newer arena lives in a subfolder.

- **Security is thematic, not literal for the static projects.** The README explicitly states the frontend recon interfaces are visual prototypes and do not perform live scanning. Several static projects have `capacitor.config.json`, meaning they were/are packaged as Android apps via Capacitor.

- **The workspace is PWA-leaning.** `afridiverse-os`, `for-my-noor`, `noors-blush-garden`, `khyberverse`, and `sehatverse-qanoonverse` each carry a `manifest.json`, making them installable as PWAs.

## Module Reference

| File / Dir                                      | Purpose                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `README.md`                                     | Developer's personal portfolio; documents 13+ projects across security, 3D, web, and app concepts |
| `huntverse-arena-2/`                            | Full-stack bug-bounty arena (workspaces: client/server/socket)                                    |
| `huntverse-arena-2/server/prisma/schema.prisma` | Prisma schema — User, Room, RoomMember, Challenge, Submission models + enums                      |
| `huntverse-arena-2/server/src/index.js`         | Express API — auth, validation, Prisma access, middlewares                                        |
| `huntverse-arena-2/client/app/`                 | Next.js App Router pages (arena, labs, leaderboard, profile)                                      |
| `huntverse-arena-2/socket/`                     | Socket.IO real-time broadcast server                                                              |
| `ib-afridi-huntverse/index.html`                | Static bug-bounty arena prototype                                                                 |
| `ib-afridi-portfolio/index.html`                | Dark cybersecurity portfolio (Three.js/GSAP)                                                      |
| `khyberverse/index.html`                        | Bara/Peshawar super-app PWA prototype                                                             |
| `sehatverse-qanoonverse/index.html`             | Health + justice OS PWA prototype                                                                 |
| `afridiverse-os/index.html`                     | Static "web OS" concept                                                                           |
| `for-my-noor/index.html`                        | Personal PWA                                                                                      |
| `noors-blush-garden/index.html`                 | Flower-themed PWA diary                                                                           |
| `school-managment-system/index.html`            | EduCore school ERP prototype                                                                      |
| `port/`                                         | Earlier portfolio iteration (index.html/style.css/script.js)                                      |

## Suggested Reading Order

For a developer joining this workspace:

1. **`README.md`** — Understand the developer's brand, project list, and the local monorepo structure. This is the map.
2. **`huntverse-arena-2/package.json`** — Understand the one real application: its workspaces and dev orchestration.
3. **`huntverse-arena-2/server/prisma/schema.prisma`** — The data model. This is where the actual business logic persists.
4. **`huntverse-arena-2/client/app/page.js`** — Entry UI. See how the Next.js App Router is wired.
5. **`huntverse-arena-2/.env.example`** — All env vars and their ports (DATABASE_URL, REDIS_URL, JWT_SECRET, API/SOCKET URLs, CHALLENGE_NETWORK).
6. **`huntverse-arena-2/server/src/index.js`** — The whole backend in one file. Understand the API surface and how Prisma/JWT/zod/helmet/cors/ioredis fit together.

---

**Important note for the requested "DIGITAL LAPTOP" build:** Nothing resembling a full-stack laptop store exists in this workspace yet. `CODEX` currently contains only the projects listed above. The build task described (Next.js 14 + Tailwind + Shadcn + Prisma + Neon + Cloudinary, with Product/Order/OrderItem/Customer models and a `/admin` panel) is a **new, greenfield project** that would need to be scaffolded from scratch, most likely as a new subdirectory (e.g., `digital-laptop/`). It would follow the same architectural idiom already proven in `huntverse-arena-2` (Next.js `client` + Prisma `server`), but with a Prisma schema tailored to products/orders/customers and a PostgreSQL/Neon datasource.
