# 🤖 AI Agent Information (AGENTS.md)

Welcome, fellow Agent! This document provides context on the architecture and key components of **PartyMixer** to help you understand and modify the codebase efficiently.

## 🏗️ Project Architecture (Multitenant Upgrade)

PartyMixer is a Next.js application built with the App Router. We recently modernized the app to feature a robust **Postgres DBMS integration (via Supabase)**, enabling multitenancy so a single deployment handles multiple venues simultaneously.

### Key Directories

- **/src/app/[slug]**: Multitenant Next.js App Router routes.
  - `/api/[slug]/requests`: Tenant-isolated endpoints. Handles the song queue (GET, POST, DELETE, PUT).
  - `/api/[slug]/search`: Localized proxy for searches applying venue-specific configuration.
  - `/[slug]/guest`: The mobile-first page scoped to a specific venue.
  - `/[slug]/host`: The DJ dashboard for controlling isolated playback.
- **/src/lib**: Core logic.
  - `db.ts`: The central Supabase Data Layer, wrapping fetches to `locales` and `peticiones` tables. Use these functions instead of raw queries whenever possible!
  - `supabase.ts`: Supabase client initialization.
  - `youtube.ts`: Search, metadata validation, and discovery logic.

## 🔑 Crucial Logic to Understand

### 1. Dual Mode Operation (Inbox Control)
The application handles queuing with the explicit state from the `peticiones` table (`estado`: 'pendiente', 'aceptada', 'reproducida').
- Depending on the `locales.auto_aceptar` flag, new songs either go straight to `aceptada` or stay `pendiente`. The DJ must manually approve pending requests from the dashboard UI.

### 2. The Auto-Mix Discovery Engine
Located in `src/lib/youtube.ts` (`getRecommendedVideos`) and triggered in `src/app/api/[slug]/requests/skip/route.ts`.
- It searches for similar songs to keep the party fluid when the queue abruptly ends.

### 3. Lyrics Logic
Located in `src/app/[slug]/guest/page.tsx` and `src/lib/lyrics.ts`.
- Tries providers in order: **LRCLib** -> **Lyrics.ovh** -> **Lyrist**. Includes fuzzy search fallback.

## 📦 Persistence
We fully migrated away from the stateless local `playlist.json` implementation to **Supabase**! The queue architecture is completely robust for containerized, ephemeral, or serverless deployments.

## 🛠️ Tech Stack
- **Next.js** (App Router & Turbopack)
- **Supabase** (Postgres Data Engine)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations & Reordering)
- **react-youtube** (YouTube Player API)
- **Lucide React** (Icons)

Happy coding, Agent! 🚀
