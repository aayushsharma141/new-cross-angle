# DEPENDENCY-GRAPH.MD — Cross Angle Interior Dependency Map

> Analysis of: package.json, imports, vite.config.ts, provider tree

---

## Core Dependency Hierarchy

```
Entry Point: apps/web/src/main.tsx
  └── App.tsx
        └── CoreProviders.tsx
              ├── HelmetProvider (@react-helmet-async)
              ├── QueryClientProvider (@tanstack/react-query)
              ├── ThemeProvider (components/shared/theme-provider)
              ├── CookieConsentProvider
              ├── TooltipProvider (@radix-ui/react-tooltip)
              ├── AnalyticsProvider
              │     └── posthog-js (consent-gated)
              ├── AuthProvider
              │     └── supabase client (integrations/supabase/client)
              │           └── @supabase/supabase-js
              ├── SystemProvider (context/SystemContext)
              ├── AdminProvider (context/AdminContext)
              └── LanguageProvider (hooks/useLanguage)

App.tsx (routing)
  ├── publicRoutes.tsx (lazy-loaded page components)
  └── adminRoutes.tsx (lazy-loaded admin pages + guards)
```

---

## Runtime Dependency Graph (npm)

### Critical Path Dependencies (must be healthy)

| Package | Version | Why Critical |
|---|---|---|
| `react` + `react-dom` | 18.3.1 | Framework foundation |
| `react-router-dom` | 6.30.1 | All routing |
| `@supabase/supabase-js` | 2.48.1 | All data access + auth |
| `@tanstack/react-query` | 5.83.0 | All server state management |
| `vite` + `@vitejs/plugin-react-swc` | 5.4.19 | Build system |

### UI Layer Dependencies

| Package | Used For | Chunk |
|---|---|---|
| All `@radix-ui/*` packages | Accessible UI primitives (shadcn/ui base) | `radix` |
| `class-variance-authority` | Component variant styling | inline |
| `clsx` + `tailwind-merge` | Class merging utilities | inline |
| `lucide-react` | All icons across the app | `icons` |
| `sonner` | Toast notifications | `notifications` |
| `vaul` | Drawer/bottom sheet components | `drawer` |
| `cmdk` | Command palette UI | inline |
| `embla-carousel-react` | Image carousels | inline |

### Animation Dependencies

| Package | Used For | Chunk |
|---|---|---|
| `framer-motion` | Page transitions, AnimatePresence, micro-animations | `motion` |
| `gsap` + `@gsap/react` | Timeline animations, scroll-triggered effects | `motion-runtime` |
| `lenis` | Smooth scroll behavior | `motion-runtime` |
| `split-type` | Text splitting for letter/word animations | inline |
| `three` + `@types/three` | 3D visualization (BlueprintPage) | `three` |

### Form & Validation

| Package | Used For | Chunk |
|---|---|---|
| `react-hook-form` | All forms | `forms` |
| `@hookform/resolvers` | Zod schema integration | `forms` |
| `zod` | Schema validation | inline |

### Data & Utilities

| Package | Used For | Chunk |
|---|---|---|
| `date-fns` | Date formatting | `dates` |
| `dompurify` | HTML sanitization for blog content | `sanitize` |
| `recharts` | Admin analytics charts | `charts` |
| `react-day-picker` | Date picker in admin | inline |
| `react-resizable-panels` | Admin panel layouts | inline |
| `@dnd-kit/*` | Drag-and-drop in admin (e.g., media reorder) | `dnd` |

### Analytics & Monitoring

| Package | Used For | Chunk |
|---|---|---|
| `posthog-js` (implied by AnalyticsProvider) | Product analytics | inline |
| `@sentry/vite-plugin` | Sourcemap upload in CI | build-only |
| `@vercel/speed-insights` | Core Web Vitals | inline |
| `@vercel/analytics` | Traffic analytics | inline |

---

## File Dependency Map (Critical Files)

### `apps/web/src/integrations/supabase/client.ts`
**Depended on by:** Almost every data-fetching hook, repository, service, and page component

```
client.ts
  ← hooks/useSiteSettings.ts
  ← hooks/useAdminAuth.ts
  ← hooks/useGallery.ts
  ← hooks/useHubStats.ts
  ← repositories/SupabaseBlogRepo.ts
  ← repositories/SupabaseLeadRepo.ts
  ← repositories/SupabaseProjectRepo.ts
  ← services/LeadService.ts
  ← services/MediaService.ts
  ← services/AuditService.ts
  ← services/GalleryService.ts
  ← components/auth/AuthProvider.tsx
  ← (and ~30+ admin page components)
```

