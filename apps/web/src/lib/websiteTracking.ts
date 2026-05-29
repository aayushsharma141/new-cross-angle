/**
 * websiteTracking.ts
 *
 * Lightweight page-view tracking helper for use outside of React component
 * context (e.g. directly in App.tsx route change effects).
 *
 * Delegates to PostHog directly so it works without the full AnalyticsProvider
 * context chain.
 */

import posthog from "posthog-js";

/**
 * Fire a `page_viewed` event for the current page.
 * Safe to call even before PostHog is fully initialised — events are
 * queued internally by the PostHog SDK until the instance bootstraps.
 *
 * @param path  - The pathname + search string (e.g. `/services/residential`)
 * @param title - The page `<title>` at the time of navigation
 */
export function trackWebsitePageView(path: string, title?: string): void {
  try {
    posthog.capture("page_viewed", {
      path,
      title: title ?? document.title,
      referrer: document.referrer || undefined,
    });
  } catch {
    // PostHog not yet initialised or blocked — silently ignore
  }
}
