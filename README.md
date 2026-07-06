# Pickleball Live — MVP (Phase 1)

Live pickleball scoring and tournament organizing. This is the Phase 1 MVP scaffold:
auth + guest mode, court/player setup, manual court assignment, live scoring with
QR scorer claim, mark winner, basic leaderboard.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres, Auth, Realtime Broadcast)
- Tailwind CSS
- `qrcode` (generate) + `html5-qrcode` (scan)
- `next-pwa` for installable home-screen app

## Setup

1. **Create a Supabase project** at supabase.com.
2. **Run the schema**: open the SQL editor in your Supabase dashboard and run
   the contents of `supabase/schema.sql`. This creates all tables, indexes,
   and row-level security policies, plus a trigger that auto-creates a
   `profiles` row on signup.
3. **Copy env vars**: `cp .env.local.example .env.local` and fill in your
   project URL, anon key, and service role key (Settings → API in Supabase).
   - `SUPABASE_SERVICE_ROLE_KEY` is used server-side only, in the two API
     routes (`/api/claim-token`, `/api/score-event`) so guest scorers with no
     Supabase auth session can still claim courts and post score events.
     Never expose this key to the client.
4. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```
5. Open `http://localhost:3000`.

## What's implemented

- **Auth**: magic-link login (`/login`), guest mode everywhere else (no
  account needed to play, score, or watch).
- **Event setup** (`/events/new`, `/events/[eventId]`): organizers create an
  event, set court count, add guest or registered players, and start a
  match by selecting 4 players + a court.
- **Live scoring** (`/court/[courtId]/scorer`): big +1 buttons per side,
  correct **side-out doubles scoring** (server 1/2, side-outs, server
  rotation) implemented in `lib/scoring.ts` — this is the detail most
  simplified scoring apps get wrong. Undo is a local stack, replayed to the
  server as an audit event. Score updates broadcast instantly over Supabase
  Realtime Broadcast to the court page and the `/live` dashboard.
- **QR claim flow**: each idle court shows a single-use, 15-minute token as
  a QR code (`/api/claim-token`). Scanning it (in-app scanner at `/scan`, or
  any phone camera since it's a real URL) claims that court for the
  scanning device only — no login required.
- **Dashboard** (`/live`): all courts as cards, LIVE courts sorted first,
  status badges use color + icon + text (not color alone).
- **Leaderboard** (`/events/[eventId]/leaderboard`): wins, losses, win %,
  rating per event.

## What's stubbed for later phases

- **V2**: tournament bracket generation/auto-advance, shuffle/leaderboard
  seeding (the shuffle button currently just pre-selects players, it
  doesn't do smart seeding yet), `/brackets` is a placeholder.
- **V3**: guided tour (driver.js/react-joyride), dedicated TV/spectator
  mode (the court page doubles as read-only spectator view for now but
  isn't optimized for a big venue screen yet), Elo rating updates on game
  completion (schema and columns exist, but the write-back after a game
  ends isn't wired up yet — see the `TODO` below), profile stats polish.
- **PWA icons**: `public/manifest.json` references `/icons/icon-192.png` and
  `/icons/icon-512.png` — add real icon files before shipping; the app will
  still run without them, just without a proper home-screen icon.
- **Time Out / Change Side** buttons on the scorer screen are currently
  no-ops — wire these up if you want them to log events too.

### TODO before real venue use

- Wire up rating/win-loss updates: when a game's `status` flips to
  `completed`, update both teams' `profiles.wins/losses/rating`. Right now
  the `games` table records the winner, but nothing writes back to
  `profiles` yet.
- Add a retry queue for `/api/score-event` calls that fail on flaky court
  wifi — right now a failed POST is swallowed silently after the
  optimistic UI update, per principle #4 (optimistic UI + auto-retry).
- Add real PWA icons and an offline fallback page.
