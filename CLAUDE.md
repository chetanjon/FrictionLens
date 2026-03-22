# FrictionLens - Agent Coordination Guide

## Project Overview

FrictionLens is an AI-powered app review intelligence tool that synthesizes hundreds of app store reviews into a single actionable **Vibe Report**. It analyzes reviews across 5 sentiment dimensions (Love, Frustration, Loyalty, Momentum, Word-of-Mouth), surfaces key churn drivers, generates Friction Scores per feature, and produces shareable report URLs.

**Repository:** https://github.com/chetanjon/FrictionLens.git
**Author:** Chetan Jonnalagadda

## Tech Stack (Locked Decisions)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Server components, streaming UI |
| Styling | Tailwind CSS 4 + shadcn/ui | Accessible component library |
| Database | Supabase (PostgreSQL + Auth + RLS) | Apps, reviews, analyses, user accounts |
| AI | Google Gemini via `@ai-sdk/google` (Vercel AI SDK) | Sentiment analysis, structured output |
| Default Model | `gemini-2.5-flash` | Best price-performance, 10 RPM free tier |
| CSV Parsing | Papaparse | Client-side review ingestion |
| Background Jobs | Inngest v4 | Review analysis orchestration, step-based retry |
| Caching | Upstash Redis + @upstash/ratelimit | Rate limiting, search/review caching |
| Testing | Vitest | Unit + integration tests |
| Analytics | PostHog (Phase 4) | Usage tracking, funnel metrics |
| Email | Resend (Phase 4) | Report notifications |
| Hosting | Vercel | Edge deployment, serverless |

## Architecture Decisions

- **App Router only** — no Pages Router. All routes under `src/app/`
- **Server Components by default** — `"use client"` only when needed (forms, interactivity)
- **Server Actions for mutations** — no API routes unless needed for webhooks/external services
- **Supabase client setup:** `@supabase/ssr` for server, `@supabase/supabase-js` for browser
- **API keys stored encrypted** in `user_settings` table (AES-256-GCM via `ENCRYPTION_KEY` env var)
- **All AI calls** go through `src/lib/ai/gemini.ts` abstraction (uses `generateText` + `Output.object()` from AI SDK v6)
- **Analysis pipeline** extracted to `src/lib/analysis/run-pipeline.ts` — shared by direct SSE mode and Inngest background mode
- **Inngest optional** — falls back to direct execution when `INNGEST_EVENT_KEY` is not set
- **Redis optional** — falls back to in-memory rate limiting when `UPSTASH_REDIS_REST_URL` is not set
- **Users bring their own Gemini API key** from Google AI Studio (aistudio.google.com)
- **Review classification tiers:** Tier 1 (trivial, no AI), Tier 2 (short, rule-based), Tier 3 (detailed, Gemini)

## Coding Conventions

- **Strict TypeScript** — no `any` types
- Use `type` over `interface` unless extending
- **Named exports** (no default exports except `page.tsx` / `layout.tsx`)
- **File naming:** kebab-case for files, PascalCase for React components
- **Zod** for all runtime validation (form inputs, API responses, AI output)
- **Error boundaries** at layout level
- Use `cn()` utility from `src/lib/utils.ts` for conditional Tailwind classes
- **Colors:** `frictionBlue (#4A90D9)`, `frictionRed (#D94F4F)`, `frictionAmber (#D4A843)`
- **Fonts:** Plus Jakarta Sans (sans), IBM Plex Mono (mono), Newsreader (serif/display)
- Score-to-color: `>7 = red, >4 = amber, else blue`
- Glass card effect: `bg-white/65 backdrop-blur-xl border border-slate-200/60 rounded-2xl`

## Directory Structure

