---
gsd_state_version: 1.0
milestone: Production Hardening
milestone_name: Phase 2 — Production Hardening & Release Verification (Complete)
current_phase: Phase 3 (Business & Content Expansion) Ready
status: Phase 2 Production Hardening 100% Certified. RELEASE_CHECKLIST signed off.
last_updated: "2026-09-11T00:00:00.000Z"
progress:
  phase_1_design: "100% (Certified & Frozen)"
  stage_2_1_a11y_mobile: "100% (Certified & Logged)"
  stage_2_2_perf_cwv: "100% (Certified & Logged)"
  stage_2_3_seo_schema: "100% (Certified & Logged)"
  stage_2_4_cross_browser: "100% (Certified & Logged)"
  stage_2_5_release_rc: "100% (Certified & Signed Off)"
  phase_3_business: "Ready to Initiate"
  phase_4_growth: "Queued"
---

# Current Status

- **Completed & Frozen:** Phase 1 (Design Language, System Tokens, Motion Physics, 5 Core Surfaces Certified).
- **Completed & Certified:** Phase 2 (Production Hardening):
  - Stage 2.1: Accessibility & Mobile QA ([design/accessibility/](file:///E:/main/design/accessibility/))
  - Stage 2.2: Performance & Core Web Vitals ([design/performance/](file:///E:/main/design/performance/))
  - Stage 2.3: SEO & Structured Data ([design/seo/](file:///E:/main/design/seo/))
  - Stage 2.4: Cross-Browser & Viewport Matrix QA ([design/cross-browser/](file:///E:/main/design/cross-browser/))
  - Stage 2.5: Release Candidate & [RELEASE_CHECKLIST.md](file:///E:/main/RELEASE_CHECKLIST.md) sign-off.
- **Active / Next Milestone:** Phase 3 (Business & Content Expansion — Lead capture funnels, localized city pages, dynamic quote calculator presets, editorial journal clusters).
- **Authority Gate:** [RELEASE_CHECKLIST.md](file:///E:/main/RELEASE_CHECKLIST.md) + [DEFINITION_OF_DONE.md](file:///E:/main/design/DEFINITION_OF_DONE.md).

## UX Audit Remediation — 2026-09-10

Full UI/UX audit of the public site published as an 18-entry defect register
(codes CA-01..CA-18). Two P0 entries closed:

- **CA-01 — Semantic token layer wired.** `tokens/index.css` imported the
  legacy 16-line `./semantic.css` instead of the documented
  `./semantic/semantic.css`, so all `var(--s-*)` references resolved to
  nothing. Invalid `border-color` fell back to `currentColor`, painting 17
  intended hairlines pure white on `/contact-us`, and the homepage reveal
  curtain rendered transparent. Fixed additively (the `--color-*`/`--canvas-*`
  legacy namespace is load-bearing and was kept).
  `environments/environments.css` is deliberately still NOT imported: its
  `:root` baseline is GALLERY LIGHT and would invert every consumer to a light
  palette on the dark body. Wire it only with a full light/dark pass.
- **CA-03 — Consent pod moved off the hero CTA** (desktop anchor bottom-left
  -> bottom-right) and its "Accept All" button contrast raised from 2.1:1 to
  9.3:1.

Verified live across `/`, `/about-us`, `/services`, `/gallery`, `/portfolio`,
`/portfolio/:slug`, `/aesthetic-discovery-engine`, `/contact-us`, `/estimate`:
zero unresolved `--s-*` tokens and zero contrast regressions. Admin surfaces
verified statically (`.admin-theme` is dark; canvas/text come from the same
token pair). Rollback point: tag `checkpoint/v18-pre-token-layer-wiring`.

**Still open from the audit:** CA-02 (archive greyscale on touch), CA-04 (no
persistent mobile contact affordance), and CA-05..CA-18. Known separate bug:
`PageTransition` applies a transform that creates a containing block, so
`position: fixed` descendants such as `ScrollToTop` are not viewport-fixed on
any public page.

## Mobile conversion affordance + Gallery surfacing — 2026-09-10

Two audit entries closed on `feature/dam-v3-milestone-planning`:

- **CA-04 — Persistent mobile contact affordance.** `WhatsAppButton` (a single
  floating bubble, suppressed on `/`) replaced by `MobileActionBar`, a bottom
  bar carrying both WhatsApp and call actions, gated on cookie consent and
  site settings. `AnimatedContent` gained `max-md` bottom padding so the bar
  never occludes content. Commit `d4797a41`.
- **CA-02 — Archive greyscale on touch.** `ProjectArchiveCard`'s grayscale +
  brightness treatment moved behind `[@media(hover:hover)]`, so touch devices
  are no longer left with a desaturated image and no hover to restore it.
  Commit `d4797a41`.

Also surfaced Gallery in `navLinks` and repointed the homepage closing
invitation at `/gallery` (its copy already described the gallery), and added
`HomeFAQ` before that invitation. Commit `d6263730`.

Rollback point: tag `checkpoint/v19-pre-30d-primitive-migration`.

**Still open from the audit:** CA-05..CA-18, plus the `PageTransition`
containing-block bug affecting `position: fixed` descendants.

## Phase 30D scope finding — 2026-09-10

Investigating how to resume archived Phases 30D-33 surfaced that the Phase 30
"Rooms" are **admin surfaces, not public pages**:

- `components/primitives/{foundation,interactive}` (the genome-tagged tree,
  `// Genome ID: P007`) is consumed by 17 admin pages and ~40 admin
  components. The entire public site accounts for 5 files.
- 30A Entrance = `AdminAuth`, 30B Gallery = `AdminGallery`, 30C Workspace =
  `pages/admin/workspace/*` (all 5 files migrated). Public `Index`,
  `GalleryPage` and `PriceEstimator` have zero primitive imports.
- "Material Library / Consultation" appears exactly **once** in the whole
  repository — line 64 of `.planning/archive/ENGINEERING_ROADMAP_V1.md`. No
  spec, requirement, or component defines it. `AdminMedia.tsx` (341 lines,
  un-migrated) is the likeliest referent.
- The archived roadmap is superseded by `.planning/milestones/v3.0-ROADMAP.md`
  ("v3.0 DAM V3 Workspace", phases 5-10), which is what this branch is for.

Separately, three primitive locations exist. `ui/primitives/*` (lowercase,
117 importers) is the vendored shadcn base and is legitimate.
`components/primitives/*` (63) and `components/ui/{foundation,interactive}`
(38, including all 15 files in `components/patterns/`) are genuine
duplicates of Container/Stack/Surface/Text/Button/Input. Decision taken:
`components/primitives/*` is canonical.

## v3.0 Phase 5 (Asset Workspace) — actual status, 2026-09-10

The roadmap lists Phase 5 as pending and describes replacing a
`MediaDetailsSheet`. That component does not exist; the Asset Workspace is
already built and wired (`AdminMedia.tsx` -> `AssetWorkspaceLayout` ->
`AssetSidebar` + `AssetInspector`). Phase 6's `UniversalAssetPicker` is also
built and already integrated in five contexts. The checkboxes were stale.

Real status against WS-01..WS-04:

- **WS-01** AssetWorkspace full-page — already done.
- **WS-02** Usage Panel — already done (`AssetUsagePanel` reads `asset_usages`,
  links to the owning entity, and blocks delete while references exist).
- **WS-03** Versions Panel + Replace — **done this session**, commit `2f423fb4`.
  Was a stub rendering a hardcoded "v1 (Current)" for every asset.
  `AssetService.getAssetVersions` / `replaceAsset` added; replace appends an
  `asset_versions` row against the same asset id, so everything bound through
  `asset_usages` follows without a broken reference.
  `rpc_finalize_dam_asset` could not be reused (hardcodes `version_number = 1`,
  also binds a usage row), so the insert is client-side; the
  "Auth Full Access for Asset Versions" policy permits it for admins/editors.
  Also fixed a latent ordering bug: the embedded `asset_versions` select had no
  order while `AssetPreview` read index 0 as "latest". Harmless at one version
  per asset, wrong as soon as Replace creates a second.
- **WS-04** Metadata & Actions — **blocked on schema.** Tagging exists
  (`asset_tags` / `asset_tag_links`) and dimensions live on `asset_versions`,
  but there is no photographer/credit column on `assets`. Per ADR-0003
  production is the schema source of truth and cannot be reproduced locally, so
  that column has to be added against the live project before WS-04 can land.

Success criteria 2 ("which version is live within 2 clicks") and 3 ("replace
without breaking references") are met by the new panel. Not yet exercised in a
browser — the surface is behind admin auth.

## Admin Panel Audit — security lockdown (Option A), 2026-09-11

Source: `Crossangle Admin Panel Audit.pdf` (26 findings). Executed P0-1 and
P2-18 first because they were the only findings with live exposure.

**Confirmed before fixing:** an anonymous `GET /rest/v1/site_settings?select=*`
returned all 43 columns. `resend/supabase/vercel_api_key` were NULL in prod,
`posthog_api_key` held the public `phc_` project token, and `security_config`,
`report_recipients`, `telegram_chat_ids`, `rbac_permissions`, `integrations`
were all readable. Every edge function already reads secrets from Supabase
secrets (`Deno.env`); the DB columns were a dead-end store fed only by the
admin Credentials tab (plus one fallback in `auto-reply-lead`).

**Landed (uncommitted, needs `supabase db push` + `functions deploy`):**
- `supabase/migrations/20260911000000_lock_down_site_settings.sql` — drops the
  three key columns, strips `*_api_key`/`telegram_bot_token` from
  `integrations` (object shape only), resets all policies, and gives `anon` a
  column-level SELECT grant on an explicit public allow-list. `authenticated`
  reads the full row; writes stay `is_admin_or_editor`.
- `hooks/useSiteSettings.ts` — `useSiteSettings()` selects the same allow-list
  explicitly (works before and after the migration); new
  `useAdminSiteSettings()` reads the full row for AdminSettings,
  AdminUserAccessSecurity, AdminEmailTemplates. Keys in `lib/queryKeys.ts`.
- `AdminSettings` Credentials tab — PostHog/GA remain editable (public
  identifiers); Resend/Telegram/PostHog-server/ImageKit are read-only cards
  pointing at `supabase secrets set`. The "keys remain encrypted" copy was
  false and is gone.
- `supabase/functions/inspect-schema` deleted (service-role, no auth).
- `notify-telegram` — service-role or admin JWT may pass a full record;
  anyone else may pass only a lead id, which is re-read server-side, must be
  <10 min old, and is rate-limited 5/min/IP. Browser now sends `{record:{id}}`.
- `auto-reply-lead` no longer falls back to a DB-stored Resend key.

- `auto-reply-lead` no longer falls back to a DB-stored Resend key.
- Dropped browser-side `notifyTelegram` fallback (`b454ce91`). Lead notifications are 100% server-governed via Database Webhook (`public.leads` INSERT -> `notify-telegram` Edge Function authenticated with `WEBHOOK_SECRET` -> Telegram Bot). Verified end-to-end. Old plaintext GUC trigger `on_lead_insert_telegram_notify` dropped in `20260911000001_drop_legacy_telegram_trigger.sql`.

## Admin Panel Audit — Option C Data Source Validation (Complete), 2026-09-11

Option C was executed not as a blanket "delete three legacy tables", but as **"validate three suspected legacy data dependencies and eliminate only the ones proven invalid."**

### Final Status by Target

| Target | Audit Result | Action Taken | Status |
|---|---|---|---|
| `estimate_rates` (C1) | **Canonical — no change.** The only table storing admin-configurable pricing coefficients (`PricingConfig`). | Retained without modification. | **Closed** |
| `admin_users` (C2) | **Phantom dependency — removed.** Never existed as a table or view in Postgres (`PGRST205`). | Repointed `AdminUserAccessRoles.tsx` to canonical `get_admin_users()` RPC with `editor` role support (`b20f9499`). | **Closed** |
| `article_analytics` (C3) | **Dead/superseded — removed.** 0 rows, 0 schema in live DB. Ingestion path was broken. | Repaired `record_blog_event` ingestion (`session_id`, `view_count`), dropped dead aggregation trigger/func (`1113a031`), and repointed `AdminBlogPerformance.tsx` to canonical `blog_user_events` (`764c38a5`). | **Closed** |

### Key Architectural & Security Decisions

1. **Blog Analytics Consolidated on `blog_user_events`:**
   ```text
   Client tracking (useBlogTracking)
       ↓
   record_blog_event() RPC [SECURITY DEFINER, explicit search_path]
       ↓
   blog_user_events (canonical event store)
       ├── AdminBlogOverview
       ├── AdminBlogEngagement
       └── AdminBlogPerformance
   ```
2. **Security Boundary for `record_blog_event`:**
   - `anon` may execute `record_blog_event()` to record reader telemetry (`article_view`, `scroll_depth`, `reading_time`, `cta_click`).
   - `anon` **cannot** arbitrarily modify blog content or analytics aggregates.
   - The RPC strictly validates inputs (safe UUID parsing) and only performs narrow event row insertion and atomic `view_count` increment on `public.blog_posts`.
   - `PUBLIC` execute grant revoked; explicit grants restricted to `anon`, `authenticated`, and `service_role`.
   - Explicit `SET search_path = public, auth` currently pinned. (Note: Supabase best practice for complete search path protection in `SECURITY DEFINER` routines is `SET search_path = ''` with all relation references fully schema-qualified; queued for comprehensive audit below).
3. **Dead Aggregation Mechanism Dropped:**
   - Dropped `trigger_aggregate_blog_analytics` and `aggregate_blog_analytics()` via `20260911000004_drop_dead_article_analytics_trigger.sql`. They targeted nonexistent `article_analytics` and caused Postgres to abort event transactions.
4. **Queued Follow-up: SECURITY DEFINER Hardening Task:**
   - Inventory all `SECURITY DEFINER` database functions across public schema.
   - Audit and restrict `EXECUTE` privileges against the Data API.
   - Migrate functions to `SET search_path = ''` with fully schema-qualified relation identifiers (`public.*`, `auth.*`).
   - Add automated/negative authorization regression tests.
5. **Security Housekeeping Remaining:**
   - Any Supabase management/service credentials that were exposed in agent command history or logs during prior sessions should be rotated in the Supabase Dashboard. *(Update: Admin password was leaked in a handoff artifact and rotated on 2026-09-12; .env.local updated.)*


## Admin Authentication Remediation — Security Patches 1 & 2 + SECURITY DEFINER track, 2026-09-12

Review document (living, private): https://claude.ai/code/artifact/c659c2c9-a1c8-40d0-8b78-952d160a99ea

### Status (labels per ADR 0004: Implemented / Verified / Closed)
| Item | State | Evidence |
| --- | --- | --- |
| S1–S3 SECURITY DEFINER track (drop dead trigger, guard + revoke privileged RPCs, `search_path = ''` on 15 fns) | **Closed** (live RBAC matrix) | `c572beaf`, `5c81d383`, `d295bcd0`; `scripts/checks/test-rbac-rpc-matrix.mjs` 17/17 |
| F-11 `get_lead_stats()` anonymous exposure | **Closed** (live: anon 401) | `5c81d383` |
| F-01 hardcoded `super_admin` role → server-backed, fail-closed | **Implemented** — tests mock `fetchUserRole`. Closed only by a browser E2E: post-fix `admin-full-flow.spec.ts` run for the happy path, plus a no-`user_roles` test user reaching `/admin/auth?error=role_unavailable` for fail-closed. The API-only smoke harness does not exercise `AuthProvider`. | `e9e16c4a`, `b922c690` |
| F-02 tokens in login/me JSON | **Verified** — real handler response asserted; Closed by smoke run 1 | `7bf35889`; invariant script §3 scans `api/auth/*` |
| F-03 recovery (server-side `/api/auth/recover`, implicit-flow token pair) | **Implemented** — GoTrue mocked; Closed by smoke run 3 | `ab81f784` + `b06a549a` (first cut forwarded only access_token; caught in review) |
| F-04 `profiles.role` → `sync-user-role` escalation | **Closed** — live DB evidence (authorization reads `user_roles` only) | live inspection; `site_settings` lockdown tracked `3747d0bd` |
| F-05 no refresh caller / 15-min cookie | **Closed** (2026-09-12) — Smoke run passed on Vercel preview. Edge proxy refreshed on 401 and successfully retried. | `8252f5fb` (Edge proxy 401→refresh→retry once; cookie maxAge = `expires_in`) |
| F-06 logout does not revoke | **Closed** (2026-09-12) — Smoke run passed on Vercel preview against real GoTrue. Pre-logout access token → 403 `session_not_found`, refresh token → rejected. | `8252f5fb` (direct GoTrue `logout?scope=global`) |
| F-07..F-10 (rate limit, CSRF/Origin, auth-layer role denial, audit log) | **Open** — Patch 3, after live validation | — |

### Formal conclusion
Production code remediation is complete and regression-tested (30 auth Vitest cases, arch/lint/typecheck/build, RBAC matrix). By ADR 0004 four fixes are still **Implemented**, not Verified — their tests mock the far side of the boundary they fix. Live authentication-lifecycle validation is pending: there is no staging Supabase project, and production must not be used for recovery/logout smoke tests without explicit credentials and a throwaway account.

### Deferred execution protocol
Four distinct verification events, four instruments — not one generic run. Harness for F-03/F-05/F-06: `e2e/auth-lifecycle-smoke.spec.ts` (committed `cf350e69`). Always `--project=chromium` (recovery link is single-use). F-01 uses the browser suite, see step 0.
0. Browser, F-01: `PLAYWRIGHT_ADMIN_PASSWORD` in `.env.local` → `npx playwright test e2e/admin-full-flow.spec.ts --project=chromium` (role resolves, admin lands on `/admin`); then log in as a user with no `user_roles` row and confirm redirect to `/admin/auth?error=role_unavailable`.
1. Local & Preview, F-06: DONE 2026-09-12 (Closed). Smoke harness passed on Vercel preview.
2. Vercel preview, F-05: DONE 2026-09-12 (Closed). Smoke harness passed on Vercel preview.
3. Throwaway account, F-03: `SMOKE_RECOVERY_EMAIL` → run once (sends email) → `SMOKE_RECOVERY_LINK` + `SMOKE_RECOVERY_NEW_PASSWORD` → run. Harness refuses the primary admin email.

### Known residuals (not blocking)
- `logout.ts` revokes only when an `access_token` cookie is present; a logout after JWT expiry clears cookies without revoking the refresh token (Low). Fix: refresh-then-revoke, after the smoke run.
- Migration files are not evidence of production function bodies (ADR 0003): S2 found `rpc_register_dam_asset` live without its guard and `update_media_metadata(text,jsonb)` live with no migration. Cite `pg_get_functiondef()` for any DB-function finding.
- Open GoTrue dashboard questions: signup enabled?, JWT/OTP expiry, sign-in rate limits, password policy; switching the recovery email template to the token-hash variable would keep tokens out of the URL fragment.

## Production reality check — 2026-09-14 (PL-010)

**Production (`www.crossangleinterior.com`) does not run the audited code.** Production branch `origin/new-crossangle-2.0` is at `9fed45c3` (2026-06-20), pre-cookie-auth. Live probes: `/api/auth/me` → HTML; `/api/supabase/*` → HTML; `/admin` unauthenticated → 200; no Edge middleware behaviours present. Bundle uses `storage: localStorage, persistSession: true` and browser-side `signInWithPassword`. Production asset `Last-Modified` 2026-09-14 05:39 UTC — a production deploy happened today from the June code (trigger unknown; find out).

| Item | State |
| --- | --- |
| Web-side remediation F-01/F-02/F-03/F-05/F-06 | **Unreleased** — feature branch only. ADR 0004 labels stand for the *code*; add **Released: no**. |
| DB track S1–S3, F-11, F-04, site_settings lockdown | **Live** (shared DB) |
| **Live regression:** June bundle's `site_settings?select=*` → 401 since 2026-09-11 | **Open — needs a decision today** (see options below) |
| Vercel pipeline | Root Directory = repo root ⇒ `vercel build` emits **no** `api/` functions and **no** `middleware.ts`. Cookie auth cannot ship until Root Directory = `apps/web` (or api/ + middleware.ts move to root). Verified by building `f5e281aa` from a clean checkout: `.vercel/output/functions` absent. |
| F-05/F-06 "Closed" on 2026-09-12 | Evidence came from a deploy not produced by the configured pipeline. Downgrade to **Verified** until a pipeline-produced deployment passes. |
| Smoke re-run against clean preview | **Not run** — blocked on the Root Directory fix; a root-built preview has no auth endpoints to test. |

### Options for the live `site_settings` 401
A. Cherry-pick the `useSiteSettings` allow-list change (`apps/web/src/hooks/useSiteSettings.ts`, uncommitted in the working tree — commit it first) onto `new-crossangle-2.0` and deploy. Keeps the lockdown; fixes the read. **Recommended.**
B. Re-grant anon SELECT broadly on `site_settings` — reverses the P0-1 exposure fix (security_config, report_recipients, telegram_chat_ids, rbac_permissions). Not recommended.
C. Merge the feature branch to production — carries ~40 unreleased commits and requires the Vercel Root Directory fix first. Correct long-term; not a hotfix.

### Path to actually releasing the auth remediation
1. Vercel → Settings → Root Directory = `apps/web` (confirm `apps/web/vercel.json` rewrites are the intended production config; root `vercel.json` becomes dead).
2. Deploy a preview **through the git integration** from the feature branch; confirm `/api/auth/me` returns 401 JSON and `/admin` redirects.
3. Run the four verification events (F-01 browser, F-03 recovery, F-05, F-06) against that preview → Closed.
4. Merge to `new-crossangle-2.0`; promote; re-probe production with the same four checks. Only then is the audit closed.

## F-13 hot-fix prepared — 2026-09-14

- Branch `hotfix/f13-site-settings-public-columns` @ `ceb00b73`, one commit ahead of `origin/new-crossangle-2.0` (`9fed45c3`). Worktree: `<scratchpad>/hotfix-f13`. **Not pushed, not deployed.**
- Change: `useSiteSettings` selects the 25 granted public columns for anon; `select("*")` retained for signed-in staff; cache invalidated on SIGNED_IN/SIGNED_OUT. DB lockdown untouched. No auth changes.
- Buildability fix bundled: `apps/web/.gitignore` `logs` → `/logs`; `src/components/admin/logs/AuditLogTable.tsx` (from `d7a4ed57`) added — it was imported by `AdminAuditLogs.tsx` but never committed to the production branch. **Untouched `9fed45c3` does not build from git.**
- **F-14 (new, Verified): production branch fails its own gates.** Root `npm run typecheck` = 187 errors on untouched `9fed45c3`, so the pre-commit hook can never pass and no commit can land with hooks enabled. Combined with the missing ignored file, this is how a developer's disk became the deployment source (PL-010). Hot-fix committed with `--no-verify` by owner authorisation; manual gates recorded in the commit message.
- Known inconsistency to fix separately: the *uncommitted* working-tree edit of `20260911000000_lock_down_site_settings.sql` drops `posthog_host` while still granting it — would fail if applied. The hot-fix allow-list excludes `posthog_*` for this reason.
- F-13 status per ADR 0004: **Implemented** (`ceb00b73`). → Verified/Closed only after deploy + live probe: `site_settings` → 200 for anon with expected public fields; settings-driven UI renders; protected columns (`security_config`, `report_recipients`, `telegram_chat_ids`, `rbac_permissions`, `integrations`) still refused to anon.
- Deploy note: Root Directory still = repo root. That is fine for *this* branch (static SPA, no `api/` dependency) but confirm the deployment is built from `ceb00b73`, not from a disk.

## Evidence reconciliation — 2026-09-14 (workflow run, 8 agents, adversarially verified)

**Deployments.** Both Ready previews — `main-mldg4xysm` (12 Sep 18:01) and `main-hb0kh7gni` (14 Sep 16:33) — are **cookie-auth builds**, byte-identical to `E:/main/.vercel/output` built 12 Sep 18:01 from the working tree at ~`6d077997` on `fix-auth-refresh-e2e`: **pre-`f5e281aa`**, i.e. they still contain the debug middleware, and that working tree carried uncommitted lines echoing the caller's bearer token in `X-Debug-*` response headers. Prebuilt CLI deploys; `vercel inspect` shows no git metadata. **Neither is the F-13 hot-fix** — both hot-fix deploys of `25658018` stalled at `UNKNOWN`; the F-13 preview does not exist. Vercel project **Root Directory is now `apps/web`** (changed since PL-010); with that setting the root `vercel.json` (`25658018`) is ignored and `apps/web/vercel.json` — currently an *uncommitted* working-tree edit — governs. Previews serve only HSTS; no Referrer-Policy/nosniff/X-Frame-Options.

| Finding | Label (ADR 0004) | Evidence |
| --- | --- | --- |
| **F-05** refresh | **Verified** — live pass, adversarially unrefuted (3 lenses), on `hb0kh7gni` | Positive: bogus access + valid refresh → 200 with `{role:"super_admin"}` row, new access cookie ≠ bogus, refresh token rotated; new-access-only → 200, no Set-Cookie. Negative: bad refresh → 401 twice, Max-Age=0 clears, JSON body, no retry loop. Not Closed: deployment is a non-pipeline prebuilt of pre-cleanup code. Script: scratchpad `f05-live.mjs` (redacted). |
| **F-01** role resolution | **Implemented** (server/proxy/RLS half live-observed; browser half and fail-closed half not) | Live today: `login.ts` returned `role=super_admin`; proxied `user_roles` returned the row under RLS. Not observed: `AuthProvider → fetchUserRole → AuthGuard` in a browser; a no-`user_roles` user reaching `?error=role_unavailable`. The 12 Sep "F-01 proof" was the globalSetup login side effect of the F-05/F-06 run; `admin-full-flow.spec.ts` was never run against a preview. The claimed sentence "relies purely on the edge middleware" is withdrawn: the chain is HttpOnly cookie + Edge injection + GoTrue + `user_roles` RLS + server-backed lookup + application fail-closed. |
| **F-13** site_settings | **Implemented** (`65166b12`) — **not Closed** | No hot-fix preview exists. DB-side: allow-list 200/25 keys, `*` 401, 5 protected columns 401 (probed 14 Sep). Deployment + UI probe still pending. |
| F-06 logout | Verified (unchanged) | 12 Sep local + preview runs |
| F-02 | Verified (unchanged); F-03 Implemented; F-04/F-11/S1–S3 Closed | — |

**Credential hygiene (done today).** Deleted untracked files containing the admin password and/or Vercel bypass secret: `scratch-pw*.mjs` (3), `scratch-f05.mjs`, `scratch-check-url.mjs`, `e2e/test-cookie.ts`; plus `reset-password.mjs` (service-role password rotation script, hardcoded admin email), `anon.txt`, `pub.txt` (public keys), `.env.vercel*`, `.env.preview*` (pulled env). Working-tree sweep now clean; no tracked file and no commit on any ref contains either value. `e2e/reports/index.html` (tracked) had the 12 Sep report with revoked token material in the working tree — preserved in the session scratchpad, tracked file restored to HEAD. Committed `.gitignore` still does not cover `.env.vercel*` — commit the working-tree `.env*` rule.

**Recommended:** delete previews `main-mldg4xysm` and `main-hb0kh7gni` (debug middleware, token-echo headers); redeploy the feature branch from `f5e281aa`+ through the pipeline before any Closed label; commit `apps/web/vercel.json` (currently uncommitted) so Root Directory = `apps/web` has committed config; then F-13 preview + probe.

## Admin panel QA — independent QA Lead review of the Antigravity run — 2026-09-15

Full report: [.planning/audits/2026-09-15-admin-qa-lead-review.md](audits/2026-09-15-admin-qa-lead-review.md).
Verdict **NOT READY FOR ACCEPTANCE** (unchanged in label, changed in substance: Antigravity's "single blocker" framing is withdrawn).

- **Antigravity mislabelled F-07/F-08** (rate limiting, CSRF/Origin) as RoleGuard/Hub rendering and marked them PASSING. Live probes: 12 bad logins → 401×12 no 429; cross-origin `POST /api/auth/logout` → 204. **Both remain OPEN.**
- **DEF-001 Verified live** (`services.icon_url` 42703; `upsert_service` still writes it). Antigravity's proposed fix (repoint to `deprecated_icon_url`) rejected — violates ADR 0002.
- **New P1s it marked PASSING:** `estimate_rates` table absent (PGRST205) → Estimator pricing save dead, public estimator on defaults (QA-02); `posthog-query` 500 on Dashboard/Quiz Analytics/Estimate Leads (QA-01).
- **Executed:** 32/32 real admin routes render for super_admin; `admin-audit-verification` 8/8, `admin-interactions` 23/23; `admin-full-flow` provides zero coverage (stale heading + 10 dead routes). Unknown `/admin/*` → blank page (QA-07).
- **Fixture hygiene regression (QA-05):** `create_test_admin.mjs` at repo root holds the service-role key + passwords in plaintext and created `testadmin@example.com` as a second production **super_admin**; `qa-test-post` draft left in `blog_posts`. Cleanup list in report §6.
- Not verified (blocked): editor/viewer browser + direct-RPC matrix (F-09, D-007), 10/12 CMS write cycles, F-03, F-10. Blocking conditions in report §7.
- D-008 Hub role-gating patch (`AdminHub.tsx`, uncommitted, Antigravity): tsc/eslint clean, editor screenshot consistent — Partially Verified.
- Discrepancy to resolve: STATE.md calls F-05 a "15-min cookie"; live `access_token` Max-Age is 60 min.

## Remediation of DEF-001 / QA-02 / QA-07 — 2026-09-15 (QA Lead)

- **QA-02 Closed** (`77abf233`): pricing moved to `estimator_flow_config` key `pricing`; save path executed live (201/200), public estimator reads it; no DDL.
- **QA-07 Closed** (`978c47fc`): admin catch-all `AdminNotFound`; unmatched `/admin/*` paths verified live inside the shell.
- **DEF-001 Implemented, NOT Verified** (`b4de33d5`): migration `20260915000000` + client change committed, but the migration has **not been applied to production** — `node scripts/checks/probe-upsert-service.mjs` fails on every run (old `icon_url`-writing function still live; anon still has EXECUTE, so **QA-10 is also still open**). Applying it needs a human with dashboard/CLI access; runbook in `.planning/tasks/2026-09-15-def001-apply-and-verify.md`. Commit `afcafc55` recorded DEF-001 as Verified and QA-10 as Closed without that evidence; this entry supersedes it.
- Process note: an agent closed a finding after "skipping the physically un-executable probe". Per ADR 0004 a finding is Verified only by an executed probe; code-complete is **Implemented**.

## DEF-001 and QA-10 Closed — 2026-09-21 (Antigravity)

- **DEF-001 VERIFIED — CLOSED** (`b4de33d5`, migration applied 2026-09-21): SQL Editor on `iuuivmwqodefdrrrewol` ran migration `20260915000000_def001_upsert_service_drop_icon_url.sql` — Dashboard output: "Success. No rows returned". Probe: `node scripts/checks/probe-upsert-service.mjs` → `PASS — DEF-001 migration is live (new signature resolves, anon revoked)` (both signatures HTTP 401 `42501`). CRUD: `node scripts/checks/verify-def001-services-crud.mjs` → `CREATE rpc: 200 "dc5968d5-5eb1-4969-994f-73fdecdfa905" tag=QA` / `EDIT rpc: 200 tag=QA-EDITED` / `DELETE → gone` / `QA leftovers: []` / `service thumbnails rendered from asset_usages: 2`. Public `/services` page verified via chrome-devtools-mcp (2 `asset_usages`-sourced thumbnails rendered, zero `deprecated_icon_url` reads).
- **QA-10 VERIFIED — CLOSED** (`b4de33d5`, applied 2026-09-21): `REVOKE EXECUTE ON FUNCTION public.upsert_service FROM PUBLIC, anon` is now live. Both probe calls (new and legacy signature) return HTTP 401 `42501 permission denied for function upsert_service`. Anon can no longer reach the in-function `is_cms_editor()` guard.


## DEF-001 / QA-10 — independently reconfirmed 2026-09-21 (QA Lead)

Migration `20260915000000` is live on `iuuivmwqodefdrrrewol` (applied via SQL Editor on 2026-09-21, after two
earlier false "applied" reports on 09-15 that this session's probe caught both times — see the superseded entry
above). Re-executed independently, not taken on report:

- `node scripts/checks/probe-upsert-service.mjs` → **PASS** (both signatures `401 42501 permission denied`; new
  function resolves, anon EXECUTE revoked).
- `node scripts/checks/verify-def001-services-crud.mjs` (fresh Playwright session, real Services CMS UI) →
  create `RPC 200`, edit `RPC 200` tag=QA-EDITED, delete confirmed gone, zero `[QA-2026-09-15]` leftovers,
  2 services rendering thumbnails from `asset_usages` (not the dead `icon_url` column).
- `admin-interactions.spec.ts` — 23/23 pass, no regressions.

**DEF-001: Verified, Closed. QA-10: Closed** (anon EXECUTE revoked, confirmed live).

## F-07 / F-08 — auth hardening, 2026-09-21 (QA Lead)

- **F-08 (CSRF/Origin) VERIFIED — CLOSED** (`74dae374`): verified-origin check on `login.ts`/`logout.ts`/
  `refresh.ts`/`recover.ts` — Origin/Referer compared against the request's own Host, no hardcoded domain
  allow-list (this app has a per-branch Vercel preview URL that changes every deploy). Code-only, no DB step,
  live the moment it deploys. Executed: `probe-auth-hardening.mjs` — cross-origin `POST /api/auth/logout` →
  `403` (was `204`). Real-browser regression via Playwright: `auth-lifecycle-smoke.spec.ts` F-06 passes
  (required updating the spec's API-request helper to send `Origin`, since Playwright's raw request context
  — unlike a real browser `fetch()` — doesn't add one on its own); `admin-full-flow.spec.ts` 21/22 (the one
  failure is pre-existing stale-copy drift, QA-09, unrelated to this change).
- **F-07 (rate limiting) IMPLEMENTED, NOT VERIFIED** (`d0cfc248`): DB-backed sliding-window counter
  (`check_and_record_auth_attempt`, migration `20260921000000_f07_auth_rate_limit.sql`) by email (5/15min)
  and IP (20/15min), fails open on any RPC error. **Migration not yet applied to production** —
  `probe-auth-hardening.mjs` still shows `401×8`, no `429`, confirming the fail-open path works (login stays
  available) rather than the throttle being live. Runbook: `.planning/tasks/2026-09-21-f07-f08-apply-and-verify.md`.
  Given DEF-001's history (two false "applied" reports before a third held), this will be re-probed independently
  before being marked Verified — not accepted on report.

## Navbar editorial overhaul — 2026-09-22

Reference: livingspaceinteriors.in header (measured: transparent `py-8` over hero → `charcoal/95 + blur(24px) + border-b white/5, py-4` on scroll; 3 links at 10px/700/uppercase/3px tracking at white/40; ghost CTA 1px white/20).

- Checkpoint tag before change: `checkpoint/v20-pre-navbar-editorial` (glass spotlight pill, 8 links, per-letter logo stagger).
- `Navbar.tsx` rewritten: three-column bare header, no pill. Links from new `headerLinks` (Services · Portfolio · Gallery · About · Contact) at 10–11px bold uppercase `tracking-[0.3em]`, gold hairline draws in on hover/active. Ghost CTA. Solid `bg-background/95 backdrop-blur-xl border-foreground/5` on scroll. Soft black top scrim (`before:` gradient) only while over the hero so bright hero frames stay legible. Mobile = full-screen overlay with all 8 `navLinks`, scroll lock, focus trap, clears `MobileActionBar`.
- Wordmark now uses `font-display` (Cormorant) — `font-serif` resolves to Georgia because `--font-display` is only wired to `font-display` in tailwind.config; `font-serif` is used ~381× elsewhere and is a separate cleanup.
- Removed `spotlight-navbar.tsx` and `.navbar-pill` CSS. `AnimatedLogo` untouched (still used by estimator/discovery/welcome).
- Verified: tsc, eslint, arch:no-console, architecture fitness tests pass; no E2E spec depends on the old nav structure.

## Homepage scroll choreography (v21) — 2026-09-22

Reference: livingspaceinteriors.in — teardown showed no animation library, just tall sections with a sticky
100dvh stage and rAF scroll-progress → inline transform/opacity, alternating pinned/free sections, word-scrub
reveals, day→night crossfades, accordion + progress-rail chapters. Built on v20 (user decision), not an overhaul.

- Checkpoint before change: `checkpoint/v21-pre-scroll-choreography`. Commits `c112aa47`, `29f329d7`, `187a0a1d`.
- **Root cause fixed first:** two Lenis instances ran concurrently on public routes (`SmoothScroll` via
  deprecated `@studio-freight/react-lenis`, plus `ScrollManager` constructing a second `new Lenis()` on idle,
  with a third bundled lenis copy). `SmoothScroll` now owns the only instance (`lenis/react`, `autoRaf:false`,
  driven by `gsap.ticker`, `ScrollTrigger.update` wired). `ScrollManager` removed; its `.gsap-reveal` hooks had
  no consumers.
- **Primitive:** `components/motion/PinnedChapter.tsx` — runway section + CSS-sticky stage, ScrollTrigger
  scrub 0→1 (`gsap.matchMedia` desktop/mobile runways, `deps` rebuild for async data); collapses to a static
  viewport with `data-motion="static"` under reduced motion. Gotcha recorded in code: scrubbed timelines
  render lazily, so start states are pinned with `gsap.set` (not `fromTo`); CSS-variable tweens lose their
  initial value under strict-mode remounts, so the wipe drives `--wipe` through a numeric proxy.
- **Chapters on `/`:** 01 Philosophy (250vh, title lifts, word-scrub, day→evening crossfade via
  `asset_usages` home/philosophy/backdrop-day|night), 02 Expertise (400vh accordion + photo crossfade +
  gold rail, `api.getServices`), 03 Journey (500vh five stages + horizontal rail, `api.getProcessStages`),
  04 Before/After (300vh clip-path wipe, `useTransformationStories` → `transformation_stories`, hidden when
  empty). Hero gains a rotating brand seal and a scrubbed exit.
- **Verified:** tsc, eslint, depcruise (no new violations; `Hero.tsx`/`MediaSlot.tsx` supabase imports are
  pre-existing), architecture fitness tests, `arch:supabase-auth`, production build (main 266 KB,
  motion-runtime 172 KB, within budget). Visual proof via Playwright at desktop/mobile and reduced-motion
  (the desktop Browser pane cannot screenshot sticky/pinned layouts — captures render black).
- **Open / content:** light "sand" section alternation is blocked by tokens (`environments.css` not wired —
  full light/dark pass needed); process stages in the DB share one `image_url`, so Chapter 03 photos don't
  change until the CMS rows get distinct images; no video assets exist for a reel section.

## Footer editorial overhaul — 2026-09-22

Reference: livingspaceinteriors.in footer (DOM-measured: `pt-24 pb-12` on charcoal; left brand statement `w-1/3` with 30px serif h2, `text-sm font-light white/50` sub, pill CTA `border-gold/30 rounded-full px-8 py-4` with gold fill sliding up on hover; right `grid-cols-2 md:grid-cols-3` columns with `10px/700/uppercase/0.2em white/40` headings and `text-sm font-light white/70 → gold` links; legal strip `border-t white/10 pt-8 10px/500 uppercase white/30`).

- Checkpoint tag before change: `checkpoint/v21-pre-footer-editorial`.
- `Footer.tsx` rewritten to that shape. Page-aware CTA copy (`getFooterCopy` + `useDynamicCTA`) is preserved as the statement block; btn1 = pill with gold fill-up hover, btn2 = quiet underlined text link. Columns: Explore (`navLinks` minus Home + Style Quiz), Studio (phone/email/address from settings), Social (only configured `social_links`). The 11 `/locations/*` local-SEO links kept as a single tracked "Serving …" line above the legal strip rather than a column.
- Removed: mobile accordion (`FooterSection`), live IST clock, noise overlay, top vignette, giant background wordmark, gold rule, inline `<style>` sweep CSS.
- Mobile: everything visible in a 2-col grid (no accordion), Social spans both columns, statement + CTAs stack; `pb-28` on mobile so the legal strip clears the `ScrollToTop` FAB (`bottom-24`) on top of App's 56px action-bar padding.
- Fixed dark surface by design (`bg-[#0A0A0A]`, `text-white`, gold via `primary` token) — same reasoning as the hero.
- Verified: tsc, eslint, arch:no-console pass; desktop 1440 and mobile 375 checked in browser.
- Pre-existing, not touched: `FixedSocialBar` (left rail) overlaps footer statement at ≤1440; `ScrollToTop` FAB overlaps bottom-right content on every page.

## Inner-page choreography (v22) — 2026-09-22

Reference teardown of livingspaceinteriors.in inner pages (`/story`, `/portfolio`, `/gallery`, `/contact`): no
pinning or scrubbing — 90vh photo hero + editorial sections with in-view reveals (fade-up, slide-x, scale).
Checkpoints `checkpoint/v22-pre-inner-pages` → `checkpoint/v22-inner-pages-choreography`; commit `51b8937d`.

- `components/motion/PageHero.tsx` (shared cinematic hero with scroll exit + seal) and
  `components/motion/Reveal.tsx` (GSAP in-view entrance). About / Services / Our Process open with `PageHero`;
  Services gets `ExpertiseChapter`, Our Process gets `ProcessChapter` (both now take a `kicker`). Gallery and
  Contact sections wrapped in `Reveal`. Portfolio untouched — its `HubHero` is already cinematic.
- **Data finding:** `asset_usages.entity_id` is a uuid, so slug-style page ids can't resolve there (22P02).
  Named page imagery goes through `site_media_assets.asset_key` via new `hooks/useSiteMediaSlot.ts`
  (`page_<entity>_hero`, `home_philosophy_backdrop-day|night`). `useDamAsset` remains for real entity rows.
- Orphaned but kept: `components/about/AboutHero.tsx` (glass-cursor canvas) and
  `components/services/ServicesHero.tsx` (draggable blueprint/reality slider) — bespoke work preserved for
  the design-history docs; delete in a later cleanup if the new heroes stick.
- Verified: tsc, eslint, depcruise (3 pre-existing violations only: MediaSlot, AboutTimeline, AboutTeam),
  architecture fitness, `arch:no-console`, production build within budget (ServicesPage 74 KB, AboutPage 47 KB,
  OurProcessPage 30 KB, motion-runtime 136 KB). Playwright captures at 1440×900 and 390×844.

## About page editorial overhaul — 2026-09-22 (page 1 of the inner-page pass)

Reference: livingspaceinteriors.in/story (90vh centred hero with 110px display H1; `py-32 max-w-7xl` sections = eyebrow → 60px H2 → `white/50 font-light` body → one image; `py-24 border-y white/5` 4-number strip; `py-40` centred closing statement + one CTA).

- Checkpoint tag before change: `checkpoint/v22-pre-about-editorial`.
- New shared system `apps/web/src/components/editorial/index.tsx`: `EditorialHero`, `Section`, `Container`, `Split` (text + one media), `NumberedList`, `StatStrip`, `Closing`, `Eyebrow`, `DisplayHeading`, `Em`, `Body`, `pillCtaClass`/`PillCtaInner`, `textLinkClass`, `reveal()`. All subsequent inner pages should compose from this rather than adding page-local section styling.
- `AboutPage.tsx` rewritten: hero (image from `page_about-us_hero` media slot, same key PageHero used) → studio statement with the founder film as its single visual → `AboutValues` (numbered list) → `AboutStats` (strip, count-up kept, `settings.studio_stats`) → `AboutTimeline` (sticky heading + milestone rows, `studio_milestones` query and per-year `MediaSlot` keys untouched) → how we work (numbered list) → `AboutTeam` (portrait grid, `team_members` fetch untouched) → `AboutCTA` (closing, phone from settings).
- Removed: `AboutVideoModal.tsx` (dead after hero change), `AboutHero.tsx` (was already unused), all card chrome / glows / grid textures / watermark, the "signature pillars" (Smart Layouts / Premium Materials / Made Just For You), "what defines us" and "studio standards" cards, and the hero's inline 3 stats + bullet list (numbers now live only in the strip). SEO: Helmet + all three SchemaMarkup blocks unchanged; the visible `h1` replaces the previous `sr-only` one.
- Content notes: 4 team portraits still point at the old WordPress host (`crossangleinterior.com/wp-content/...`), 2 members have no `image_url` — migrate via CMS/ImageKit. `AboutTeam`/`AboutTimeline` still import `integrations/supabase/client` directly (pre-existing dep-cruiser violation, not new).
- Verification: tsc, eslint clean; full-page Playwright screenshots at 1440 and 390 (`scripts/tmp-shots/shot.mjs`, temporary — delete when the inner-page pass is done). Browser pane could not draw during this session.

## Contact page editorial overhaul — 2026-09-22 (page 2 of the inner-page pass)

Reference: livingspaceinteriors.in/contact (two columns: tracked detail labels DIRECT CONNECT / CALL THE STUDIO / THE STUDIO on the left, 5-field underline form on the right).

- Checkpoint tag before change: `checkpoint/v22-pre-contact-editorial`.
- `ContactPage.tsx` rewritten: compact header (no photo hero — the form must be reachable without scrolling) → details | form (`minmax(0,4fr)_minmax(0,8fr)`, form first below `lg`) → map strip (same Google `cid` embed, grayscale) → FAQ. Details/hours/WhatsApp from `useSiteSettings`; estimator + style-quiz links kept with their analytics events.
- New `components/contact/ContactForm.tsx` replaces the 630-line `shared/CTAContact.tsx`: single page, underline floating-label fields, 8 fields unchanged (firstName, lastName, email, phone, projectType, projectBudget, location, message). **Unchanged behaviour:** `useLeadValidation` rules, `leadService.submitLead` payload (`lead_source: website_contact`, `source: Contact-Form`, `form_data`), toast copy, `?interest=` prefill, `contact_form_started` / `contact_form_submitted` / `cta_clicked` / `estimate_path_selected` / `discovery_path_selected` events, focus-first-invalid, `#contact-form-section` anchor.
- `ContactFAQ.tsx` rewritten as hairline accordion (`data/contactFAQ.json` unchanged, aria wiring kept). Removed `InteractiveMap.tsx`, `SocialBar.tsx`, `ShaderBackground` usage on this page. `ShaderBackground.tsx` itself is now unused but left in place.
- Grid fix applied across the pass: `grid-cols-12` + large gaps overflowed the viewport (page rendered 1456px wide at 1440). `Split`, timeline, FAQ and contact grids now use two explicit `minmax(0,Nfr)` tracks.
- Verified: tsc, eslint; Playwright: empty submit → 8 validation errors, focus on first invalid field, live email error, no lead POST (only the `contact_form_started` analytics event); full-page captures at 1440 (3624px) and 390.

## Portfolio page editorial overhaul — 2026-09-22 (page 3 of the inner-page pass)

Reference: livingspaceinteriors.in/portfolio (no hero copy at all — straight into a 3-col `gap-12` grid of image + 24px H3 + tracked category · client + "VIEW PROJECT").

- Checkpoint tag before change: `checkpoint/v22-pre-portfolio-editorial`.
- `PortfolioPage.tsx` reduced from a 9-section narrative hub to: compact header → `ProjectArchive` → `ClientPerspective`. Page went 6046px → 3217px at 1440.
- `ProjectArchive.tsx`: bento grid (6 alternating span patterns, 240–650px tiles) → even `sm:2 / lg:3` grid, `gap-x-8 gap-y-16`. Filters are now a hairline row with an animated `layoutId` underline; on mobile they were wrapping and the underline cut through the second line, so the row is a single horizontally scrollable line (count hidden below `sm`). `?category=` linkability and the `api.getProjects` query are unchanged.
- `ProjectArchiveCard.tsx`: direction-aware hover overlay + card chrome → image, display title, tracked `category · location`, "View project" underline link. 154 → 63 lines.
- `ClientPerspective.tsx`: word-stagger quote in a 60vh block → display-scale pull quote with figcaption.
- Removed (orphaned by this change): `HubHero`, `Philosophy`, `FeaturedProjectStory`, `TrustLayer`, `DesignPerspective`, `DesignSignatures`, `PortfolioFinalCTA`. The page's own closing CTA was dropped too — `getFooterCopy("/portfolio")` already renders "Seen the work? Now shape yours." so the two were duplicating verbatim.
- **Pre-existing dead code found, not touched:** `portfolio/{CursorGlow,GrainOverlay,MeshGradientBg,HubLightExperience,SpaceNavigator,StyleSelector,ProjectGrid,FeaturedJourneys,BehindTheWork,HowWeWork,InspirationGallery,TrustSection,HubFinalCTA}.tsx` were already unreferenced before this pass; `MagneticLink.tsx` is now orphaned (its only consumer was HubHero).
- **Layout fix applied pass-wide:** the global `FixedSocialBar` (48px, `left-0`, vertically centred) sat exactly on the content edge — editorial `Container` padding went `xl:px-12` → `lg:px-16 xl:px-20`, so content starts at 80px and clears it at 1280/1440.
- Verified: tsc, eslint; Playwright — 5 projects render, "Commercial" filter → 1 project + `?category=Commercial` in the URL, project links resolve (`/portfolio/executive-workspace`), images load; captures at 1440 and 390.

## Gallery page editorial overhaul — 2026-09-22 (page 4 of the inner-page pass)

Reference: livingspaceinteriors.in/gallery (filter row → grouped by category, each group = 36px H2 + "N WORKS" count + masonry with small tracked captions).

- Checkpoint tag before change: `checkpoint/v22-pre-gallery-editorial`.
- `GalleryPage.tsx` rewritten: compact header → sticky hairline filter row (counts kept) → **grouped masonry**. With "All" active the archive groups by category (heading + count per group); a specific category renders one masonry. Previously the page showed a 95vh parallax hero plus a *one-image-at-a-time stacked slider* — 29 images behind arrow clicks; all 29 are now visible.
- New `components/gallery/GalleryMasonry.tsx`: CSS-column masonry, images at natural aspect ratio, `TITLE · LOCATION` caption, click → lightbox. Column count adapts to group size (1 / 2 / 3, with 4 items balancing to 2×2) because `column-fill: balance` otherwise left an empty third column on small groups.
- **Unchanged behaviour:** `useGallery` / `useGalleryCategories` queries, `?category=` linkability, `?board=` shared-board import + toast + param cleanup, `gallery_saved` localStorage and the "Saved" filter, `GalleryLightbox` and its prev/next/index wiring, all three `useAttentionTelemetry` slots (`hero-image` now on the page header, `category-nav`, `project-grid`).
- Removed `GalleryStackedSlider.tsx`. Page-level CTA dropped — `getFooterCopy("/gallery")` already closes the page.
- Verified: tsc, eslint; Playwright — 6 category groups, 29 tiles, per-group counts match the filter counts, filter → 4 tiles + `?category=Modular+Kitchen`, and the lightbox opens on the *clicked* image for tiles 0, 5 and 28 (last group), confirming the grouped→flat index mapping.

## Services page editorial overhaul — 2026-09-22 (page 5 of the inner-page pass)

No reference equivalent (their services live as a home-page chapter), so the editorial section system was applied directly.

- Checkpoint tag before change: `checkpoint/v22-pre-services-editorial`.
- `ServicesPage.tsx`: 16 sections → hero → three domains → what's included → investment tiers → FAQ. 12,000px → 7,687px at 1440.
- The three domains previously had **three different card treatments** (4:5 photo cards / `gap-px` icon grid / icon cards). New `components/services/ServiceDomain.tsx` gives all three one treatment: statement + even `sm:2 / lg:3` grid of 4:3 image, title, description, "View service". Anchor ids `#residential` / `#commercial` / `#specialized` preserved for `?category=` deep links.
- `ServicesDeliverables` (11 icon tiles → numbered two-column list), `ServicesInvestmentTiers` (3 bordered/ringed cards → plain columns, gold rule on "Signature"), `ServicesFAQ` (bespoke accordion → shared `FaqAccordion`) rewritten. Copy and data unchanged in all three.
- New shared `FaqAccordion` in `components/editorial`; `ContactFAQ` now uses it too, so the two accordions can't drift.
- Removed: `ServicesMarquee`, `ServiceArchetypes`, `ServicesTransformations`, `ServicesEngines` (588 lines), `ServicesWhyUs`, `ServicesProcess`, `ServicesCTA`, `ProcessTeaser`, `ServicesFinalCTA`. `ExpertiseChapter` is no longer imported here but kept — the home page uses it. `OurApproach` untouched (used by `/our-process`).
- Page-level closing CTA dropped: it rendered "Choose your service, then build the plan." directly above the footer's `getFooterCopy("/services")`, which is the same sentence. (Same duplication previously fixed on Portfolio and Gallery.)
- **Content gap, not code:** "Wardrobe" and "Garden & Sitting Area" have no `hero_image`, so their frames render empty. Needs a CMS upload.
- Verified: tsc, eslint; Playwright — 3+3+6 services render, `/services/residential/living-room` resolves, images load, FAQ panel opens, `?category=commercial` scrolls, zero console errors.

## Process page editorial overhaul — 2026-09-22 (page 6 of the inner-page pass)

- Checkpoint tag before change: `checkpoint/v22-pre-process-editorial`.
- The page rendered the **same five `design_process_steps` records three different ways**: the pinned `ProcessChapter`, the tabbed `StageDetailPanel`, and `TimelineGantt`. Now once: new `components/process/ProcessStages.tsx` gives each stage a full section — `Stage NN` eyebrow, title with subtitle on its own gold line, summary + detail, timeline/budget, photograph, and the three `We do` / `You do` / `You receive` lists (all CMS fields, none dropped). Media alternates sides.
- `TrustStrip` → shared `StatStrip` (still `api.getProcessMetrics`). `ProcessFAQ` → shared `FaqAccordion`, **FAQPage JSON-LD schema preserved**.
- Removed: `StageDetailPanel`, `TimelineGantt`, `ProcessCaseStudy`, `ProcessCTA`, `services/OurApproach`. `home/ProcessChapter` kept (home page uses it).
- Hero CTA now links `/contact-us` directly instead of `/contact` (which was hitting the redirect route). Page-level CTA dropped — footer carries it.
- Verified: tsc, eslint; Playwright — 5 stages with correct CMS titles, 4 metrics, 6 FAQs, `FAQPage` schema present, `#process` anchor jump works, zero console errors. 7,860px desktop.

## Blog index editorial overhaul — 2026-09-22 (page 7 of the inner-page pass)

- Checkpoint tag before change: `checkpoint/v22-pre-blog-editorial`.
- `BlogPage.tsx`: header → lead story → one hairline filter band → 3-col article grid → newsletter. 6,000px → 4,271px at 1440.
- `BlogHero` (pill-badge featured card) → full-width lead story: 21:9 image, display title, excerpt + meta + "Read article". `BlogFilterBar` (crimson pill tabs, separate search/sort rows) → one sticky band: tracked category tabs with animated `layoutId` underline, underline search field, latest/trending toggle. `BlogGrid` (2-col rounded cards with icon meta) → even `sm:2 / lg:3` grid, 4:3 image, `CATEGORY · N MIN READ · N VIEWS`, display title, excerpt. `BlogNewsletter` (199 lines, SVG-pattern background, badge) → statement + underline email field + gold-fill pill; **`useNewsletter` hook, lead insert, honeypot and 30s throttle untouched**.
- Removed: `BlogSidebar` (its category list duplicated the filter bar), `BlogTrendingSlider` (duplicated the grid; the latest/trending sort covers it). `useBlogList` untouched — filtering, sorting, pagination and `featuredPost` logic are unchanged.
- **New `cleanExcerpt` in `blog/_utils/blogUtils.ts`:** several imported posts have scraped WordPress chrome in `excerpt` ("Interior Design  August 22, 2024  Interior Design  …") instead of prose, and it was rendering verbatim on every card. The helper strips the repeated category label and leading date and returns "" when nothing meaningful remains, so those cards render without an excerpt. **The real fix is cleaning the field in the CMS.**
- **Pre-existing content mismatch, not touched:** every post's `category` is "Interior Design", but `CATEGORIES` in blogUtils lists 6 specific tabs (Modular Kitchens, Luxury Residential, …). All of them therefore filter to zero results. Either retag the posts or derive the tab list from the data.
- Note: a stale Vite HMR transform produced a phantom "does not provide an export named 'BlogNewsletter'" error mid-session; restarting the dev server cleared it. Not a code fault.
- Verified: tsc, eslint; Playwright — lead story renders, 5 cards, search/category/sort all respond, article links resolve (`/blog/<slug>`), newsletter field present and no lead POST fired during the test, zero console errors.

## Estimator + Discovery: shared workspace shell — 2026-09-22 (page 8 of the inner-page pass)

User intent captured: **the estimator and the style quiz are one connected experience split into two doors on purpose** — someone who only wants a number must not be forced through the quiz — and they are a **core attraction of the business**, not a side utility. Design follows that: both doors at full weight, recommended one marked rather than the other hidden, and each door shows its own product.

- Decisions taken with the user: keep the light "workspace" room (focused, form-heavy, reads better on paper) rather than moving the tools to the dark site canvas; scope = landings + shared shell only, quiz/calculator step UI untouched.
- **The site runs under `.dark`, so `data-environment="workspace"` resolves to dark surfaces** — that is why both tools hardcoded `#faf8f5`. New `addons/_shared/WorkspaceShell.tsx` declares that light palette once as scoped CSS vars (`--ws-canvas/paper/ink/muted/faint/line/bronze/gold/deep`) plus shared type and control classes, so both doors are literally the same styles instead of two sets of hex values.
- New `addons/_shared/EntryChoice.tsx`: the two doors as a flagship pair — index, eyebrow, display title, description, **"You receive" list**, duration and action per door; `featured` marks the recommendation.
- `PriceEstimator.tsx` rewritten on the shell: statement → blueprint-status line (`ECOSYSTEM_COPY.estimatorWith/WithoutBlueprint`) → doors (01 Estimate / 02 Discovery) → **new `SampleEstimatePreview`** (worked example: headline range, room-by-room breakdown, finish-level comparison, clearly labelled illustrative) → consultation link. Removed MagicRings, SoftAurora, FallingText, Magnet, the urgency badge and the bespoke logo header.
- `DiscoveryLanding.tsx` main component rewritten on the same shell: statement → proof (`CountUp` 1,420+) → doors (01 Full discovery / 02 Quick quiz) → existing `UnifiedDashboard` as the "what the blueprint contains" showcase → cross-link to the estimator. `UnifiedDashboard` and `IntentOverlay` kept as-is; `onStart("deep"|"quick")`, the intent overlay flow and the EN/Hinglish toggle (now in the shell's header slot) all preserved.
- Cross-links are now honest in both directions and both use `ECOSYSTEM_ROUTES`/`ECOSYSTEM_COPY`.
- Verified: tsc, eslint; Playwright — both landings render on `rgb(250,248,245)`, both door pairs present, estimator flow starts, quick quiz starts, cross-links and language toggle present, zero page errors.
- Follow-up worth doing (not done): surface these two as core attractions *on the site* — home page, nav and footer currently treat them as ordinary links.

## Tools surfaced as a core attraction — 2026-09-22

User intent: the estimator and style quiz are **a core attraction of the business**, so the site itself must say so rather than treating them as ordinary links.

- New `components/home/ToolsChapter.tsx` — the dark-canvas twin of the tools' own `EntryChoice`: "Two ways in. One system." + both tools at full weight (index, eyebrow, display title, description, **You receive** list, duration, CTA), discovery marked "Start here". Same story and same copy shape as the landings, so site and tools agree.
- `Index.tsx`: the single "Take the Style Quiz" CTA panel (one link in a glass panel) was replaced by `<ToolsChapter />`. **Only that block changed** — another session has uncommitted work in `Index.tsx`/`Hero.tsx`/`HomeFAQ.tsx`, so the edit was kept contained. The `primary-cta` attention-telemetry ref was preserved by moving it onto the wrapper.
- `Navbar.tsx`: desktop now shows "Style Quiz" as a tracked hairline link beside the bordered "Get Estimate" CTA (quiz link appears at `xl` and up to protect the 5-link row at 1280). Mobile overlay footer now offers both — "Get Estimate" bordered, "Take the Style Quiz" beneath it.
- Verified: tsc, eslint; Playwright at 1600×1000 — both nav links present, "Two ways in" section renders with both tool titles and both CTAs, zero page errors.

## Slug / detail pages — audit + typography fix + ProjectPage — 2026-09-22

- Checkpoint tag before this pass: `checkpoint/v23-pre-slug-pages`.

### Site-wide typography fix (one line, ~307 call sites)
Audit of all nine slug/secondary pages showed **six rendered their `h1` in `ui-serif` (Georgia), not Cormorant** — they use Tailwind's `font-serif`, which was never mapped to `--font-display`. Only the Locations pages (which use `font-display`) were correct. Added `serif: ["var(--font-display)", …]` to `tailwind.config.ts` alongside `display`. Re-audit confirms all eight content pages now render Cormorant Garamond. This is the Georgia bug first noticed during the navbar work.

### Audit baseline (1440px, before changes)
project 13,736px · blogdetail 4,386 · servicecat 2,755 · servicedetail 4,602 · locations 7,026 · location 2,913 · privacy 4,077 · terms 4,839 · notfound 900. No horizontal overflow anywhere. `notfound` renders without Navbar/Footer and in Outfit 128px — inconsistent with every other page.

### ProjectPage (`/portfolio/:slug`)
- **13,736px → 5,492px with no content lost** — every CMS field still renders (brief, approach, materials, gallery by room, testimonial, facts). The reduction is from section design, not from dropping content.
- Rebuilt on the editorial system: full-bleed cover → 7-fact strip → brief & approach → numbered materials → gallery grouped by room → client pull-quote → prev/next. Each block renders **only when the CMS has that content** (`hasValue` also treats the `"-"` placeholder as empty), which the old page did not do.
- Removed the entire `components/project/` directory — 22 components, 3,363 lines. **16 were already dead before this pass**; the 6 in use were replaced by the page itself.
- **Correction to an earlier note in this session:** I wrote that 3 of 5 projects "have no content". That was true of `getProjects()` (the list query returns thin DB rows — `area`/`budget`/`duration` as `"-"`, empty brief/materials/gallery). It is **not** true of the detail page: `getProjectBySlug` falls through to `staticProjects` when its `.or(...).maybeSingle()` query returns nothing, and that static data is complete. So the grid and the detail page currently disagree about the same project — the DB rows are thin, the static fallback is rich. Worth reconciling in the CMS.
- Verified: tsc, eslint; Playwright — full data project, thin-DB project and a nonexistent slug all render correctly (the last gives a proper "Project not found" with a route back), 1440px wide with no overflow, zero page errors.

### Remaining slug / secondary pages — 2026-09-22

All rebuilt on the editorial system; heights at 1440 (before → after):

| Page | Before | After | Note |
| --- | --- | --- | --- |
| `/portfolio/:slug` | 13,736 | 5,492 | no content lost |
| `/blog/:slug` | 4,386 | 4,604 | prose column widened, card chrome removed |
| `/services/:category` | 2,755 | 2,064 | now uses the same `ServiceDomain` as /services |
| `/services/:category/:service` | 4,602 | 6,375 | grew: all CMS blocks now render (prose, features, process, gallery, FAQ, related) instead of being compressed into cards |
| `/privacy` | 4,077 | 3,826 | 7 cards → hairline sections |
| `/terms` | 4,839 | 4,299 | 11 cards → numbered hairline sections |
| 404 | 900 | 1,610 | **now has Navbar + Footer** and routes out |

- `BlogDetailPage`: glass cards + pill badge → masthead, full-width cover, 68ch prose column with the contents rail and share links beside it, prev/next, related grid. `useBlogPost` untouched (data, TOC, tracking). `DOMPurify.sanitize` retained on the CMS HTML. Share list corrected to the three platforms `handleShare` actually implements (LinkedIn / WhatsApp / copy) — it previously offered Twitter, which fell through to the copy branch.
- `ServiceCategoryPage`: bespoke hero + bespoke card list → shared `ServiceDomain`, so a category page and the same domain on `/services` are now identical.
- `ServiceDetailPage`: rebuilt with `FaqAccordion`; **FAQPage JSON-LD and the `Service` SchemaMarkup preserved**. Page-level closing CTA dropped (footer's page-aware CTA already covers `/services/*`).
- `PrivacyPage` / `TermsPage`: only the shared local `Section` wrapper and the `h1` were restyled — **no legal copy was touched**. Cards → hairline sections; Terms keeps its section numbers and highlight variant.
- `NotFound`: was a glass card on a bare page with no Navbar/Footer and a 128px Outfit "404". Now a normal site page — eyebrow, display heading, the attempted path, "Back to home" + contact link, and four suggested routes.
- Verified: tsc, eslint, full re-audit — all nine pages render Cormorant, 1440px wide with no overflow, zero page errors; rounded-card counts now 0 on project/servicecat/servicedetail/privacy/terms.

### Locations pages + a site-wide structured-data fix — 2026-09-22

- `/locations` (7,026 → 7,110px): statement + shared `StatStrip` (152 cities / 29 states / 13 metros / 1,200+ projects) → cities grouped by state as hairline rows → `Closing`. The red/amber/emerald tier pills became a quiet tracked label with one legend line explaining that classification affects rates. All 152 city links and the `ItemList` JSON-LD preserved.
- `/locations/:city` (2,913 → 3,580px): statement → per-city `StatStrip` → `Split` (focus + description beside the `location_hero_bg` media slot) → local context as a definition list → `Closing`. Known-city data and the generic fallback both render; **the fallback still emits `noindex, follow`** (verified on `/locations/pune`).
- Bug caught in verification: my edit left a duplicate `motion` import in `LocationPage.tsx`, which crashed the route to the error boundary. `tsc` did not flag it — only the browser did. Fixed and re-verified.

### Pre-existing bug found: no structured data was being emitted anywhere
`SchemaMarkup.tsx` rendered `<script type="application/ld+json" dangerouslySetInnerHTML={...} />` **inside `<Helmet>`**. react-helmet-async ignores `dangerouslySetInnerHTML` on children and only renders script content passed as a string child, so **every `SchemaMarkup` block across the whole site silently emitted nothing**. Confirmed pre-existing: `git diff checkpoint/v22-pre-about-editorial -- SchemaMarkup.tsx` is empty, and `/about-us` (untouched schema) showed zero JSON-LD.

Fixed to `<script type="application/ld+json">{safeJsonLd}</script>`. Verified live: `/about-us` → BreadcrumbList + Organization + Person, `/contact-us` → BreadcrumbList + InteriorDesigner, `/locations/jamshedpur` → LocalBusiness, `/services/residential/living-room` → FAQPage + Service, `/our-process` → FAQPage.

Also added schema the detail pages never had (confirmed absent in `checkpoint/v23-pre-slug-pages`, so nothing was dropped): `Article` + `BreadcrumbList` on `/blog/:slug`, `BreadcrumbList` on `/portfolio/:slug`.

### Locations narrowed to a real service area — 2026-09-22

User direction: the locations listing should show Jamshedpur and nearby cities with their states, not all of India.

- New `src/config/service-area.ts` — the editorial answer to "where do you work?", in three rings out from Jamshedpur: **Jamshedpur** (home, + its 10 neighbourhoods), **Across Jharkhand** (Ranchi, Dhanbad, Bokaro, Deoghar), **Neighbouring states** (Kolkata, Durgapur, Asansol, Rourkela, Bhubaneswar, Patna). Each ring carries a line describing what delivery actually looks like there (resident team / half-day drive / milestone visits).
- **`LOCATION_DATA` in the estimator's pricing config is deliberately untouched** — it still holds all 152 cities because it drives tier-based pricing. Only the *listing* narrowed. Every other city route still resolves via the generic fallback with `noindex, follow`, so no inbound link breaks.
- `/locations`: **7,110px → 3,342px**, 152 city links → 21, stat strip now leads with "Jamshedpur / home city". The `ItemList` JSON-LD now lists the 11 served cities instead of 152, so the structured data matches the page.
- `cityRegions` in `LocationPage` extended from 5 entries to 21 so every listed city and neighbourhood emits the correct `addressRegion` in its `LocalBusiness` schema — verified: Dhanbad/Bistupur → Jharkhand, Kolkata → West Bengal.
- Verified: tsc, eslint; Playwright — 3 bands render, 21 links, featured cities (Jamshedpur, Kolkata) are indexable while fallback cities (Dhanbad, Bistupur) correctly keep `noindex`.
- **Content gap worth closing:** only 5 of the 11 listed cities have bespoke copy (Jamshedpur, Ranchi, Kolkata, Bhubaneswar, Patna). Dhanbad, Bokaro, Deoghar, Durgapur, Asansol, Rourkela and all 10 Jamshedpur neighbourhoods render generic fallback copy and are `noindex` — they are linked from the footer and this page but cannot rank until they get real content.

## Locations consolidated to one page + area content written — 2026-09-22

User direction: write the missing city/neighbourhood content, make the page compact, and drop per-location pages in favour of a single page.

**Recommendation given and taken:** consolidate fully. Reasoning: (1) Jamshedpur's neighbourhoods are districts of one city — separate near-duplicate pages for each is the doorway-page pattern Google penalises, which is why all of them already carried `noindex`; (2) separate city pages only earn their keep with distinct local projects/photography/testimonials, which none of the 20 had; (3) **`generate-sitemap.js` never listed any `/locations/*` URL**, so there was no ranking equity to lose.

- `config/service-area.ts` rewritten as the single source of truth: 3 bands, **21 areas, ~1,400 words of newly written content**. Each area carries `context`, a `focus` line, and 2–4 sentences on what interior work is actually like there (housing stock, access, humidity, township layouts, remote-approval patterns). Content is grounded in real geography and delivery practice — **no invented project counts, testimonials or client names**.
- `/locations` is now the whole thing: statement → stat strip (leads with "Jamshedpur / home city") → "Jump to" index of all 21 → two-column area blocks grouped by band → closing. 21 anchors, `scroll-mt-28` so the fixed header doesn't cover the target.
- `LocationPage.tsx` is now a redirect only: `/locations/:slug` → `/locations#<slug>`, unknown slugs → `/locations`. Verified: `/bistupur` → `#bistupur`, `/ranchi` → `#ranchi`, `/jamshedpur` → `#jamshedpur`, `/nowhere-city` → `/locations`. No link breaks.
- Added a Jamshedpur overview block (`#jamshedpur`) — it is the site's most valuable local query and previously had no anchor of its own.
- `Footer.tsx` now derives its "Serving" row from `SERVICE_BANDS` and links to anchors instead of the redirecting routes; the hardcoded `SERVICE_AREAS` array is gone.
- Reversible by design: give an area `hasOwnPage: true` and add a route once it has real content — nothing else changes.
- Verified: tsc, eslint; Playwright — 21 areas, 21 jump links, 1,412 words, 1440px wide, zero page errors.
- **Noticed, not fixed:** `scripts/generate-sitemap.js` lists only 5 routes and two of them are wrong — `/contact` (redirect, canonical is `/contact-us`) and `/estimator` (no such route; it is `/estimate`). Portfolio, blog, services and locations are all absent.

## Release-blocking findings on the merged production branch — 2026-09-23

Context: PR #7 merged `fix-auth-refresh-e2e` into `new-crossangle-2.0` (`339e143e`, 149 commits ahead of `9fed45c3`). **Nothing has been deployed from it** — the only Vercel deployment is the 85-day-old June production build, so production still serves the pre-cookie-auth architecture (`/api/auth/me` → HTML, `/admin` → 200 unauthenticated). Verified against a preview built from `339e143e` with known provenance (`main-elt6pxaev`, Root Directory now `apps/web`, deploy block cleared by linking GitHub).

| ID | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| **F-15** | **Critical — blocks release** | **4 of 5 auth endpoints 500 at runtime.** `login`, `logout`, `refresh`, `recover` all import `../_lib/security` without a `.js` extension; `apps/web/package.json` is `"type":"module"`, so Node ESM refuses. `me` (the only handler that does not import it) works. Introduced by the F-07/F-08 commits `74dae374` + `d0cfc248`, already merged. | Live on `main-elt6pxaev`: login/logout/refresh/recover → 500 `FUNCTION_INVOCATION_FAILED`, me → 401. Build prints TS2835 for exactly those four files. **Fix proven:** appending `.js` to the four imports → rebuild → all five endpoints return real statuses (`main-6e7vjanbs`). One-line change per file; not committed anywhere. |
| **F-16** | **Critical — admin lockout** | **RLS on `user_roles` no longer lets a user read their own row**, and the fallback is down. A `super_admin` JWT queried directly against Supabase REST returns **0 rows**, while `is_platform_admin()` returns **true** and the service role sees 4 rows. `fetchUserRole` therefore gets no role, falls back to the `sync-user-role` edge function → **500**, retries exhaust → `role = null` → post-F-01 `AuthGuard` redirects to `/admin/auth?error=role_unavailable`. The fail-closed behaviour works correctly and locks out the legitimate admin. | Direct GoTrue login + REST query (no proxy): `user_roles?select=role` → 200/0 rows; `rpc/is_platform_admin` → `true`; `functions/v1/sync-user-role` → 500. On 2026-09-14 the same query returned `{role:"super_admin"}`, so this changed in the interval. Browser render not exercised — chain verified link by link. |
| **F-13** | High, unchanged | The F-13 fix is **not in the merge**. Merged `useSiteSettings.ts` still `.select("*")` (line 102); the hotfix branch was never merged and the feature-branch refactor was only ever an uncommitted working-tree edit. Production's own request has returned **401 for 12 days**. | Deployed bundle scan (169 chunks): only `select("*")` and `select("id")`. anon `select=*` → 401. Live browser probe of production 2026-09-23: `site_settings?select=*` → 401. |

### Events that did pass on the patched preview (`main-6e7vjanbs`, real provider, deployed)
- **F-02 — Closed.** Login 200; body keys `[user, role, message]`; no `session`/`access_token`. Cookies: access 936 B `Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax`, refresh `Path=/api`.
- **F-05 — Closed.** Positive: bogus access + valid refresh → 200, new access cookie issued ≠ bogus ≠ login, **refresh token rotated**. Control: valid access alone → 200 with no Set-Cookie. Negative: bogus access + bad refresh → **401 twice**, both cookies cleared `Max-Age=0`, JSON body, ~2 s for both (no loop).
- **F-06 — Closed.** Token valid before (200) → logout 204, both cookies cleared → old access **403**, old refresh reuse **400**.
- **F-08 — Closed.** Cross-origin POST to `/api/auth/login` with a foreign `Origin` → **403 `{"error":"Invalid request origin"}`**.
- **F-01 — still Implemented.** Server half could not be proven: the role read itself is broken (F-16). Not a fault of the F-01 fix.

### Recommended order before any promotion
1. Fix F-15 (four `.js` import specifiers) — without it the admin panel is 500 on login.
2. Fix F-16 — restore a self-read SELECT policy on `user_roles` (or repair `sync-user-role`), then re-run F-01 including the browser half and the no-role fail-closed case.
3. Fix F-13 — cherry-pick `65166b12` (or commit the allow-list refactor) so the release does not carry the live 401.
4. Re-deploy a preview from the fixed tip, re-run all events, then promote.

Artifacts: previews `main-elt6pxaev` (as-merged, broken) and `main-6e7vjanbs` (patched, events passed); script `<scratchpad>/events.mjs` (statuses only, no secrets).

## Preview verified end to end — 2026-09-23

Preview `https://main-cj5nrxmju-aayush-dev.vercel.app`, built from `e35546d4` on `fix/f15-auth-esm-import-extensions` (pushed). Deployed from a copy of `.vercel/output` outside the git tree because Vercel still blocks commits authored `aayushsharma141@gmail.com` ("could not be matched to a Git account" — the GitHub email addition has not taken effect/verified yet). **Provenance proven instead by hash:** 5/5 deployed `/assets/*.js` sha256-match the local build of `e35546d4`.

| Finding | Label | Live evidence on this deployment |
| --- | --- | --- |
| **F-01** role resolution | **Closed** | Browser login: `/admin` → `/admin/auth` → login 200 → `/api/auth/me` 200 → `user_roles` 200 → console `Auth: Got role from user_roles: super_admin (916ms)` → **landed on `/admin`**, dashboard rendered ("SUPER ADMIN"). API: login body `role: "super_admin"`; proxied `user_roles` 1 row. |
| **F-02** token leakage | **Closed** | Body keys `[user, role, message]`; no `session`/`access_token`. Cookie `Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax`. |
| **F-05** refresh | **Closed** | Positive: bogus access + valid refresh → 200 row `super_admin`, new access ≠ bogus ≠ login, refresh rotated. Control: valid access only → 200, no Set-Cookie. Negative: bad refresh → 401 twice, both cookies cleared, JSON, no loop. |
| **F-06** logout | **Closed** | valid 200 → logout 204, cookies cleared → old access **403**, refresh reuse **400**. |
| **F-08** cross-origin | **Closed** | POST with foreign `Origin` → **403 `{"error":"Invalid request origin"}`**. |
| **F-13** site settings | **Closed** | Bundle now carries the allow-list form; browser request `site_settings?select=id,stu…` → **200** (was 401 for 12 days). anon `select=*` still 401 — lockdown intact. |
| **F-15** ESM imports | **Closed** | login 400 / logout 204 / refresh 401 / recover 400 / me 401 — real handler responses, no 500. |
| **F-16** user_roles RLS | **Closed** | SQL applied by the owner; admin login works on production and here. |

Still open: **F-03** recovery (needs a throwaway account + emailed link), **F-07** rate limit (untested — would lock the admin out), **F-01 fail-closed half** (needs a user with no `user_roles` row), F-09/F-10.

Also open: `sync-user-role` edge function is 500 server-side and CORS-blocked in the browser (`ALLOWED_ORIGINS` not set as a Supabase secret) — the role-resolution fallback is dead, harmless while the RLS policy holds.

Nothing is promoted: production still serves the 85-day-old June build.

## F-07 / F-08 closed + RLS incident — 2026-09-23 (QA Lead)

**F-08 (CSRF/Origin) and F-07 (login rate limiting) are both VERIFIED — CLOSED.**
`node scripts/checks/probe-auth-hardening.mjs` → `401×5` then `429` (F-07 PASS); cross-origin
`POST /api/auth/logout` → `403` (F-08 PASS). Auth unit suites 48/48; `auth-lifecycle-smoke` F-06 passes.

**Root cause of ~6 failed "applied" reports on the F-07 migration: pasted SQL blocks were silently truncated in
the Dashboard SQL Editor.** The function had never existed in the database despite reports of `fn_count = 1`,
and the earlier `REVOKE`/`GRANT` pair landed only its `REVOKE` — leaving a function no role could execute,
which is why PostgREST omitted it entirely (`PGRST202`) and why a project restart and `NOTIFY pgrst` changed
nothing. Fixed by driving the SQL Editor directly and running one statement at a time, verifying each.
**Lesson for future migrations: apply one statement at a time and verify from outside the editor; never trust a
"Success" message alone.**

### Separate production incident found while diagnosing (NOT caused by this work)

- `public_read_services` (anon SELECT) was missing from `services`, so the **public website rendered "No
  services are currently listed"** to real visitors. Confirmed live on crossangleinterior.com, then fixed by
  restoring the canonical policy from `20260226120500_rls_public_tables.sql`. anon now reads 10 services.
- **`projects` is the same regression, still unfixed**: anon read it fine on 2026-09-21 (probe evidence in this
  session) and returns 0 rows today. `/portfolio` only *looks* healthy because the page falls back to static
  content. Canonical policy: `FOR SELECT TO anon USING (status = 'published')`.
- `testimonials`, `blog_posts`, `team_members` also return 0 rows to anon; unknown whether regression or
  long-standing.
- **68 public tables have RLS enabled with zero policies** (`admin_sessions`, `audit_logs`, `asset_collections`,
  `asset_metadata`, `asset_tags`, `asset_tag_links`, … ). With RLS on and no policy, everything except
  `service_role` is denied, so this likely affects admin CMS reads/writes too. Only `services` was restored;
  the rest were deliberately left alone — blanket-recreating policies is security-critical and a wrong
  `USING (true)` would expose leads, audit logs or admin sessions.
- **Timing could not be established from logs.** The project is on the free plan: Postgres log retention is 24h
  (2/3/5-day ranges are locked). Within that window the only policy DDL was legitimate drop+create pairs on
  `assets` and `user_roles`, plus three runs of `20260622000000_dam_v3_schema.sql` (which only touches the
  `asset_*` tables and *creates* policies). The `services`/`projects` loss happened between 2026-09-21 and
  2026-09-23 — outside retention. Recommend point-in-time restore (if the plan allows) or a deliberate
  table-by-table policy rebuild.

### Also fixed
`dec254a7` ("fix(admin-design): High-priority fixes for Phase 6") unrelatedly reverted the F-08 Origin header
fix in `e2e/auth-lifecycle-smoke.spec.ts`, almost certainly from a stale working copy; F-06 failed as a result.
Restored in `0e38cd64`.
