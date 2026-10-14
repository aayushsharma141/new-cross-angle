# Admin Panel Data Accuracy Audit

**Date:** 2026-09-24
**Scope:** Every number, status indicator, chart and trend shown in `/admin/*` — dashboard, system health, CRM analytics, traffic (PostHog), blog analytics, discovery (style-quiz) analytics, and the new service-integrations page.
**Method:** Static code review, tracing every displayed value back to its query/computation. No live database access — findings that depend on production data state are marked "needs live verification" rather than asserted as fact.
**Not in scope:** UI/UX, CRUD correctness, RBAC — see `admin-panels-assessment-2026-04-18.md` for that angle. This report is only about whether displayed numbers are real.

**A note on process:** this repo currently has multiple Claude Code sessions working on the admin panel concurrently (visible via `ListAgents` at audit time: "Admin panel UI/UX simplification," "Admin panel production readiness QA," "Admin hub UI/UX pros and cons," "ImageKit configuration and asset health," among others). Some of this may already be known to those sessions or mid-fix. Reconcile before starting remediation work rather than assuming this report is the only source of truth.

---

## Executive summary

47 findings across 5 admin surfaces. The headline problem is not subtle bugs in otherwise-sound calculations — it's that **a meaningful fraction of the "live" numbers on the main Hub page are not computed at all**. They're string literals in JSX, styled identically to the real metrics next to them, including a fabricated named business event (a lead called "Rahul Sharma") that never happened.

| Severity | Count | Meaning |
|---|---|---|
| 🔴 Fabricated / hardcoded | 14 | Displayed as live data; is actually a constant |
| 🟠 Wrong | 13 | Computation is genuinely incorrect |
| 🟡 Misleading | 12 | Computed correctly, but the label overstates what it means |
| ⚪ Fragile | 11 | Correct today, will silently drift or break |

**The five worth fixing first**, in order:

1. **`AdminHub.tsx` fabricates a named lead event and a fake activity stream** (DASH-08, DASH-09) — this is the one that can actually mislead a person making a decision, not just look sloppy.
2. **The Discovery funnel chart is structurally broken** (DISC-01, DISC-02) — every stage shows the same count, and the "drop-off" section is silently empty. The chart whose entire purpose is showing drop-off shows none, ever.
3. **Two different lead-scoring formulas write the same `score` column with no version stamp** (CRM-05, CRM-06) — Hot/Warm/Cold badges and close-rate math rest on a number that can't be trusted to mean one consistent thing.
4. **`sync-posthog-reporting` has no cron schedule anywhere in the migrations** (SVC-03) — every page reading `analytics_reporting_daily` (Blog, Discovery, Service Integrations, parts of CRM) has no verified freshness guarantee. Needs live confirmation this runs at all.
5. **The "vs previous period" trend arithmetic hardcodes +100% when the denominator is zero** (CRM-07, DASH-17), and several trend arrows are hardcoded `"up"` regardless of direction (DASH-15, CRM-10). This pattern repeats across Dashboard, CRM, and Traffic — it's one bug shape, not three.

---

## Cross-cutting patterns

These aren't one-off bugs — the same mistake shape recurs enough times to fix at the pattern level rather than findings-list level:

