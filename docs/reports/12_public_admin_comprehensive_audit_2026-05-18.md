# Cross Angle Public + Admin Comprehensive Audit

Date: 2026-05-18  
Scope: public website routes, admin routes, root documentation, existing audit docs, build output, static route generation, frontend/admin/backend integration code paths.  
Verification performed: root docs reviewed (`README.md`, `PRD.md`, `CROSSANGLE.md`, `CLAUDE.md`, `GEMINI.md`, `SECURITY.md`), prior reports reviewed from `docs/reports` and `audit-reports`, production build executed, generated `dist` route coverage checked, source routes/admin tabs/backend integrations inspected.

## Executive Summary

The platform has a strong React/Vite/Supabase foundation and the latest workspace build eventually completed, but it took 11m 54s and produced several release-readiness warnings. The largest current risk is not a single broken page; it is drift between route definitions, generated static paths, tests, and admin module navigation. That drift can cause hard-refresh 404s, stale QA coverage, and hidden/admin-only workflows that appear present in the UI but are not fully represented in route constants or test paths.

Critical themes:

- Static route generation is out of sync with live routes.
- Several public routes are live in React Router but absent from postbuild copied routes.
- `/admin/cms/transformations` is live and linked from CMS tabs but missing from admin route constants and generated static paths.
- Build output warns that large shared modules are not splitting as intended, especially Supabase, discovery, AdminHub, editor, charts, Sentry, and discovery bundles.
- UI/accessibility concerns remain around low-contrast text, keyboard-inaccessible custom choices, and missing asset references.
- Admin E2E coverage exists but is stale and does not cover all 30 generated admin pages or the newly added transformations page.

## Verified Build And Routing Findings

| ID | Severity | Area | Finding | Evidence | Recommendation | Timeline |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Critical | Public routing / deployment | Live React routes `/style-quiz`, `/blueprint`, and `/privacy` are not emitted as static route folders by `copy-indexes.js`. | `App.tsx` defines `/blueprint` and `/privacy`; `dist` contains `quiz` and `discovery`, but no `style-quiz`, `blueprint`, or `privacy` folders. | Update `PUBLIC_ROUTES` in `apps/web/scripts/copy-indexes.js` to match `App.tsx`; add a route coverage test comparing React routes to generated paths. | 24-48h |
| R-02 | High | Admin routing | `/admin/cms/transformations` is live in `App.tsx` and linked from `CmsModule`, but missing in `ADMIN_ROUTES` and `ADMIN_STATIC_PATHS`; no `dist/admin/cms/transformations/index.html` was generated. | `App.tsx` route exists; `CmsModule` tab exists; postbuild copied 30 admin routes excluding transformations. | Add `cmsTransformations` to `admin-routes.ts` and `admin-route-paths.js`; include it in admin E2E. | 24-48h |
| R-03 | High | QA coverage | Playwright tests reference stale routes like `/discovery`, `/estimator`, `/admin/settings`, `/admin/users`, `/projects/...`, while current routes are `/style-quiz`, `/estimate`, `/admin/system/settings`, `/admin/access`, `/portfolio/:slug`. | `e2e/navigation-routing.spec.ts` and `e2e/admin-interactions.spec.ts` route comments/locators. | Update route tests from a single route manifest; fail CI if route constants and tests drift. | 2-4 days |
| B-01 | Medium | Build operations | Production build completed but took 11m 54s and emitted warnings. This is too slow for frequent release verification. | `npm run build --workspace=web` completed in 11m 54s. | Profile build, reduce bundle graph duplication, split heavy editor/charts/discovery/Sentry paths, cache image optimization. | 1-2 weeks |
| B-02 | Medium | Assets | `/noise.svg` is referenced but missing from `public`; `/404-background.jpg` is also missing. | Build warning for `/noise.svg`; direct file checks returned missing for both. | Restore assets or remove references and use CSS backgrounds. | 24-48h |

## Public Website Audit

### Summary

The public site is visually premium and feature rich, with homepage, services, portfolio, gallery, blog, contact, estimate, style quiz, blueprint, project detail, blog detail, and privacy surfaces. The main UX opportunity is conversion clarity and route reliability: key tools exist but are not consistently represented in navigation, tests, generated static paths, or legacy aliases.

