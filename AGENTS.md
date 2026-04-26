# 🤖 AI Agent Information (AGENTS.md)

Welcome, fellow Agent! This document provides context on the architecture and key components of **PartyMixer** to help you understand and modify the codebase efficiently.

## 🏗️ Project Architecture

PartyMixer is a Next.js application built with the App Router. It uses a custom file-based persistence layer to ensure it works on standard container-based hosts (like Railway/Render).

### Key Directories

- **/src/app**: Next.js App Router routes.
  - `/api/requests`: Handles song queue (GET, POST, DELETE).
  - `/api/requests/reorder`: Handles drag-and-drop persistence (PUT).
  - `/api/requests/skip`: Handles song skipping and triggers the **Auto-Mix Discovery** logic.
  - `/api/search`: Proxies YouTube searches for live previews.
  - `/guest`: The mobile-first page where users request songs and view lyrics.
  - `/host`: The DJ dashboard for controlling playback.
- **/src/lib**: Core logic.
  - `playlist.ts`: The persistence engine. Manages `playlist.json`.
  - `youtube.ts`: Search and discovery logic. Includes scrapers and support for the YouTube Data API.

## 🔑 Crucial Logic to Understand

### 1. The Auto-Mix Discovery Engine
Located in `src/lib/youtube.ts` (`getRecommendedVideos`) and triggered in `src/app/api/requests/skip/route.ts`.
- It searches for `${currentSong} similar songs`.
- It **must** filter results to avoid duplicates (same song, different uploader).
- It adds a random choice from the filtered results to keep the playlist fresh.

### 2. Smooth Transitions
Located in `src/app/host/page.tsx`.
- The dashboard polls the current playback time.
- 5 seconds before the end, it triggers `handleSmoothSkip`.
- `handleSmoothSkip` performs a 300ms-stepped volume fade-out before calling the skip API.

### 3. Lyrics Logic
Located in `src/app/guest/page.tsx`.
- Uses the **LRCLib** public API (`https://lrclib.net/api/search`).
- Implements a fallback: if `Track + Artist` fails, it searches by `Track` only.

## 📦 Persistence
The app stores the queue in `/playlist.json`.
- **Production Warning**: When deploying to containerized environments, ensure this file is on a persistent volume, or the queue will reset on every deploy/restart.

## 🛠️ Tech Stack
- **Next.js** (App Router & Turbopack)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations & Reordering)
- **react-youtube** (YouTube Player API)
- **Lucide React** (Icons)
- **yt-search** (Scraping fallback)

Happy coding, Agent! 🚀
