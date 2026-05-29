# PostHog Analytics Replan Implementation

**Created:** 2026-04-10
**Status:** Ready to start  
**Priority:** High

---

## Objective

Make `PostHog` the single source of truth for product analytics, while keeping Supabase for transactional lead capture and adding a safe reporting bridge for admin dashboards.

---

## Background

The current app is split between two PostHog bootstraps and several Supabase-backed analytics tables. The new architecture uses one consent-aware browser analytics layer for capture, one typed event contract for every funnel event, and one server-side reporting sync path.

---

## Tasks (per docs/plans/2026-04-08-posthog-analytics-replan.md)

- [x] **Task 1: Add a minimal analytics test harness**
  - Package.json script, vitest.config.ts, and initial client test.
- [x] **Task 2: Consolidate PostHog bootstrap into one consent-aware client**
  - Update `main.tsx`, `App.tsx`, `PostHogProvider.tsx`, create `posthog-client.ts`.
- [x] **Task 3: Define a typed PostHog event contract**
  - Define `AnalyticsEventMap` in `events.ts`.
- [x] **Task 4: Migrate the Discovery Engine from Supabase event tables to PostHog**
  - Update Tracker to push cleanly via PostHog instead of `addon_events`.
- [ ] **Task 5: Instrument the rest of the public lead funnel**
  - Wire Contact, Price Estimator, CTA clicks into the new event map.
- [ ] **Task 6: Build a secure admin reporting bridge for PostHog data**
  - Create Supabase edge function to sync summary posthog metrics into `analytics_reporting_daily`.
- [ ] **Task 7: Remove legacy analytics drift and update docs**
  - Remove dead Supabase analytics table inserts and update architecture docs.

---

## Next Action

Start **Task 1: Add a minimal analytics test harness**.

---

## Decisions & Rules

- **Consent:** Do not ship PostHog initialization outside the generic `CookieConsentProvider` consent path.
- **Admin Security:** Do not expose PostHog personal API keys to the browser! Admin pages must read entirely from Supabase reporting tables.
- **Events:** Rename generic events to explicit PostHog names (e.g. `quiz_step_viewed`).