### Issues

| ID | Severity | Area | Issue | Recommendation | Timeline |
| --- | --- | --- | --- | --- | --- |
| P-01 | Critical | Deployment UX | Hard refreshes for `/style-quiz`, `/blueprint`, and `/privacy` may fail on static hosting paths despite the React routes existing. | Align static route copy list with live React routes. | 24-48h |
| P-02 | High | Conversion UX | Primary conversion tools are fragmented: `/estimate` and `/style-quiz` are not consistently named across tests, docs, static output, and navigation. | Standardize route names and labels: "Estimate" and "Style Quiz" across nav, footer, sitemap, tests, and static routes. | 3-5 days |
| P-03 | Medium | Accessibility | Several readable text blocks use `text-white/30` or `text-white/40`, which is weak for body or helper text on dark backgrounds. | Reserve low opacity for decorative/meta text only; use at least `text-white/60` for readable content. | 1 week |
| P-04 | Medium | Form accessibility | Contact form custom card inputs use `tabIndex={-1}` for real choices, making them keyboard-unfriendly. | Use native radio inputs visually hidden but keyboard reachable, or Radix radio group. | 1 week |
| P-05 | Medium | Visual polish | Missing `/noise.svg` affects contact/visual texture; missing 404 background weakens the error page. | Replace assets or remove references. | 24-48h |
| P-06 | Low | SEO/schema | Prior audits flagged duplicate LocalBusiness schema between app/root and page-level schema. | Keep one canonical LocalBusiness schema and page-specific schema only where needed. | 1-2 weeks |

## Admin Section Audit

### Summary

The admin system is broad and modular: hub, dashboard, access, CMS pages, CRM, discovery analytics, estimator, blog analytics, system settings/team/audit, and transformations. Role guards are present and most modules route through shared layouts. The immediate concern is route/list drift and incomplete test coverage for every admin page.

### Issues

| ID | Severity | Area | Issue | Recommendation | Timeline |
| --- | --- | --- | --- | --- | --- |
| A-01 | High | Admin controls | Transformations is a functional CMS tab but missing from admin route constants, breadcrumbs, command palette/static path generation. | Add route constant and static path; add command palette/quick action if appropriate. | 24-48h |
| A-02 | High | Admin QA | Existing admin tests cover only a subset of pages and assertions are often weak (`body` visible, `.catch(() => {})`). | Replace smoke-only checks with page-specific success, empty, error, permission, CRUD, and bulk-action assertions. | 1-2 weeks |
| A-03 | Medium | Access control UX | System module is super-admin only, but hub security chip can point to settings; non-super-admin visibility must stay role-filtered everywhere. | Audit module tiles, quick actions, command palette, and breadcrumbs against RBAC rules. | 3-5 days |
| A-04 | Medium | Architecture | `AdminHub` imports Supabase directly for stats, contrary to repo guidance favoring repositories/services. | Move hub stats into a repository/service with React Query caching and shared error handling. | 1 week |
| A-05 | Medium | Observability | Admin dashboard shows integration states as static "Active/Optimal" values in places. | Back these indicators with live health checks or clearly label them as configured status. | 1-2 weeks |
| A-06 | Low | Layout consistency | Admin uses a high-density carousel/grid; ensure all pages have empty/loading/error states and avoid hidden vertical overflow on smaller admin viewports. | Add admin visual regression checks at desktop and tablet widths. | 2 weeks |

## Architecture And Backend Audit

### Summary

The architecture is coherent: React Router, lazy routes, Supabase auth/database/functions, React Query, repository pattern in many places, and edge functions for operational workflows. The main architecture risk is direct integration access creeping back into UI and heavy shared imports undoing lazy loading.

### Issues

