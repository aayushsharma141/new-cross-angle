/**
 * The lead score has one authoritative formula: supabase/functions/_lib/leadScoring.ts.
 * The browser keeps a mirror (lib/scoring/leadScoring.ts) so a lead gets a score
 * the moment it is inserted and the CRM can show a breakdown. If the two drift,
 * the same lead would score differently depending on which one touched it last.
 */
import { describe, it, expect } from "vitest";
import { scoreLead, SCORE_VERSION as SERVER_VERSION, temperatureFor } from "../../../../supabase/functions/_lib/leadScoring";
import { calculateLeadScoreBreakdown, getLeadTemperature, SCORE_VERSION as CLIENT_VERSION } from "@/lib/scoring/leadScoring";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

const SOURCES = [
  "referral", "organic", "google", "website_contact", "estimator", "style_quiz",
  "aesthetic_discovery_engine", "instagram", "facebook", "social", "paid", "ad", "welcome_popup", "other", "",
];

const BASE = {
  id: "x", name: "A", email: "a@b.co", phone: "9999999999", message: null, timeline: null,
  budget: null, budget_value_inr: null, category: null, lead_type: null, lead_source: null,
  source: null, score: null, score_details: null, last_activity_at: null, created_at: daysAgo(0),
};

const CASES: Record<string, Partial<typeof BASE>> = {
  "empty lead": { ...BASE, email: "", phone: "", created_at: "" as never },
  "email only": { ...BASE, phone: "" },
  "numeric budget 60L": { ...BASE, budget_value_inr: 6_000_000, category: "Full Home Interiors" },
  "numeric budget 4L": { ...BASE, budget_value_inr: 400_000, category: "consultation" },
  "text budget 20L + urgent": { ...BASE, budget: "20L", message: "need this ASAP", category: "villa" },
  "commercial office, planning": { ...BASE, category: "Commercial Office", message: "planning for next year" },
  "timeline field only": { ...BASE, timeline: "flexible" },
  "stale lead": { ...BASE, created_at: daysAgo(40), last_activity_at: daysAgo(30) },
  "week-old activity": { ...BASE, last_activity_at: daysAgo(5) },
};

describe("lead scoring parity (browser vs authoritative)", () => {
  it("uses the same version string", () => {
    expect(CLIENT_VERSION).toBe(SERVER_VERSION);
  });

  for (const [name, lead] of Object.entries(CASES)) {
    it(`scores "${name}" identically`, () => {
      const server = scoreLead(lead as never);
      const client = calculateLeadScoreBreakdown(lead as never);
      expect(client.total).toBe(server.score);
      expect(client.breakdown).toEqual(server.breakdown);
    });
  }

  for (const source of SOURCES) {
    it(`scores source "${source || "(none)"}" identically`, () => {
      const lead = { ...BASE, lead_source: source || null };
      expect(calculateLeadScoreBreakdown(lead as never).total).toBe(scoreLead(lead as never).score);
    });
  }

  it("agrees on hot / warm / cold thresholds", () => {
    for (const s of [0, 39, 40, 69, 70, 100]) {
      expect(getLeadTemperature(s).priority).toBe(temperatureFor(s));
    }
  });

  it("scores something for a typical contact-form lead (the case that used to be 0)", () => {
    const lead = { ...BASE, lead_source: "website_contact", message: "Looking for a 3BHK interior, budget around 20L" };
    expect(scoreLead(lead as never).score).toBeGreaterThan(0);
  });
});
