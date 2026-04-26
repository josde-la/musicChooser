# 🎵 PartyMixer: The Ultimate AI DJ Experience

PartyMixer is a modern, premium web application designed for parties, events, and gatherings. It allows guests to easily request songs via a QR code, while providing the host with a professional-grade DJ dashboard featuring smart auto-mixing and discovery.

![License](https://img.shields.io/badge/license-MIT-purple.svg)
![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Ready-blue.svg)

## ✨ Features

- **🚀 Instant Guest Requests**: Guests can simply scan a QR code and type a song name. No artist name or app installation required.
- **✨ DJ Auto-Mix (Discovery Mode)**: When the playlist ends, the AI automatically finds and adds similar music, ensuring the party never stops.
- **🎙️ Live Lyrics**: Guests can view real-time lyrics for the currently playing song directly on their phones.
- **🎛️ Host Dashboard**:
  - Drag-and-drop reordering.
  - Smooth 5-second professional volume fade transitions.
  - Playback progress slider and full playback controls.
- **🎨 Premium Aesthetics**: A dark, glassmorphic UI with vibrant neon accents and fluid animations.
- **📦 Persistence Ready**: Optimized for deployment on services like Railway or Render with support for persistent local storage.

## 🛠️ Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd music
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` or set these in your hosting dashboard:
   - `YOUTUBE_API_KEY` (Optional): For 100% reliable YouTube search. If omitted, the app will use a robust scraper fallback.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 🚀 Deployment

This app is optimized for **Railway** or **Render**.

### Persistence Tip:
Since the app uses a local `playlist.json` for storage, ensure you mount a **Persistent Volume/Disk** at the root of the application (or specifically for `playlist.json`) in your hosting dashboard. This ensures your party queue is saved even if the server restarts.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for the perfect party experience.
