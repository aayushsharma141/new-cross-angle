/**
 * Guards the link between the integration metrics page and the edge functions
 * that produce its data.
 *
 * `/admin/system/service-integrations` counts Resend deliveries by filtering
 * `lead_activities.activity_type`. That column is free text, so nothing at the
 * type level notices when a writer and this reader drift apart — the tiles just
 * quietly read zero, which looks like "no emails sent" rather than a bug.
 *
 * So: every activity type the page counts must still be written by some edge
 * function, and the email-sending functions must not gain a delivery-logging
 * type the page has never heard of.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  CUSTOMER_EMAIL_ACTIVITY_TYPES,
  INTERNAL_EMAIL_ACTIVITY_TYPES,
} from "@/pages/admin/_hooks/useIntegrationMetrics";

const FUNCTIONS_DIR = join(process.cwd(), "..", "..", "supabase", "functions");

/** Every edge function's source, keyed by function name. */
function readEdgeFunctionSources(): Map<string, string> {
  const sources = new Map<string, string>();
  for (const entry of readdirSync(FUNCTIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "node_modules" || entry.name === "_lib") continue;
    try {
      sources.set(entry.name, readFileSync(join(FUNCTIONS_DIR, entry.name, "index.ts"), "utf8"));
    } catch {
      // Not every directory carries an index.ts; skip those.
    }
  }
  return sources;
}

describe("integration metrics data sources", () => {
  const sources = readEdgeFunctionSources();

  it("finds the edge functions it needs to inspect", () => {
    expect(sources.size, "no edge function sources were read").toBeGreaterThan(0);
    expect(sources.has("handle-new-lead")).toBe(true);
    expect(sources.has("auto-reply-lead")).toBe(true);
  });

  it("counts only activity types an edge function actually writes", () => {
    const all = [...CUSTOMER_EMAIL_ACTIVITY_TYPES, ...INTERNAL_EMAIL_ACTIVITY_TYPES];
    const combined = [...sources.values()].join("\n");

    for (const activityType of all) {
      expect(
        combined.includes(`"${activityType}"`) || combined.includes(`'${activityType}'`),
        `The metrics page counts "${activityType}", but no edge function writes it. ` +
          `Either a writer was renamed or the constant is stale — the Resend tile reads zero either way.`,
      ).toBe(true);
    }
  });

  it("knows about every delivery type the email senders log", () => {
    const known = new Set<string>([
      ...CUSTOMER_EMAIL_ACTIVITY_TYPES,
      ...INTERNAL_EMAIL_ACTIVITY_TYPES,
    ]);
    // Activity types these functions write that are not email deliveries.
    const notDeliveries = new Set(["crm_task_created"]);

    for (const fn of ["handle-new-lead", "auto-reply-lead"]) {
      const src = sources.get(fn) ?? "";
      // logActivity(client, id, "<type>", ...) and .insert({ activity_type: '<type>' })
      const found = [
        ...src.matchAll(/logActivity\([^,]+,[^,]+,\s*["'`]([\w_]+)["'`]/g),
        ...src.matchAll(/activity_type:\s*["'`]([\w_]+)["'`]/g),
      ].map((m) => m[1]);

      for (const activityType of found) {
        if (notDeliveries.has(activityType)) continue;
        expect(
          known.has(activityType),
          `${fn} logs "${activityType}", which the metrics page does not count. ` +
            `Add it to the constants in useIntegrationMetrics.ts, or to notDeliveries here if it is not an email send.`,
        ).toBe(true);
      }
    }
  });
});
