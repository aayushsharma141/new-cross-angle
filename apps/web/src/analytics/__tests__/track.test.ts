/**
 * track.test.ts
 *
 * Task 3 tests: verify the typed event contract is structurally correct
 * and that the track() helper forwards events accurately.
 */

import { describe, expect, it, vi, expectTypeOf, test } from "vitest";
import type { AnalyticsEventMap } from "../events";
import { track } from "../track";
import type { AnalyticsClient } from "../posthog-client";

// ── Type-level tests ──────────────────────────────────────────────────────────

test("quiz_started payload is typed correctly", () => {
  expectTypeOf<AnalyticsEventMap["quiz_started"]>().toEqualTypeOf<{
    sessionId: string;
    mode: "quick" | "deep";
  }>();
});

test("contact_form_submitted payload is typed correctly", () => {
  expectTypeOf<AnalyticsEventMap["contact_form_submitted"]>().toEqualTypeOf<{
    leadSource: string;
  }>();
});

test("cta_clicked payload is typed correctly", () => {
  expectTypeOf<AnalyticsEventMap["cta_clicked"]>().toEqualTypeOf<{
    location: string;
    label: string;
    href?: string;
  }>();
});

// ── Runtime tests ─────────────────────────────────────────────────────────────

describe("track() helper", () => {
  function makeClient(): AnalyticsClient & { track: ReturnType<typeof vi.fn> } {
    return {
      track: vi.fn(),
      identify: vi.fn(),
      reset: vi.fn(),
    };
  }

  it("forwards quiz_started to the client", () => {
    const client = makeClient();
    track(client, "quiz_started", { sessionId: "ses-1", mode: "deep" });

    expect(client.track).toHaveBeenCalledWith("quiz_started", {
      sessionId: "ses-1",
      mode: "deep",
    });
  });

  it("forwards page_viewed with path and title", () => {
    const client = makeClient();
    track(client, "page_viewed", { path: "/services", title: "Our Services" });

    expect(client.track).toHaveBeenCalledWith("page_viewed", {
      path: "/services",
      title: "Our Services",
    });
  });

  it("forwards lead_gate_submitted with leadScore", () => {
    const client = makeClient();
    track(client, "lead_gate_submitted", {
      sessionId: "ses-2",
      email: "test@example.com",
      leadScore: 85,
    });

    expect(client.track).toHaveBeenCalledWith("lead_gate_submitted", {
      sessionId: "ses-2",
      email: "test@example.com",
      leadScore: 85,
    });
  });
});
