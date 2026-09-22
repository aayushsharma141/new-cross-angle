/**
 * posthog-client.test.ts
 *
 * Task 1 + Task 2 tests: verify the consent-gated analytics client
 * never captures when consent is "strict", and initializes PostHog
 * exactly once when consent is "all".
 */

import { describe, expect, it, vi } from "vitest";
import { createAnalyticsClient } from "../posthog-client";

/** Minimal posthog stub — only tracks calls */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePosthogStub(): any {
  return {
    capture: vi.fn(),
    init: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  };
}

// ── Task 1 test ───────────────────────────────────────────────────────────────

describe("createAnalyticsClient — consent: strict", () => {
  it("does not capture when consent is strict", () => {
    const posthog = makePosthogStub();
    const client = createAnalyticsClient({ consent: "strict", posthog });

    client.track("page_viewed", { path: "/contact-us" });

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("does not initialize posthog when consent is strict", () => {
    const posthog = makePosthogStub();
    createAnalyticsClient({
      consent: "strict",
      posthog,
      apiKey: "phc_test",
      apiHost: "https://us.i.posthog.com",
    });

    expect(posthog.init).not.toHaveBeenCalled();
  });
});

// ── Task 2 test ───────────────────────────────────────────────────────────────

describe("createAnalyticsClient — consent: all", () => {
  it("initializes PostHog once when consent is all", () => {
    const posthog = makePosthogStub();
    createAnalyticsClient({
      consent: "all",
      posthog,
      apiKey: "phc_test",
      apiHost: "https://us.i.posthog.com",
    });

    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ api_host: "https://us.i.posthog.com" })
    );
  });

  it("captures events when consent is all", () => {
    const posthog = makePosthogStub();
    const client = createAnalyticsClient({
      consent: "all",
      posthog,
      apiKey: "phc_test",
    });

    client.track("quiz_started", { sessionId: "s1", mode: "deep" });

    expect(posthog.capture).toHaveBeenCalledWith("quiz_started", {
      sessionId: "s1",
      mode: "deep",
    });
  });

  it("does not capture when consent is none", () => {
    const posthog = makePosthogStub();
    const client = createAnalyticsClient({ consent: "none", posthog });

    client.track("page_viewed", { path: "/" });

    expect(posthog.capture).not.toHaveBeenCalled();
  });
});
