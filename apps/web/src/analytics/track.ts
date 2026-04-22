/**
 * track.ts
 *
 * Typed helpers built on top of `createAnalyticsClient`.
 * Import `useAnalytics` in React components, or use `analyticsClient`
 * directly in non-React contexts.
 */

import type { AnalyticsClient } from "./posthog-client";
import type { AnalyticsEventMap } from "./events";

/**
 * Type-safe wrapper around `client.track`.
 * Enforces the payload schema defined in `AnalyticsEventMap`.
 */
export function track<K extends keyof AnalyticsEventMap>(
  client: AnalyticsClient,
  event: K,
  properties: AnalyticsEventMap[K]
): void {
  client.track(event, properties);
}
