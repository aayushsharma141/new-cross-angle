/**
 * Guards the link between the frontend's analytics events and the nightly
 * PostHog sync.
 *
 * `sync-posthog-reporting` filters PostHog by event-name strings. Those must
 * match the keys of `AnalyticsEventMap` exactly; if a key is renamed, the
 * matching metric reads back as a permanent, silent zero in the Blog, Discovery
 * and Traffic admin pages.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SYNC_FN = join(process.cwd(), "..", "..", "supabase", "functions", "sync-posthog-reporting", "index.ts");
const EVENTS_FILE = join(process.cwd(), "src", "analytics", "events.ts");

function syncedEvents(): string[] {
  const src = readFileSync(SYNC_FN, "utf8");
  return [...src.matchAll(/event:\s*"([a-z_]+)"\s*\}/g)].map((m) => m[1]);
}

function eventMapKeys(): Set<string> {
  const src = readFileSync(EVENTS_FILE, "utf8");
  const start = src.indexOf("AnalyticsEventMap");
  expect(start, "AnalyticsEventMap not found in events.ts").toBeGreaterThan(-1);
  return new Set([...src.slice(start).matchAll(/^ {2}([a-z_]+):/gm)].map((m) => m[1]));
}

describe("PostHog event-name coupling", () => {
  it("finds the synced events (guards against the regex silently matching nothing)", () => {
    expect(syncedEvents().length).toBeGreaterThanOrEqual(9);
  });

  it("every event the nightly sync reads is still captured by the frontend", () => {
    const keys = eventMapKeys();
    const missing = syncedEvents().filter((e) => !keys.has(e));
    expect(missing, `sync-posthog-reporting reads events the frontend no longer sends: ${missing.join(", ")}`).toEqual([]);
  });
});