| ID | Severity | Area | Issue | Recommendation | Timeline |
| --- | --- | --- | --- | --- | --- |
| AR-01 | High | Bundle architecture | Vite warns that `supabase/client.ts`, `ResultsReveal.tsx`, and `AdminHub.tsx` are both statically and dynamically imported, preventing intended chunk isolation. | Normalize import strategy; avoid static imports from modules meant to be lazy. | 1 week |
| AR-02 | High | Bundle size | Heavy chunks remain: discovery 596KB, Sentry 447KB, charts 427KB, editor 403KB, React vendor 310KB, CSS 313KB. | Lazy-load Sentry only in production after consent/idle, split editor/charts per admin page, review discovery imports. | 1-2 weeks |
| AR-03 | Medium | Repository pattern | Some UI/admin files call Supabase or edge functions directly instead of using repositories/services. | Enforce `src/repositories` / service wrapper usage with ESLint boundaries or code review checklist. | 2 weeks |
| AR-04 | Medium | Edge functions | Critical functions exist for email, Telegram, ImageKit, weekly reporting, PostHog sync, stale lead checks, and lead processing. Current local audit did not execute external integrations because secrets/live credentials were not provided in this run. | Add safe synthetic probes for lead capture, estimate submit, weekly report dry-run, ImageKit sync dry-run, and Telegram notification health. | 1-2 weeks |
| AR-05 | Medium | Data integrity | Estimate totals must remain server/database computed; docs say this is required. | Add regression tests that client-supplied totals are ignored by `submit-estimate`/database generated columns. | 1 week |

## Third-Party Integration Audit

| Integration | Status From Audit | Risks | Recommendation |
| --- | --- | --- | --- |
| Supabase | Core dependency, build-time client included broadly. Prior health docs show live project healthy. | Broad static imports increase bundle size; direct UI calls complicate error handling. | Service wrappers and chunk isolation. |
| Resend | Edge functions reference Resend for lead/email/report workflows. | Needs synthetic business-flow monitors, not just provider uptime. | Add POST probes and alerting. |
| Telegram | Notification functions exist; lead notification is fire-and-forget. | Silent lead alert failures if function/provider fails. | Persist notification status and retry failures. |
| PostHog | Consent-aware wrapper exists; reporting sync functions exist. | High latency and data sync failures may be invisible. | Add sync job monitoring and admin-visible last-sync status. |
| Sentry | Config exists; build creates a 447KB Sentry chunk. | Source maps/env completion still needs confirmation; chunk is large. | Verify source-map upload and load Sentry after idle in production. |
| ImageKit | CDN utility and sync admin action exist. | Missing/invalid ImageKit sync credentials can break admin import. | Add dry-run and last-sync result in admin media. |
| Vercel Analytics/Speed Insights | Included globally. | Consent/privacy posture should be checked against local policy. | Document analytics behavior under strict consent. |

## Prioritization

### P0: Fix Immediately

1. Align public/static routes with live routes (`/style-quiz`, `/blueprint`, `/privacy`).
2. Add `/admin/cms/transformations` to admin route constants and static path generation.
3. Restore or remove missing `/noise.svg` and `/404-background.jpg`.
4. Update stale route tests that currently validate obsolete URLs.

### P1: Fix This Sprint

1. Strengthen admin E2E coverage for all admin pages, including role-denied paths.
2. Fix keyboard access for custom choices in the contact form.
3. Reduce low-contrast text usage in public/discovery/service pages.
4. Move direct Supabase admin stats into service/repository layer.
5. Add synthetic monitoring for lead, estimate, report, ImageKit, and Telegram workflows.

### P2: Next Sprint

1. Bundle/chunk refactor for discovery, Sentry, editor, charts, and Supabase.
2. Add visual regression checks for public and admin responsive layouts.
3. Add integration dry-run controls and last-run status in admin settings.
4. Standardize route labels and aliases across nav, sitemap, docs, tests, and redirects.

## Suggested Timeline

| Window | Work |
| --- | --- |
| 0-2 days | Route/static path fixes, missing assets, stale test route updates. |
| 3-7 days | Admin coverage for all modules, keyboard/form accessibility fixes, RBAC audit across hub/commands/quick actions. |
| 1-2 weeks | Backend synthetic probes, integration status dashboard, repository-layer cleanup. |
| 2-4 weeks | Bundle optimization, visual regression suite, complete page-by-page UX/accessibility pass. |

## Verification Gaps

This run did not perform authenticated browser interaction against live admin data because admin credentials were not provided in the active environment. It also did not trigger third-party production side effects such as sending Resend emails, Telegram messages, ImageKit imports, or weekly reports. Those should be verified with safe test accounts and dry-run flags before production signoff.