- **Zero-denominator trend math.** `prevCount > 0 ? computed : (current > 0 ? 100 : 0)` appears independently in at least 3 places (DASH-17/CRM-07 in leads, CRM-07 in PostHog traffic). Every one of these renders "+100%" for a case that isn't a doubling — it's "no comparable prior data." Worth a single shared helper that returns `null`/"n/a" instead of 100 when the denominator is zero, used everywhere trend % is computed.
- **Hardcoded trend arrows.** `trend="up"` passed as a literal regardless of the actual number, at minimum in DASH-15, CRM-10, TrafficTab (3 instances). `AdminKPI` renders these as a green success chip — visually identical to a real, computed trend.
- **Free-text string coupling between a writer and a reader, with no test enforcing they match.** Confirmed in three independent places: `activity_type` strings between edge functions and `lead_activities` readers (already guarded by `integration-metric-sources.test.ts`, added this session); `analytics_reporting_daily.metric_name`/`event` strings between `sync-posthog-reporting`'s `METRICS` array and the frontend's `AnalyticsEventMap` (BLOG-10/DISC — unguarded); and `EVENT_LABELS` in `AdminBlogEngagement.tsx` already caught drifting from the real event name (`read_time` vs `reading_time`, BLOG-08). Recommend the same guard-test pattern used for Resend/Telegram be applied to the PostHog event-name coupling — it already caught one real bug class this session.
- **Failed query reads back identical to "genuinely zero."** `useHubStats.ts` swallows all 5 of its query errors into `console.error` only (DASH-18); `TrafficTab.tsx`'s four sub-widgets do the same for PostHog (CRM-09/TRAF-09). `AdminKPI` has a working `isError` prop used correctly in some places (`OverviewTab.tsx`) and ignored in others. An outage looks exactly like "no activity today" everywhere it's ignored.
- **Enum/label drift.** `CrmAnalytics.tsx`'s `STATUS_LABELS` and `score-lead`'s status filter both reference a `lead_status_enum` that was renamed out from under them (`negotiation`, `final_review`, `contacted`, `qualified`, `proposal` don't exist anymore — CRM-01, CRM-02, CRM-06). This is what happens when the enum change and its downstream label maps aren't grepped together.

---

## Dashboard & System Health

*(Files: `AdminHub.tsx`, `useHubStats.ts`, `SystemTab.tsx`, `SystemContext.tsx`)*

| ID | Severity | Location | Finding |
|---|---|---|---|
| DASH-01 | 🔴 Fabricated | `AdminHub.tsx:162-181` | Circular "Health Score" gauge hardcodes `96%` / `strokeDasharray="96, 100"` in JSX. Never reads `useSystem().health`. |
| DASH-02 | 🔴 Fabricated | `AdminHub.tsx:190-197` | "Website: HEALTHY" and "CRM Synced: HEALTHY" are static strings sitting next to a real `formatStorage()` value in the same list — indistinguishable to the reader. |
| DASH-03 | 🔴 Fabricated | `AdminHub.tsx:315-328` | Content Management tile: `12%` usage bar hardcoded regardless of actual storage; `158 Images`, `43 Videos`, `12 Reviews` have no backing query anywhere. |
| DASH-04 | 🔴 Fabricated | `AdminHub.tsx:356-361` | Blog tile: `124.6K` "Total Organic Views", `18 (Active)` articles — hardcoded, unconnected to any blog query. |
| DASH-05 | 🔴 Fabricated | `AdminHub.tsx:391-400` | User Access tile: `4 Admins`, `6 Designers`, `2FA: Enforced` — no user/role/2FA query exists anywhere in this component. |
| DASH-06 | 🔴 Fabricated | `AdminHub.tsx:429-441` | System Settings tile: `Database Health: 100% ONLINE`, `6 Integrations`, `Auto Backups: SUCCESSFUL` — none probed. |
| DASH-07 | 🔴 Fabricated | `useHubStats.ts:159-280` | `getModules()` renders a whole class of quickStats as green "success" chips that are literal constants: `"System Status": "Optimal"`, `"Analytics": "↑ On"`, `"Funnel": "Active"`, `"Login Security": "Active"`, `"Integrations": "Live"`, `"Audit Trail": "On"`. |
| DASH-08 | 🔴 Fabricated — **highest risk** | `AdminHub.tsx:456-499` | "Key Alerts & Recommendations" contains fabricated, timestamped, *named* business events: *"Rahul Sharma submitted a quote request 2 hours ago"*, *"Luxury Culinary Space Project quote sent 3 days ago"*, plus invented SEO/speed claims. This can mislead a stakeholder into believing a specific event occurred. |
| DASH-09 | 🔴 Fabricated | `AdminHub.tsx:505-550` | "Live Activity Stream" is a hardcoded fake event array (fake relative timestamps, fake username, fake backup log line). The adjacent Refresh button only refetches `hub-stats`, never touches this list — clicking it does nothing. A separate, *real* `RecentActivityFeed` already exists and is used on `AdminDashboard.tsx:226` — this product now has one real and one fake "recent activity" widget. |
| DASH-10 | ⚪ Fragile | `useHubStats.ts:108,126`, `SystemTab.tsx:51` | `storageTotalGB = 20` hardcoded independently in two places. |
| DASH-11 | 🔴 Fabricated | `SystemContext.tsx:70` | `storage: 'available'` set unconditionally on the success path, never actually probed; `SystemTab.tsx:110` shows it with a pulsing "healthy" indicator as if checked. |
| DASH-12 | 🔴 Fabricated | `AdminHub.tsx:107-111` | "Avg Response: 15m" is a constant shown whenever `totalLeads > 0` — not computed from any lead-response timestamp delta. |
| DASH-13 | 🟡 Misleading | `SystemContext.tsx:52-65` | "API Services"/"Resend" health is derived from whether an edge-function error's message literally contains `'FunctionsFetchError'`. Any other failure mode (bad API key, 500, auth failure) reads as "Online." Also ⚪ fragile — depends on an internal supabase-js string nothing enforces. |
| DASH-14 | 🟡 Misleading | `SystemTab.tsx:37,45,58` | "Events" in the Database Records chart is actually `analytics_reporting_daily` filtered to `metric_name = 'page_views'` only — mislabeled as generic events. |
| DASH-15 | 🔴 Fabricated | `OverviewTab.tsx:187,207`; `TrafficTab.tsx:163-166,183`; `ContentTab.tsx` | Trend arrows hardcoded `"up"` (or `"neutral"`) regardless of actual direction — Pipeline Value, Page Views, Unique Visitors, Engagement Events, Views, Testimonials. |
| DASH-16 | 🟡 Misleading | `OverviewTab.tsx:159-168`, `SalesTab.tsx:191` | "Attention: Conversion Drop" alert fires off an arbitrary hardcoded benchmark (15% conversion, 50 lead-score) with no stated basis. |
| DASH-17 | 🟠 Wrong | `OverviewTab.tsx:91`, `SalesTab.tsx:66` | `leadsTrend` hardcodes `+100%` whenever the previous period had zero leads and the current period has any — shown as a real "+100% vs previous period" up-badge even for 1 lead. |
| DASH-18 | 🟠 Wrong | `useHubStats.ts:78-119` | All 5 parallel Supabase queries only `console.error` on failure; `count ?? 0` / `data ?? []` means an RLS error or network blip renders identically to "zero activity today." Unlike `AdminKPI`'s `isError` prop (used correctly elsewhere), nothing here ever surfaces an error state. |
| DASH-19 | ⚪ Fragile | `AdminHub.tsx` vs `SystemTab.tsx`/`SystemContext.tsx` | Two independent "system health" sources exist — one hardcoded (96%/HEALTHY), one real (`SystemContext`) — with nothing keeping them in sync. They can and will show contradictory status simultaneously. |

---

## CRM Analytics, Lead Scoring, Traffic (PostHog)

*(Files: `CrmAnalytics.tsx`, `leadScoring.ts`, `score-lead`, `auto-score-lead`, `TrafficTab.tsx`, `posthog-query`, `AdminLeads.tsx`, `crm/kpis.ts`)*

| ID | Severity | Location | Finding |
|---|---|---|---|
| CRM-01 | 🟠 Wrong | `CrmAnalytics.tsx:119-129` | `STATUS_LABELS` maps a lead-status enum (`contacted, qualified, consultation_scheduled, proposal_sent, negotiation, final_review`) that no longer exists. The live enum (per `20260529180000_align_lead_status_enum.sql`) is `new, in_conversation, meeting_planned, quote_sent, closing, won, lost`. Every funnel bar and Opportunity Radar card shows the raw DB code for every stage except `new`/`won`/`lost`. |
| CRM-02 | 🟡 Misleading | `leadScoring.ts:291-293` | "Committed" forecast filters on `status === "negotiation" \|\| "final_review"` — neither exists in the enum, so this always reduces to "won only," while the UI label (`CrmAnalytics.tsx:613`) says "Won + Final Review," implying in-flight deals are counted. |
| CRM-03 | 🟠 Wrong | `CrmAnalytics.tsx:223-226,273-275` | Data Health score: `missingBudget`/`missingAction` computed over open leads only, but `missingSource` computed over *all* leads (including won/lost), against a denominator (`openLeads.length * 3`) scoped to open leads only. Mismatched populations deflate the health score. |
| CRM-04 | ⚪ Fragile | `CrmAnalytics.tsx:238,307-316` | Funnel % baseline (`firstStageCount`) is whichever stage survives a zero-filter first — if "New Inquiry" is empty, the next stage silently becomes the 100% baseline. |
| CRM-05 | 🔴 Fabricated / 🟡 Misleading | `score-lead/index.ts:111-141` vs `auto-score-lead/index.ts:143-157` | Two structurally different scoring formulas (different weights, different inputs) both write the same `leads.score` column, with no algorithm/version stamp. `CrmAnalytics.tsx:201` then blends whichever DB value exists with a third, client-only fallback formula when null. Hot/Warm/Cold badges and close-rate math all rest on this three-way-inconsistent number. No "score last computed" timestamp is shown anywhere. |
| CRM-06 | 🟠 Wrong | `score-lead/index.ts:172-173` | Bulk recompute filters `.in('status', ['new','contacted','qualified','proposal'])` — three of four values don't exist in the current enum, so `recalculateAll` only ever rescoring `new` leads. Any lead past that stage keeps a stale score indefinitely, shown as current. |
| CRM-07 | 🟠 Wrong | `posthog-query/index.ts:89` | `viewsTrend` hardcodes `+100%` when there's no comparable previous-period data — same shape as DASH-17. |
| CRM-08 | 🟠 Wrong | `posthog-query/index.ts:151`, `AdminQuizAnalytics.tsx:299-301` | `retention-summary`'s HogQL has no upper time bound and isn't restricted to visitors active in the selected window — `returningVisitors` includes anyone whose first-ever visit predates the window, active or not. This is then rendered as a fabricated day-by-day "Retention Curve" line chart from two unordered totals. |
| CRM-09 | 🟡 Misleading | `TrafficTab.tsx:84,105,121,137` | Four sub-widgets (timeline, top-pages, hourly, sources) swallow PostHog errors to `[]` with no error banner, unlike the main stats query which does show one. If PostHog credentials are missing entirely, these render "No data yet" — indistinguishable from real zero traffic. |
| CRM-10 | 🔴 Fabricated | `TrafficTab.tsx:162-166,178-185` | "Unique Visitors" and "Engagement Events" KPIs pass `trend="up"` unconditionally — no comparison was computed. |
| CRM-11 | ⚪ Fragile | `posthog-query/index.ts:118` | `traffic-hourly` uses `toHour(timestamp)` in what's very likely UTC — "Peak Traffic Hours" for an IST business will show hours shifted ~5.5h with no conversion or caveat. **Needs live verification of PostHog project timezone setting.** |
| CRM-12 | ⚪ Fragile | `TrafficTab.tsx:28-31,77` | KPI total uses raw `currentFrom` as the lower bound; the chart underneath uses `startOfDay(currentFrom)`. The headline number and the chart below it aren't guaranteed to reconcile. |
| CRM-13 | 🟡 Misleading | `crm/kpis.ts:63-69` vs `CrmAnalytics.tsx:228` | "Hot Leads: X of Y active" — `Y` includes won/lost leads on `AdminLeads.tsx`, but `CrmAnalytics.tsx`'s hot-lead count explicitly excludes them. Same concept, two different numbers depending which page you're on. |

---

## Blog & Discovery (Style Quiz) Analytics

*(Files: `AdminQuizAnalytics.tsx`, `analytics-utils.ts`, `AdminBlogOverview.tsx`, `AdminBlogPerformance.tsx`, `AdminBlogEngagement.tsx`, `sync-posthog-reporting`, `posthog-query`)*

| ID | Severity | Location | Finding |
|---|---|---|---|
| DISC-01 | 🟠 **Wrong — structural** | `AdminQuizAnalytics.tsx:85`, `analytics-utils.ts:180-194` | `computeFunnel`: incomplete synthetic sessions get `last_stage: null` → `indexOf` returns `-1` → they contribute to *zero* stages. Completed sessions get `last_stage: "results"` (last index) → they increment *all 11 stages equally*. Net result: the Stage Funnel bar chart shows identical counts for every stage from `welcome` through `results` — a perfectly flat funnel with no visible drop-off, on a chart that exists specifically to show drop-off. |
| DISC-02 | 🟠 Wrong | `analytics-utils.ts:162-168` | `computeDropoffs` skips any session with `last_stage: null` (`continue`) — since that's every incomplete session (see DISC-01), the "Drop-off Points" section is always empty. It never renders, with nothing telling the admin this is a data gap rather than "no drop-offs occurred." |
| DISC-03 | 🟠 Wrong | `posthog-query/index.ts:142-145` | "Discovery Engine Funnel (PostHog)" queries `quiz_step_viewed`/`properties.stepName` — internal quiz steps, not the documented `quiz_started → quiz_completed → lead_gate_viewed → lead_gate_submitted` funnel. Rows are ordered by count DESC, not chronological order, so the chart can plot a later, less-popular step before an earlier, more-popular one. No drop-off % is computed. |
| DISC-04 | 🟡 Misleading | `analytics-utils.ts:189-194` | `computeFunnel`'s `pct` is always `(stage count) / (total sessions)` — i.e. "% of all starts," not "% of previous stage." The UI shows this with no label distinguishing which baseline it is; the two numbers are very different and easy to conflate. |
| DISC-05 | 🔴 Fabricated | `AdminQuizAnalytics.tsx:192-195` | "+12% vs last month," "+5% vs last month," and "Stable" on the Discovery KPI cards are literal string constants — never computed, never change. |
| DISC-06 | 🟠 Wrong | `AdminBlogOverview.tsx:63-66,118-119`, `AdminBlogPerformance.tsx:174-176` | `blog_posts` query has no `status` filter (drafts/unpublished included); articles with no tracked events get `readTime`/`scrollDepth = 0` (not `null`), which then dilutes the averaged "Avg Read Time"/"Avg Scroll Depth" KPIs downward. |
| DISC-07 | 🟡 Misleading | `AdminBlogPerformance.tsx:72-74,104` | `views = eventViews > 0 ? eventViews : blog_posts.view_count`. Silently falls back to a different counter (a denormalized column) whenever the events query returns 0 for an article — including on a transient query failure, which is only `console.warn`ed. `AdminBlogOverview.tsx` never falls back, so the same article can show different view counts on two different admin pages. |
| DISC-08 | ⚪ Fragile | `AdminBlogEngagement.tsx:40-48` vs `useBlogTracking.ts:91` | `EVENT_LABELS` maps `read_time: "Read Time"`, but the actual event fired is `"reading_time"`. It already fell through the label map once and displays as the raw string — a live example of the exact drift pattern SVC-04 (below) exists to prevent. |
| DISC-09 | ⚪ Fragile | `sync-posthog-reporting/index.ts:157-160` | Per-metric fetch failures are only `structuredLog("warn", ...)`ed — a total sync outage produces zero rows silently, with no alert path anywhere in the function. |
| DISC-10 | ⚪ Fragile — **unguarded, same shape as the Resend/Telegram fix already applied this session** | `sync-posthog-reporting/index.ts:83-97` vs `apps/web/src/analytics/events.ts` (`AnalyticsEventMap`) and `posthog-query`'s hardcoded HogQL literals | Nine event-name strings must match exactly between what the frontend `capture()`s and what the nightly sync/query functions filter on. Nothing tests this. A renamed `AnalyticsEventMap` key makes the corresponding metric read back as a silent, permanent `0` — no error, no test failure, no alert. `integration-metric-sources.test.ts` (added this session) guards the equivalent Resend/Telegram coupling; this is the same gap, one layer over. |

---

## Service Integrations page (self-audit)

*(This session's own work, `AdminServiceIntegrations.tsx` / `useIntegrationMetrics.ts` — flagged against the same standard applied to everything else above.)*

| ID | Severity | Location | Finding |
|---|---|---|---|
| SVC-01 | 🟠 Wrong | `webhook_failures` table, all readers | Confirmed by full-repo search: **nothing anywhere in this codebase inserts into `webhook_failures`.** `retry-webhooks/index.ts` only `SELECT`s and `UPDATE`s existing rows; `notify-telegram/index.ts` never writes to it on failure. The Telegram card's "Awaiting retry" / "Gave up after 5 tries" / "Recovered on retry" tiles will read `0/0/0` forever, regardless of actual Telegram delivery health — indistinguishable from "everything's fine." Either something writes to this table outside the repo (a Dashboard-configured webhook, undocumented) or the table is dead. **Needs live verification.** |
| SVC-02 | ⚪ Fragile — needs live verification | `_archive/20260404000001_media_bytes_rpc.sql` | The only migration defining `get_total_media_bytes()` sums `FROM public.media` — a table that does not exist in the generated Supabase types (only `media_files` does). Either the live function was hand-patched via the Supabase Dashboard to reference `media_files` (consistent with this repo's documented pattern of untracked schema drift, per `.decisions/0003-production-is-schema-source-of-truth.md`), or every page calling this RPC (`SystemTab.tsx`, this session's own media metrics) is returning 0 or wrong data. Cannot be resolved from the repo alone. |
| SVC-03 | ⚪ Fragile — needs live verification | `supabase/migrations/` (absence) | No `cron.schedule(...)` entry anywhere in the migrations references `sync-posthog-reporting`. Only `stale-lead-checker` (every 6h) and `weekly-report-email` (Mondays) are scheduled. If this function isn't scheduled via the Dashboard either, `analytics_reporting_daily` never refreshes and every page reading it (Blog, Discovery, this session's own analytics tile) is showing permanently stale or empty data with no indication of that. |
| SVC-04 | ✅ Mitigated this session | `apps/web/src/test/integration-metric-sources.test.ts` | Added specifically to guard the Resend/Telegram `activity_type` string coupling described in the cross-cutting patterns section above. Verified to actually fail on simulated drift (not a vacuous pass). Recommend the same pattern be extended to the PostHog event-name coupling (DISC-10). |

---

## Recommended remediation order

This report intentionally does not fix anything — per the request, it's meant to support planning. Suggested phasing, roughly in the order that reduces the most trust-risk per unit of effort:

**Phase 1 — Remove fabricated content (no investigation needed, just delete/replace):**
DASH-01 through DASH-09, DASH-11, DASH-12, DASH-15, DISC-05, CRM-10. These aren't bugs to diagnose — they're literals to delete or wire to real queries. DASH-08/DASH-09 (the fake named lead and fake activity feed) should go first; `AdminDashboard.tsx` already has a working `RecentActivityFeed` that can likely replace DASH-09 directly.

**Phase 2 — Fix the enum/label drift (mechanical, one enum vs. several consumers):**
CRM-01, CRM-02, CRM-06. Grep for the old enum values across the admin surface; there may be more than the three files found here.

**Phase 3 — Fix the structurally broken charts:**
DISC-01, DISC-02, DISC-03 (Discovery funnel is currently non-functional, not just imprecise).

**Phase 4 — Resolve the lead-scoring split-brain:**
CRM-05, CRM-06 — needs a product decision (which formula is authoritative), not just a code fix. Add a `score_version`/`score_computed_at` column once decided.

**Phase 5 — Live verification (can't be resolved by reading code):**
SVC-01, SVC-02, SVC-03, CRM-11. Check the Supabase Dashboard for cron jobs and Database Webhooks, and confirm the live `get_total_media_bytes()` definition and PostHog project timezone.

**Phase 6 — Systemic guards:**
Extend `integration-metric-sources.test.ts`'s pattern to the PostHog event-name coupling (DISC-10); add the shared zero-denominator trend helper described in Cross-cutting patterns; standardize on `AdminKPI`'s `isError` prop everywhere a query result feeds a KPI tile, instead of letting failures render as zero.