```
src/
  app/
    (auth)/login/page.tsx, signup/page.tsx, callback/route.ts
    (dashboard)/
      layout.tsx, page.tsx
      settings/page.tsx
      analysis/[id]/page.tsx
    (marketing)/layout.tsx, page.tsx
    vibe/[slug]/page.tsx
    api/analyze/route.ts (SSE streaming, Inngest dispatch or direct pipeline)
    api/analyze/status/route.ts (polling endpoint for background analysis progress)
    api/apps/search/route.ts (cached app store search)
    api/apps/reviews/route.ts (cached review pulling)
    api/inngest/route.ts (Inngest serve handler)
    layout.tsx, globals.css
  components/
    ui/                    — shadcn/ui components
    report/                — Vibe Report components (glass-card, radar-chart, friction-bar, sections/*)
    analysis/              — CSV upload, paste input, app-store-search, competitor-select
    layout/                — Nav, sidebar
    marketing/             — Landing page sections
  lib/
    supabase/              — client.ts, server.ts
    ai/                    — gemini.ts, prompts.ts, schemas.ts, classify.ts, generate-report.ts, analyze-competitor.ts
    analysis/              — run-pipeline.ts (extracted pipeline logic, shared by SSE + Inngest)
    cache/                 — redis.ts (Upstash client), keys.ts (key builders), rate-limiter.ts (Redis + in-memory fallback)
    inngest/               — client.ts, is-enabled.ts, progress.ts, functions/run-analysis.ts
    crypto.ts              — API key encryption/decryption
    utils.ts               — cn() and general utilities
    constants.ts           — Color mappings, tier definitions
    types/                 — review.ts, database.ts
  middleware.ts            — Auth route protection
supabase/
  migrations/              — SQL migration files
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (server only)
ENCRYPTION_KEY=                    # 32-byte hex for API key encryption (openssl rand -hex 32)
GOOGLE_GENERATIVE_AI_API_KEY=      # Optional fallback Gemini key for demo
NEXT_PUBLIC_APP_URL=               # App URL (http://localhost:3000 in dev)

# Optional: Upstash Redis (caching + distributed rate limiting)
UPSTASH_REDIS_REST_URL=            # Upstash Redis REST URL
UPSTASH_REDIS_REST_TOKEN=          # Upstash Redis REST token

# Optional: Inngest (background jobs — falls back to direct execution if not set)
INNGEST_EVENT_KEY=                 # Inngest event key (production)
INNGEST_SIGNING_KEY=               # Inngest signing key (production)
# INNGEST_DEV=1                    # Enable Inngest dev mode without keys
```

## Phase Tracking

| Phase | Description | Status |
|-------|------------|--------|
| 1 | Foundation (auth, settings, CSV upload, basic analysis, results) | **Complete** |
| 2 | Full Vibe Report (all 8 sections, public sharing) | **Complete** |
| 3A | App Store Auto-Pull (search + pull reviews from iOS/Android) | **Complete** |
| 3B | Progress Streaming (SSE-based real-time analysis progress) | **Complete** |
| 3C | Background Jobs (Inngest orchestration, step-based retry) | **Complete** |
| 3D | Caching (Upstash Redis for rate limiting + result caching) | **Complete** |
| 4A | Competitor Vibe Battles (head-to-head comparison, up to 3 competitors) | **Complete** |
| 4B | Dynamic OG Images (auto-generated social cards for shared reports) | **Complete** |
| 4C | Analytics + Polish (PostHog, Slack alerts, landing page) | **Complete** |

## Available Gemini Models (Free Tier)

| Model | RPM | RPD | TPM | Use Case |
|-------|-----|-----|-----|----------|
| `gemini-2.5-flash` (default) | 10 | 250 | 250K | Best balance of speed and quality |
| `gemini-2.5-flash-lite` | 15 | 1000 | 250K | Fastest, highest throughput |
| `gemini-2.5-pro` | 5 | 100 | 250K | Most advanced reasoning |
| `gemini-2.0-flash` | 15 | 1500 | 1M | Previous gen, highest free limits |

Rate limiting is enforced via `src/lib/cache/rate-limiter.ts` — uses Upstash Redis sliding window when available, falls back to in-memory buckets.

## Reference Files

- `../frictionlens_landing_v3.jsx` — Landing page UI reference (inline React styles)
- `../frictionlens_vibe_report_v3.jsx` — Vibe Report UI reference (inline React styles)
- `../FrictionLens_Developer_Handbook_v1.docx` — Full product specification

## Vibe Score Formula

```
vibeScore = (avgLove * 0.25 + (10 - avgFrustration) * 0.25 + avgLoyalty * 0.2 + avgMomentum * 0.15 + avgWom * 0.15) * 10
```
Result is 0-100 scale. Colors: >= 75 blue, >= 50 amber, < 50 red.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run Vitest test suite
npm run test:watch   # Run Vitest in watch mode
npx inngest-cli@latest dev  # Start Inngest Dev Server (for local background jobs)
```
