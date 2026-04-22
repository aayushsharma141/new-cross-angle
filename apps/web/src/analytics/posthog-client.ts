/**
 * posthog-client.ts
 *
 * The single consent-aware wrapper around posthog-js.
 * Only captures events when `consent === "all"`.
 * Designed to be dependency-injectable for unit testing.
 */

import type { AnalyticsEventMap } from "./events";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConsentLevel = "all" | "strict" | "none";

/** The posthog-js API surface we depend on (injectable for tests). */
export interface PostHogInstance {
  init(apiKey: string, options: Record<string, unknown>): void;
  capture(event: string, properties?: Record<string, unknown>): void;
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  reset(): void;
  opt_in_capturing(): void;
  opt_out_capturing(): void;
}

export interface ClientOptions {
  consent: ConsentLevel;
  posthog: PostHogInstance;
  apiKey?: string;
  apiHost?: string;
}

export interface AnalyticsClient {
  track<K extends keyof AnalyticsEventMap>(
    event: K,
    properties: AnalyticsEventMap[K]
  ): void;
  identify(distinctId: string, traits?: Record<string, unknown>): void;
  reset(): void;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a consent-gated analytics client.
 *
 * - When `consent === "all"`: initialises PostHog (once) and enables capture.
 * - Any other consent level: all methods are no-ops; PostHog is never touched.
 *
 * @example
 *   const client = createAnalyticsClient({ consent, posthog: posthogInstance, apiKey, apiHost });
 *   client.track("quiz_started", { sessionId, mode: "deep" });
 */
export function createAnalyticsClient(opts: ClientOptions): AnalyticsClient {
  const enabled = opts.consent === "all";

  if (enabled && opts.apiKey) {
    opts.posthog.init(opts.apiKey, {
      api_host: opts.apiHost ?? "https://us.i.posthog.com",
      capture_pageview: false,   // We fire page_viewed manually for accuracy
      autocapture: true,
      person_profiles: "identified_only",
      persistence: "localStorage",
      session_recording: {
        maskTextSelector: "input[type='password'], [data-posthog-mask]",
        blockElements: "[data-posthog-block]",
      },
    });
  }

  return {
    track<K extends keyof AnalyticsEventMap>(
      event: K,
      properties: AnalyticsEventMap[K]
    ): void {
      if (!enabled) return;
      opts.posthog.capture(event as string, properties as Record<string, unknown>);
    },

    identify(distinctId: string, traits?: Record<string, unknown>): void {
      if (!enabled) return;
      opts.posthog.identify(distinctId, traits);
    },

    reset(): void {
      if (!enabled) return;
      opts.posthog.reset();
    },
  };
}
