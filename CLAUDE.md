# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Flappy Bird clone built with React + TypeScript frontend and Hono backend, deployed on Cloudflare Workers with D1 database.

**Live URL**: https://flappy-bird.abe00makoto.workers.dev

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Canvas API, Web Audio API
- **Backend**: Hono with RPC-style API
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Deployment**: Cloudflare Workers + Pages

## Project Structure

```
src/
├── App.tsx              # Main app component with nickname state
├── App.css              # Global styles including mobile responsiveness
├── main.tsx             # React entry point
├── client/
│   ├── components/
│   │   ├── Game.tsx           # Main game component
│   │   ├── GameOverModal.tsx  # Score submission & ranking display
│   │   └── Ranking.tsx        # Ranking display component
│   ├── hooks/
│   │   └── useGame.ts         # Game logic (physics, collision, difficulty)
│   └── lib/
│       ├── api.ts             # Hono RPC client
│       └── sound.ts           # Web Audio API sounds & BGM
└── server/
    ├── index.ts               # Hono server entry point
    ├── worker-types.d.ts      # Cloudflare Worker types
    └── db/
        └── schema.ts          # Drizzle schema (scores table)
```

## Commands

```bash
# Development
npm run dev           # Start Vite dev server (frontend only)
npm run dev:server    # Start Wrangler dev server (full stack)

# Build & Deploy
npm run build         # TypeScript check + Vite build
npm run deploy        # Build and deploy to Cloudflare Workers

# Database
npm run db:generate       # Generate Drizzle migrations
npm run db:migrate        # Apply migrations to production D1
npm run db:migrate:local  # Apply migrations to local D1

# Other
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

## API Endpoints

- `POST /api/scores` - Submit score `{ nickname: string, score: number }`
- `GET /api/scores/ranking` - Get top 10 scores with timestamps

## Game Features

- Canvas-based rendering with mobile fullscreen support
- Progressive difficulty (gap shrinks, speed increases every 5 points)
- Original BGM and sound effects (Web Audio API)
- Top 10 ranking with JST timestamps
- Nickname persistence within session (not localStorage)

## Database Schema

```sql
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## Key Implementation Details

- **Difficulty System** (`useGame.ts`): Initial gap 200px, min 130px; speed 2-4
- **Date Display**: UTC stored, converted to JST (UTC+9) in `formatDate()`
- **Mobile**: Uses `100dvh` for full viewport, hides overflow
- **Sound**: Procedural audio with oscillators, no external files

## Environment

- D1 database binding: `DB`
- Database name: `flappy-bird-db`
- No environment variables required (secrets in Cloudflare dashboard if needed)
