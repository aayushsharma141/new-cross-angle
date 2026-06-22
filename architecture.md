# ARCHITECTURE.MD — Cross Angle Interior System Architecture

> Derived from source code analysis — June 2026

---

## System Overview

Cross Angle Interior is a **client-side SPA** (Single Page Application) built with React + Vite, deployed on Vercel, backed by Supabase (PostgreSQL + Auth + Edge Functions).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                                                                         │
│   React 18 SPA (Vite build, code-split, lazy-loaded routes)            │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  CoreProviders (provider dependency injection tree)            │   │
│   │    React Query → Supabase PostgREST API (server state)         │   │
│   │    AuthProvider → Supabase Auth (JWT sessions)                 │   │
│   │    PostHog Analytics (consent-gated, proxied via /ingest)      │   │
│   │    Sentry Error Tracking (sourcemaps uploaded in CI)           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┬────────────────────┘
                   │                                  │
                   │ HTTPS REST/WebSocket             │ HTTPS SDK
                   ▼                                  ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────┐
│     VERCEL EDGE NETWORK      │    │         SUPABASE PLATFORM            │
│                              │    │                                      │
│  ┌────────────────────────┐  │    │  ┌──────────────────────────────┐   │
│  │ Edge Middleware        │  │    │  │ PostgreSQL Database           │   │
│  │ (V8 isolate, <1ms)    │  │    │  │  • 20+ tables                │   │
│  │ • Bot → OG tag inject │  │    │  │  • Row Level Security        │   │
│  │ • Mobile → 403 block  │  │    │  │  • 68 migrations             │   │
│  │ • Real users → pass   │  │    │  │  • Auto-created profiles     │   │
│  └────────────────────────┘  │    │  └──────────────────────────────┘   │
│                              │    │                                      │
│  ┌────────────────────────┐  │    │  ┌──────────────────────────────┐   │
│  │ CDN / Static Serving  │  │    │  │ PostgREST API                │   │
│  │ • /assets → 1yr cache │  │    │  │  • Auto-REST from schema     │   │
│  │ • SPA → index.html    │  │    │  │  • Anon key (RLS enforced)   │   │
│  │ • Rewrites: SPA, OG   │  │    │  └──────────────────────────────┘   │
│  └────────────────────────┘  │    │                                      │
│                              │    │  ┌──────────────────────────────┐   │
│  ┌────────────────────────┐  │    │  │ Auth Service                 │   │
│  │ Vercel Analytics      │  │    │  │  • Email/password login       │   │
│  │ Speed Insights         │  │    │  │  • JWT session management   │   │
│  └────────────────────────┘  │    │  │  • Stored in localStorage   │   │
└──────────────────────────────┘    │  └──────────────────────────────┘   │
                                    │                                      │
                                    │  ┌──────────────────────────────┐   │
                                    │  │ Edge Functions (Deno/TS)     │   │
                                    │  │  • 35+ serverless functions  │   │
                                    │  │  • DB triggers + webhooks    │   │
                                    │  │  • Cron jobs (weekly report) │   │
                                    │  │  • service_role for admin    │   │
                                    │  └──────────────────────────────┘   │
                                    └──────────────┬───────────────────────┘
                                                   │
                            ┌──────────────────────┼──────────────────────┐
                            │                      │                      │
                            ▼                      ▼                      ▼
                   ┌─────────────┐      ┌─────────────┐        ┌──────────────┐
                   │  ImageKit   │      │  Telegram   │        │   Resend     │
                   │  (Media CDN)│      │  (Alerts)   │        │  (Email)     │
                   └─────────────┘      └─────────────┘        └──────────────┘
```

---

## Layer Responsibilities

| Layer | Tech | Responsibility |
|---|---|---|
| **Edge Middleware** | Vercel Edge (V8) | Bot detection, OG injection, mobile admin block |
| **CDN** | Vercel CDN | Static asset caching, SPA routing rewrites |
| **Frontend** | React 18 + Vite | All UI, client-side routing, state management |
| **API Client** | Supabase JS SDK | PostgREST calls, auth session management |
| **Server State** | React Query | DB data fetching, caching, invalidation |
| **Auth** | Supabase Auth | JWT-based sessions, RLS enforcement |
| **Database** | PostgreSQL (Supabase) | Persistent data storage with RLS |
| **Serverless** | Supabase Edge (Deno) | Lead processing, email, notifications, AI |
| **Media CDN** | ImageKit | Optimized image serving with transformations |
| **Analytics** | PostHog (proxied) | Event tracking, funnel analysis |
| **Monitoring** | Sentry | Error tracking + source maps |
| **Uptime** | Checkly | Synthetic monitoring |

---

## Decision Records

| Decision | Rationale |
|---|---|
| SPA over SSR/SSG | Simpler deployment, auth-gated admin panel, acceptable SEO via OG middleware |
| Supabase over custom backend | Full backend in one platform — auth, DB, storage, edge functions |
| React Query over Redux | Server state pattern — far less boilerplate for CRUD data |
| ImageKit over Supabase Storage | Better CDN, transformations, and bandwidth |
| PostHog proxied via /ingest | Avoids adblocker blocks for analytics |
| Edge Middleware for OG | Zero JS runtime cost vs SSR for crawlers |
| Vite over CRA/Next | Faster builds, fine-grained chunk control, no SSR complexity needed |