**Risk:** Breaking change to this file cascades to entire app.

---

### `apps/web/src/providers/CoreProviders.tsx`
**Depended on by:** `App.tsx` (single consumer)  
**Depends on:**
```
CoreProviders.tsx
  → @tanstack/react-query (QueryClient)
  → @/components/auth/AuthProvider
  → @/context/SystemContext
  → @/context/AdminContext
  → @/hooks/useLanguage
  → @/analytics/AnalyticsProvider
  → @/components/cookies/CookieConsentProvider
  → @/components/shared/theme-provider
  → @/hooks/useSiteSettings (nested inside InnerAnalyticsProvider)
```

**Risk:** Provider order matters. Changing nesting breaks contexts that depend on outer providers.

---

### `apps/web/src/hooks/useSiteSettings.ts`
**Depended on by:**
```
useSiteSettings.ts
  ← providers/CoreProviders.tsx (InnerAnalyticsProvider)
  ← App.tsx (SiteMetaUpdater, AnimatedRoutes)
  ← components/layout/Header.tsx (likely)
  ← components/layout/Footer.tsx (likely)
```
**Risk:** This hook runs at app root — any error here takes down the entire app (has graceful fallback though).

---

### `apps/web/src/routes/adminRoutes.tsx`
**Depends on:**
```
adminRoutes.tsx
  → components/admin/RoleGuard
  → components/auth/AuthGuard
  → pages/admin/AdminAuth (eager)
  → pages/admin/AdminLayout (eager)
  → (30+ lazy-loaded admin pages)
```
**Risk:** Modifying RoleGuard or AuthGuard here affects all admin security.

---

### `apps/web/middleware.ts` (Vercel Edge)
**Depends on:**
```
middleware.ts
  → src/og/og-defaults (static OG map)
```
**IMPORTANT:** This file must remain at `apps/web/` root (Vercel expects it there).  
It uses process.env (not Vite's import.meta.env) — different runtime.

---

## High-Impact Files (Do Not Modify Lightly)

| File | Impact | Risk if broken |
|---|---|---|
| `integrations/supabase/client.ts` | 🔴 Entire app | No data access anywhere |
| `providers/CoreProviders.tsx` | 🔴 Entire app | Provider tree collapses |
| `routes/adminRoutes.tsx` | 🔴 Admin security | Auth bypass or lockout |
| `middleware.ts` | 🟠 Vercel deployment | OG/bot/mobile broken |
| `hooks/useSiteSettings.ts` | 🟠 Entire app UI | Settings-dependent UI breaks |
| `integrations/supabase/types.ts` | 🟠 TypeScript | Regenerated by Supabase CLI — don't manually edit |
| `tailwind.config.ts` | 🟠 All styling | Design system token changes cascade everywhere |
| `index.css` | 🟠 All styling | Global CSS/animations |

---

## Dev Tooling Dependencies

| Tool | Config File | Purpose |
|---|---|---|
| Vite | `vite.config.ts` | Build, dev server, chunk splitting |
| TypeScript | `tsconfig.json`, `tsconfig.app.json` | Type checking |
| ESLint | `eslint.config.js` | Code linting |
| Husky | `.husky/` | Git hooks |
| lint-staged | `package.json` | Pre-commit linting |
| Playwright | `playwright.config.ts` | E2E tests |
| Checkly | `checkly.config.ts` | Synthetic monitoring |
| shadcn/ui | `components.json` | Component generator config |

---

## Monorepo Package Dependencies

```
root (cross-angle-monorepo)
  └── apps/web       → packages/types (@repo/types alias)
  └── packages/types → (standalone, no internal deps)
```

`@repo/types` is resolved via Vite alias:
```typescript
// vite.config.ts
'@repo/types': path.resolve(__dirname, '../../packages/types/src')
```

---

## External Service Dependencies (Runtime)

```
Cross Angle → Supabase (CRITICAL — all data + auth)
Cross Angle → ImageKit (HIGH — all media)
Cross Angle → PostHog via /ingest proxy (MEDIUM — analytics)
Cross Angle → Sentry (LOW — error tracking, degrades gracefully)
Cross Angle → Vercel Speed Insights (LOW — analytics only)
Cross Angle → Google Fonts (MEDIUM — typography CDN)
Supabase Functions → Telegram Bot API (MEDIUM — lead alerts)
Supabase Functions → Resend API (HIGH — email delivery)
Supabase Functions → ImageKit API (HIGH — media management)
```

**Single Point of Failure:** Supabase downtime = complete app failure  
**Mitigation:** React Query caches data, useSiteSettings has fallback defaults
