# External Integrations

**Analysis Date:** 2026-06-08

## APIs & External Services

**Analytics & Tracking:**
- **PostHog** - Product usage tracking and analytics reporting
  - SDK/Client: Integrated via custom analytics provider
  - Endpoints: Ingest hooks in Supabase Edge Functions (`supabase/functions/sync-posthog-reporting/`)
- **Vercel Web Analytics & Speed Insights** - Real-time visitor logs and Core Web Vitals monitoring
  - SDK/Client: `@vercel/analytics/react`, `@vercel/speed-insights/react` (configured in `apps/web/src/App.tsx`)
- **Google Sheets API** - Synchronizes user consultation leads to spreadsheet logs
  - Method: RPC function calls (`syncToGoogleSheets`)

**Messaging & Notifications:**
- **Telegram Bot API** - Developer alerts for hot leads and pipeline events
  - Method: Webhook caller in Supabase Edge Functions (`supabase/functions/notify-telegram/`, `supabase/functions/posthog-to-telegram/`)
  - Auth: Telegram token and chat ID stored in local vault secrets

## Data Storage

**Databases:**
- **Supabase PostgreSQL** - Primary database hosting all user tables, cms collections, crm stages, and auth roles
  - Connection: Local client connection string via `.env` configuration
  - Migrations: Managed in `supabase/migrations/` using timestamped SQL schemas
  - Database Client: `@supabase/supabase-js`

**File Storage & CDN:**
- **Supabase Storage** - Upload asset bucket (e.g. portfolio, blog photos, team avatars)
  - Buckets: `media` / `avatars`
- **ImageKit CDN** - Serves optimized, responsive media assets via global caching
  - Method: Transform helpers (`getOptimizedUrl`, `generateImageKitUrl` in `apps/web/src/lib/imagekit.ts`)
  - Base Endpoint: `VITE_IMAGEKIT_URL_ENDPOINT`

## Authentication & Identity

**Auth Provider:**
- **Supabase Auth** - Email/password authentication, password recovery, and secure session management
  - Client SDK: Direct call methods via `@supabase/supabase-js`
  - Auth Guards: Protected client paths validated in `apps/web/src/components/auth/AuthGuard.tsx` and role checking in `apps/web/src/components/admin/RoleGuard.tsx`
  - Session Storage: Handled locally using browser storage with automatic tokens refresh

## Monitoring & Observability

**Error Tracking:**
- **Sentry** - Frontend client error tracking and instrumentation boundary
  - SDK/Client: `@sentry/react` (integrated in `apps/web/src/App.tsx`)
  - Method: Global `ErrorBoundary` wrapper capturing client crashes

## Environment Configuration

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Main Supabase endpoint
- `VITE_SUPABASE_ANON_KEY` - Public database client token
- `VITE_POSTHOG_KEY` - Ingestion key for PostHog tracker
- `VITE_IMAGEKIT_URL_ENDPOINT` - ImageKit transform host

**Secrets Management:**
- Local secrets: `.env.local` (gitignored)
- Production secrets: Managed inside Vercel Dashboard settings and Supabase Vault Secrets dashboard

---

*Integration audit: 2026-06-08*
*Update when adding/removing external services*
