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
   - Explicit `SET search_path = public, auth` enforced.
3. **Dead Aggregation Mechanism Dropped:**
   - Dropped `trigger_aggregate_blog_analytics` and `aggregate_blog_analytics()` via `20260911000004_drop_dead_article_analytics_trigger.sql`. They targeted nonexistent `article_analytics` and caused Postgres to abort event transactions.
4. **Security Housekeeping Remaining:**
   - Any Supabase management/service credentials that were exposed in agent command history or logs during prior sessions should be rotated in the Supabase Dashboard.

