# Architecture Audit — CrossAngle Interior Platform

**Date:** 2026-05-16  
**Score: 7/10**  
**Verdict:** Solid production architecture with excellent code splitting, but inconsistent abstraction layers and monolithic page components hold it back from elite tier.

---

## Strengths

| Area | Details |
|------|---------|
| Code Splitting | All pages lazy-loaded, manual Vite chunks for heavy deps |
| RBAC | Well-typed 3-tier roles (super_admin, admin, viewer) with guard components |
| Repository Pattern | Interfaces enable testability; Lead, Project, Blog repos exist |
| Feature Modules | Discovery addon is a model bounded context (own core/, components/, pages/) |
| React Query | Sensible defaults: 5min stale, 30min gc, no refetch-on-focus |
| Observability | Sentry + PostHog + Vercel Analytics with consent gating |
| Design System | Tokenized typography, elevation, icons |

---

## Critical Issues

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | `supabase` client is `null as any` when env vars missing | Runtime crashes in any code path | Create NullSupabaseClient or fail-fast at startup |
| 2 | Monolithic admin pages (AdminAnalytics 101KB, AdminHero 62KB) | Unmaintainable, slow HMR | Decompose into sub-components |
| 3 | All deps use caret ranges (`^`) — none pinned | Non-reproducible builds | Pin exact versions |
| 4 | LeadService bypasses its own LeadRepo | Violates established pattern | Route all queries through repo |
| 5 | Single error boundary for entire app | One broken component crashes everything | Add per-route boundaries |

---

## Recommendations

- **Decompose God Components:** Split AdminAnalytics, AdminHero, CTAContact into <500-line sub-components
- **Enforce Repository Pattern:** All services should use repos, not direct Supabase calls
- **Pin Dependencies:** Run `npm pkg fix` or use `--save-exact` flag
- **Add Route-Level Error Boundaries:** Wrap admin and public route groups separately
- **Consolidate Icon Libraries:** Remove either lucide-react or @tabler/icons-react
- **Replace `next-themes`:** Use a Vite-native theme hook instead of a Next.js package
