# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flappy Bird clone with React frontend and Hono backend, deployed on Cloudflare Workers with D1 database.

**Live URL**: https://flappy-bird.abe00makoto.workers.dev

## Commands

```bash
npm run dev           # Vite dev server (frontend only, no API)
npm run dev:server    # Wrangler dev server (full stack with API)
npm run build         # TypeScript check + Vite build
npm run deploy        # Build and deploy to Cloudflare Workers

npm run db:generate       # Generate Drizzle migrations
npm run db:migrate        # Apply migrations to production D1
npm run db:migrate:local  # Apply migrations to local D1
```

## Architecture

**Frontend-Backend Communication**: Uses Hono RPC for type-safe API calls. The server exports `AppType` from `src/server/index.ts`, which the client imports in `src/client/lib/api.ts` to get typed API methods via `hc<AppType>()`.

**Game Loop**: All game logic is in `src/client/hooks/useGame.ts`. Uses `requestAnimationFrame` for the game loop with physics (gravity, velocity) calculated at a base resolution of 400x600, then scaled for display.

**Progressive Difficulty**: Every 5 points, gap decreases (200→130px) and speed increases (2→4). Each pipe stores its own gap value at creation time.

**Audio**: Procedural sounds generated via Web Audio API oscillators in `src/client/lib/sound.ts`. No external audio files.

**Static Assets**: Served from Vite build (`dist/`) via `@cloudflare/kv-asset-handler` with SPA fallback to `index.html`.

## Key Files

- `src/server/index.ts` - Hono API routes and static file serving
- `src/client/hooks/useGame.ts` - Game physics, collision, difficulty
- `src/client/lib/sound.ts` - Procedural audio (BGM, effects)
- `src/server/db/schema.ts` - Drizzle schema for scores table

## API

- `POST /api/scores` - Submit `{ nickname: string, score: number }`
- `GET /api/scores/ranking` - Top 10 scores

## Notes

- Dates stored as UTC, displayed in JST (UTC+9)
- Mobile uses `100dvh` for fullscreen canvas
- D1 binding: `DB`, database: `flappy-bird-db`
