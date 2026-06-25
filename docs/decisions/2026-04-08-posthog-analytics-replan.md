# PostHog Analytics Replan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `PostHog` the single source of truth for product analytics, while keeping Supabase for transactional lead capture and adding a safe reporting bridge for admin dashboards.

**Architecture:** The current app is split between two `PostHog` bootstraps and several Supabase-backed analytics tables. The new architecture should use one consent-aware browser analytics layer for capture, one typed event contract for every funnel event, and one server-side reporting sync path so admin screens never depend on insecure client-side access to PostHog APIs.

**Tech Stack:** Vite, React 18, React Router, `posthog-js`, `@posthog/react`, Supabase Edge Functions, Supabase SQL migrations, TypeScript, Vitest.

---

## Current-state decisions this plan locks in

1. `PostHog` becomes the source of truth for behavioral analytics.
2. Supabase remains the source of truth for leads, forms, and business records.
3. Admin analytics pages should not query raw PostHog APIs from the browser.
4. Discovery analytics must stop writing to mismatched legacy tables (`addon_*` vs `discovery_analytics_*`).
5. Cookie consent must gate PostHog initialization the same way it already gates GA and Sentry.

### Task 1: Add a minimal analytics test harness

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/test/setup.ts`
- Create: `apps/web/src/analytics/__tests__/posthog-client.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { createAnalyticsClient } from "../posthog-client";

