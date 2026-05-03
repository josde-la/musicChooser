# 🎵 PartyMixer: The Ultimate AI DJ Experience (Multitenant Edition)

PartyMixer is a modern, premium web application designed for bars, restaurants, and events. With the new **Multitenant Architecture**, a single deployment can now serve multiple venues simultaneously, providing each with their own unique party link, queue, and dashboard.

![License](https://img.shields.io/badge/license-MIT-purple.svg)
![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg)
![Supabase](https://img.shields.io/badge/Supabase-DB-green.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Ready-blue.svg)

## ✨ Features

- **🏢 True Multitenancy**: Run multiple local venues seamlessly. Each venue gets an isolated dashboard via `/[slug]`.
- **📻 Dual Operation Modes**:
  - **Mode A (Manual)**: Incoming requests land in an Inbox. The venue staff or DJ reviews and accepts the requests manually. Avoids absolute chaos in themed bars.
  - **Mode B (Automatic)**: Songs are automatically accepted and directly pushed to the queue based on configured rules. Perfect for locations with less staff overhead.
- **🚀 Instant Guest Requests**: Guests scan a venue-specific QR code and type a song name.
- **✨ AI Discovery Mode**: When the playlist ends, it adds similar track recommendations based on recent playback.
- **🎙️ Live Lyrics**: Guests view real-time lyrics on their phones for the currently playing track.
- **🎨 Premium Aesthetics**: A dark, glassmorphic UI with vibrant neon accents and fluid animations.

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

3. **Supabase Database & SSR Setup**:
   This app uses `@supabase/ssr` for secure server-side authenticated sessions.
   Create a new project in [Supabase](https://supabase.com). Run the `supabase_schema.sql` file provided in the repository root in your Supabase SQL Editor to create the required tables:
   - `locales` (Bar Configuration and Settings)
   - `peticiones` (Song Requests and Inbox)
   - `usuarios_admin` (Admin accounts for DJ logins)

4. **Environment Variables (.env.local)**:
   Create a `.env.local` file in the root of the project with your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   YOUTUBE_API_KEY=OPTIONAL_YOUTUBE_KEY
   ```

5. **Run Locally (Development)**:
   To run the application locally on your machine for testing:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

6. **Create Your First Venue**:
   Open the Supabase SQL Editor and run the following command to create your first venue. (Note: The `nombre` field is strictly required).
   ```sql
   INSERT INTO locales (nombre, slug, auto_aceptar)
   VALUES ('The Rock Bar', 'rock-bar', false);
   ```
   Then visit `http://localhost:3000/rock-bar/host` to access that venue's isolated DJ dashboard!

## 🚀 Deployment

Because the application uses Supabase for its backend, the application is **stateless**. This makes it incredibly easy to deploy anywhere without worrying about persistent volumes.

### 🚆 Deploying to Railway (Recommended for Fullstack Next.js)
Railway is the easiest platform for Next.js apps with Node.js servers.
1. Connect your GitHub repository to Railway.
2. Railway will automatically detect Next.js and build it.
3. In the Railway Variables tab, add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Your application will be live immediately!

### ☁️ Deploying to Cloudflare Pages
Since this app relies on standard Node.js Next API routes, deploying to Cloudflare edges natively requires `@cloudflare/next-on-pages`.
1. Install `npm install -D @cloudflare/next-on-pages`.
2. Add a build script: `"pages:build": "npx @cloudflare/next-on-pages"`.
3. Connect the repo to Cloudflare Pages, use `npm run pages:build`, and set the exact environment variables in the Cloudflare dashboard.

## ⚖️ Legal Disclaimer (Commercial Use in Spain)

**⚠️ CRITICAL FOR B2B FRANCHISING IN BARS:**
Currently, by default, the host dashboard uses a headless YouTube client (`react-youtube`) to playback the music directly.

**If you sell this service to commercial establishments in Spain (Bars, Restaurants, Clubs):** playing music directly from YouTube, Spotify Personal, or Apple Music in a commercial venue violates Consumer Terms of Service and does **not** cover the commercial public performance rights required by **SGAE & AGEDI**.

**To be 100% lawful:** DO NOT USE the built-in YouTube player in commercial scenarios. The venues must have a commercial license. We have equipped the `locales` database table with the `reproductor_api_key` and `reproductor_type` fields.
You must configure the app to sync accepted songs directly to the queues of legal B2B clients such as **Soundtrack Your Brand (SYB)** via their API, bypassing web-browser playback entirely.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for the perfect party experience.
