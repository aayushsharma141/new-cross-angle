# Technology Stack

**Analysis Date:** 2026-06-08

## Languages

**Primary:**
- TypeScript 5.8 - All client application code and internal package types
- SQL (PostgreSQL dialect) - Database tables, triggers, policies, and migrations

**Secondary:**
- JavaScript / CommonJS - Build and optimization scripts (`apps/web/scripts/`), config files
- Deno TypeScript - Supabase Edge Functions (`supabase/functions/`)

## Runtime

**Environment:**
- Node.js (LTS version) - Local development and build environment
- Deno - Edge runtime environment for Supabase Edge Functions
- Modern Browser runtimes - Client-side execution

**Package Manager:**
- npm 10.x - Monorepo workspaces coordinator
- Lockfile: `package-lock.json` present at project root

## Frameworks

**Core:**
- React 18.3 - Client-side component framework
- React Router DOM 6.30 - Client-side SPA routing and navigation

**Testing:**
- Playwright 1.59 - End-to-end testing and integration flows (configured in `playwright.config.ts`)

**Build/Dev:**
- Vite 5.4 - Fast dev server and bundling utility (`vite.config.ts`)
- Tailwind CSS 3.4 - Styling compilation pipeline (`tailwind.config.ts`, `postcss.config.js`)
- TypeScript 5.8 - Static type-checking and build validation (`tsconfig.json`, `tsconfig.base.json`)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.48.1 - Backend database client and real-time synchronizer
- `@tanstack/react-query` 5.83.0 - Server state caching and data-fetching hooks
- `react-hook-form` 7.61.1 - Form controller and validation coordinator
- `zod` 3.25.76 - Type-safe schema validation (client forms, edge functions)
- `framer-motion` 11.11.17 - Interface transitions and layout animations
- `gsap` 3.14.2 - Advanced scroll-linked micro-interactions and animations

**Infrastructure:**
- `lucide-react` 0.462.0 - Vector icon suite
- `next-themes` 0.3.0 - Light/dark theme toggle integration
- `embla-carousel-react` 8.6.0 - Touch-friendly slider component
- `class-variance-authority` 0.7.1 - Utility for handling CSS class states and styles

## Configuration

**Environment:**
- Configured using `.env` and `.env.local` files
- Key requirements: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_POSTHOG_KEY`, `VITE_IMAGEKIT_URL_ENDPOINT`

**Build:**
- `tsconfig.base.json` / `tsconfig.json` - Shared TypeScript rules
- `vite.config.ts` - Path resolution, React SWC integration, and bundling optimizations
- `tailwind.config.ts` - Customized font families (`Cormorant Garamond`, `DM Sans`), keyframes, and custom layout tokens

## Platform Requirements

**Development:**
- Cross-platform compatible (Windows / macOS / Linux)
- Supabase CLI installed locally for migrations and edge function emulation

**Production:**
- Vercel - Public website hosting (`apps/web` deployment)
- Supabase Cloud - Managed PostgreSQL database, Edge Functions hosting, and Storage buckets

---

*Stack analysis: 2026-06-08*
*Update after major dependency changes*
