# Moxn — Recipe Platform

A recipe discovery, creation, and curation platform built with Next.js 15, Supabase, and a custom design token system (see `framework.md` for the full design spec).

## Stack
- **Framework:** Next.js 15 (App Router)
- **Auth/DB:** Supabase (`@supabase/ssr`)
- **State:** Zustand
- **Styling:** Tailwind CSS v4 with custom design tokens (light/dark themes)
- **PWA:** `next-pwa` — installable, works offline via a generated service worker

## Local Setup

```bash
npm install
cp .env.local.example .env.local
# fill in your Supabase project URL and anon key in .env.local
npm run dev
```

## Required Environment Variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |

**These must also be set in your Vercel project's Environment Variables** (Project → Settings → Environment Variables) — `.env.local` is gitignored and never gets deployed, so Vercel needs its own copy of these values for both Production and Preview environments.

## Database

Run `supabase/schema.sql` against your Supabase project to set up the tables (`recipes`, `profiles`, `flagged_content`, etc.).

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run the production build locally
- `npm run lint` — lint the project

## Structure

- `src/app/(user)` — public discovery routes (browse, recipe detail, collections, profile)
- `src/app/(creator)` — creator studio ("Kitchen Workbench")
- `src/app/(admin)` — moderation/curation dashboard ("Command Deck")
- `src/app/(auth)` — login/signup
- `src/components` — shared UI, layout, and recipe-specific components
- `src/lib/supabase` — Supabase client setup (browser, server, middleware)
- `src/lib/stores` — Zustand stores (auth, recipes, theme, toasts)