describe("createAnalyticsClient", () => {
  it("does not capture when consent is strict", () => {
    const capture = vi.fn();
    const client = createAnalyticsClient({
      consent: "strict",
      posthog: { capture } as never,
    });

    client.track("page_viewed", { path: "/contact-us" });
    expect(capture).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- posthog-client.test.ts`
Expected: FAIL because no test script/config or `createAnalyticsClient` exists yet.

**Step 3: Write minimal implementation scaffolding**

```ts
// package.json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=web -- posthog-client.test.ts`
Expected: PASS once Task 2 adds the client.

**Step 5: Commit**

```bash
git add apps/web/package.json apps/web/vitest.config.ts apps/web/src/test/setup.ts apps/web/src/analytics/__tests__/posthog-client.test.ts
git commit -m "test: add analytics test harness"
```

### Task 2: Consolidate PostHog bootstrap into one consent-aware client

**Files:**
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/PostHogProvider.tsx`
- Modify: `apps/web/src/lib/posthog.ts`
- Modify: `apps/web/src/components/cookies/CookieConsentProvider.tsx`
- Create: `apps/web/src/analytics/posthog-client.ts`
- Create: `apps/web/src/analytics/AnalyticsProvider.tsx`

**Step 1: Write the failing test**

```ts
it("initializes PostHog once when consent is all", () => {
  const init = vi.fn();
  createAnalyticsClient({
    consent: "all",
    posthog: { init, capture: vi.fn() } as never,
    apiKey: "phc_test",
    apiHost: "https://us.i.posthog.com",
  });

  expect(init).toHaveBeenCalledTimes(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- posthog-client.test.ts`
Expected: FAIL because there is no single bootstrap path yet.

**Step 3: Write minimal implementation**

```ts
export function createAnalyticsClient(opts: ClientOptions) {
  if (opts.consent === "all" && opts.apiKey) {
    opts.posthog.init(opts.apiKey, {
      api_host: opts.apiHost,
      capture_pageview: false,
      autocapture: true,
      person_profiles: "identified_only",
    });
  }

  return {
    track: (event: string, props?: Record<string, unknown>) => {
      if (opts.consent !== "all") return;
      opts.posthog.capture(event, props);
    },
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=web -- posthog-client.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/main.tsx apps/web/src/App.tsx apps/web/src/components/PostHogProvider.tsx apps/web/src/lib/posthog.ts apps/web/src/components/cookies/CookieConsentProvider.tsx apps/web/src/analytics/posthog-client.ts apps/web/src/analytics/AnalyticsProvider.tsx
git commit -m "refactor: unify posthog bootstrap behind consent-aware provider"
```

### Task 3: Define a typed PostHog event contract

**Files:**
- Create: `apps/web/src/analytics/events.ts`
- Create: `apps/web/src/analytics/track.ts`
- Create: `apps/web/src/analytics/page-tracking.tsx`
- Create: `apps/web/src/analytics/__tests__/track.test.ts`

**Step 1: Write the failing test**

```ts
import { expectTypeOf, test } from "vitest";
import type { AnalyticsEventMap } from "../events";

test("quiz_started payload is typed", () => {
  expectTypeOf<AnalyticsEventMap["quiz_started"]>().toEqualTypeOf<{
    sessionId: string;
    mode: "quick" | "deep";
  }>();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- track.test.ts`
Expected: FAIL because the contract file does not exist.

**Step 3: Write minimal implementation**

```ts
export interface AnalyticsEventMap {
  page_viewed: { path: string; title?: string };
  quiz_started: { sessionId: string; mode: "quick" | "deep" };
  quiz_step_viewed: { sessionId: string; stepName: string };
  quiz_step_completed: { sessionId: string; stepName: string };
  quiz_completed: { sessionId: string; archetype: string; totalSeconds: number };
  result_loaded: { sessionId: string; archetype: string };
  lead_gate_viewed: { sessionId: string; archetype: string };
  lead_gate_submitted: { sessionId: string; email: string; leadScore?: number };
  contact_form_started: { path: string };
  contact_form_submitted: { leadSource: string };
  estimate_path_selected: { pathId: string };
  cta_clicked: { location: string; label: string; href?: string };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=web -- track.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/analytics/events.ts apps/web/src/analytics/track.ts apps/web/src/analytics/page-tracking.tsx apps/web/src/analytics/__tests__/track.test.ts
git commit -m "feat: add typed analytics event contract"
```

### Task 4: Migrate the Discovery Engine from Supabase event tables to PostHog

**Files:**
- Modify: `apps/web/src/addons/discovery/components/DiscoveryEngine.tsx`
- Modify: `apps/web/src/addons/discovery/components/LeadGatePhase.tsx`
- Modify: `apps/web/src/addons/discovery/components/ResultsReveal.tsx`
- Modify: `apps/web/src/addons/discovery/infrastructure/analytics/tracker.ts`
- Create: `apps/web/src/addons/discovery/infrastructure/analytics/__tests__/tracker.test.ts`

**Step 1: Write the failing test**

```ts
it("maps discovery helper calls to the posthog contract", () => {
  const track = vi.fn();
  trackQuizStarted(track, "session-1", "deep");
  expect(track).toHaveBeenCalledWith("quiz_started", {
    sessionId: "session-1",
    mode: "deep",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- tracker.test.ts`
Expected: FAIL because the tracker still writes to Supabase tables.

**Step 3: Write minimal implementation**

```ts
export const trackQuizStarted = (track: TrackFn, sessionId: string, mode: "quick" | "deep") =>
  track("quiz_started", { sessionId, mode });
```

Important implementation rules:
- Keep `submit-discovery-lead` for lead persistence.
- Keep `sessionId` generation for funnel stitching.
- Remove direct writes to `addon_events` and `addon_sessions`.
- Rename generic events like `step_viewed` to explicit PostHog names like `quiz_step_viewed`.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=web -- tracker.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/addons/discovery/components/DiscoveryEngine.tsx apps/web/src/addons/discovery/components/LeadGatePhase.tsx apps/web/src/addons/discovery/components/ResultsReveal.tsx apps/web/src/addons/discovery/infrastructure/analytics/tracker.ts apps/web/src/addons/discovery/infrastructure/analytics/__tests__/tracker.test.ts
git commit -m "feat: move discovery funnel analytics to posthog"
```

### Task 5: Instrument the rest of the public lead funnel

**Files:**
- Modify: `apps/web/src/components/CTAContact.tsx`
- Modify: `apps/web/src/pages/ContactPage.tsx`
- Modify: `apps/web/src/addons/calculators/pages/PriceEstimator.tsx`
- Modify: `apps/web/src/pages/ServiceDetailPage.tsx`
- Modify: `apps/web/src/pages/ProjectPage.tsx`
- Modify: `apps/web/src/components/Navbar.tsx`
- Modify: `apps/web/src/components/WhatsAppButton.tsx`
- Modify: `apps/web/src/pages/BlogPage.tsx`

**Step 1: Write the failing test**

```ts
it("tracks contact form submission with source metadata", async () => {
  const track = vi.fn();
  await submitContactLead({ track, leadSource: "website_contact" });
  expect(track).toHaveBeenCalledWith("contact_form_submitted", {
    leadSource: "website_contact",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- contact*.test.ts`
Expected: FAIL because contact and CTA flows are not using the shared analytics layer.

**Step 3: Write minimal implementation**

```ts
track("contact_form_started", { path: window.location.pathname });
track("contact_form_submitted", { leadSource: "website_contact" });
track("estimate_path_selected", { pathId: selectedPath });
track("cta_clicked", { location: "navbar", label: "Book Free Consultation", href: "/contact-us" });
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=web`
Expected: PASS for analytics tests.

**Step 5: Commit**

```bash
git add apps/web/src/components/CTAContact.tsx apps/web/src/pages/ContactPage.tsx apps/web/src/addons/calculators/pages/PriceEstimator.tsx apps/web/src/pages/ServiceDetailPage.tsx apps/web/src/pages/ProjectPage.tsx apps/web/src/components/Navbar.tsx apps/web/src/components/WhatsAppButton.tsx apps/web/src/pages/BlogPage.tsx
git commit -m "feat: instrument public lead funnel with posthog"
```

### Task 6: Build a secure admin reporting bridge for PostHog data

**Files:**
- Create: `supabase/functions/posthog-reporting-sync/index.ts`
- Create: `supabase/functions/posthog-reporting-sync/README.md`
- Create: `supabase/migrations/20260408_posthog_reporting_bridge.sql`
- Modify: `apps/web/src/pages/admin/AdminAnalytics.tsx`
- Modify: `apps/web/src/pages/admin/AdminBlogOverview.tsx`
- Modify: `apps/web/src/pages/admin/AdminBlogPerformance.tsx`

**Step 1: Write the failing test**

```ts
it("stores posthog daily funnel metrics in supabase reporting tables", async () => {
  const rows = mapPosthogInsightToReportingRows(mockInsightResponse);
  expect(rows[0]).toMatchObject({
    metric_key: "quiz_started",
    source: "posthog",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- reporting*.test.ts`
Expected: FAIL because there is no reporting bridge or normalized reporting table.

**Step 3: Write minimal implementation**

```ts
CREATE TABLE public.analytics_reporting_daily (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  metric_key text not null,
  metric_value numeric not null,
  source text not null default 'posthog'
);
```

```ts
// edge function
// fetch insights from PostHog using secure env vars
// upsert summarized rows into analytics_reporting_daily
```

Important implementation rules:
- Do not expose PostHog personal API keys to the browser.
- Keep admin pages reading from Supabase reporting tables or views.
- Replace `discovery_analytics_sessions/events` reads with normalized reporting queries.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=web -- reporting*.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/functions/posthog-reporting-sync/index.ts supabase/functions/posthog-reporting-sync/README.md supabase/migrations/20260408_posthog_reporting_bridge.sql apps/web/src/pages/admin/AdminAnalytics.tsx apps/web/src/pages/admin/AdminBlogOverview.tsx apps/web/src/pages/admin/AdminBlogPerformance.tsx
git commit -m "feat: add posthog reporting bridge for admin analytics"
```

### Task 7: Remove legacy analytics drift and update docs

**Files:**
- Modify: `apps/web/README.md`
- Modify: `docs/feature-roadmap.md`
- Modify: `docs/client-website-user-manual.md`
- Modify: `docs/discovery-architecture.txt`
- Modify: `apps/web/src/addons/discovery/infrastructure/analytics/tracker.ts`

**Step 1: Write the failing test**

```ts
it("contains no direct writes to deprecated analytics tables", async () => {
  const source = await fs.promises.readFile("apps/web/src/addons/discovery/infrastructure/analytics/tracker.ts", "utf8");
  expect(source).not.toContain('from("addon_events")');
  expect(source).not.toContain('from("addon_sessions")');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=web -- tracker.test.ts`
Expected: FAIL until deprecated table writes are removed.

**Step 3: Write minimal implementation**

```md
- Source of truth for behavioral analytics: PostHog
- Source of truth for lead records: Supabase
- Source of truth for admin dashboards: Supabase reporting bridge populated from PostHog
```

**Step 4: Run verification**

Run: `npm run test --workspace=web`
Expected: PASS

Run: `npm run lint --workspace=web`
Expected: PASS

Run: `npm run build --workspace=web`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/README.md docs/feature-roadmap.md docs/client-website-user-manual.md docs/discovery-architecture.txt apps/web/src/addons/discovery/infrastructure/analytics/tracker.ts
git commit -m "docs: align analytics documentation to posthog architecture"
```

## Delivery order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7

## Risks to watch

- `App.tsx` and `main.tsx` currently both wrap PostHog. That can double-initialize and double-capture.
- `https://app.posthog.com` and `https://us.i.posthog.com` are both present. Pick one env-driven host and use it everywhere.
- Discovery analytics currently mix behavioral tracking and lead persistence. Only the behavioral part should move to PostHog.
- Admin analytics currently rely on old tables that the active tracker no longer matches. Fix the reporting bridge before deleting legacy structures.
- Consent currently gates GA and Sentry, but not PostHog. Do not ship PostHog initialization outside that consent path.

## Definition of done

- One PostHog provider in the app tree.
- One typed analytics contract used by all new instrumentation.
- Discovery funnel events visible in PostHog with clean names and consistent properties.
- Contact, estimator, and CTA flows instrumented with the same contract.
- Admin analytics backed by Supabase reporting tables populated from PostHog, not browser-side secrets.
- Legacy Supabase analytics table writes removed or explicitly retired.

Plan complete and saved to `docs/plans/2026-04-08-posthog-analytics-replan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
