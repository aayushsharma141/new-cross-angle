/**
 * Typed analytics event contract.
 *
 * Every event the app emits must live here. Adding a key gives you
 * full autocomplete + TypeScript enforcement at call sites via `track()`.
 */

export interface AnalyticsEventMap {
  // ── Navigation ────────────────────────────────────────────────────────────
  page_viewed: { path: string; title?: string };

  // ── Discovery quiz funnel ─────────────────────────────────────────────────
  quiz_started: { sessionId: string; mode: "quick" | "deep" };
  quiz_step_viewed: { sessionId: string; stepName: string; stepIndex?: number };
  quiz_step_completed: {
    sessionId: string;
    stepName: string;
    durationMs?: number;
  };
  quiz_completed: {
    sessionId: string;
    archetype: string;
    totalSeconds: number;
  };
  result_loaded: { sessionId: string; archetype: string };

  // ── Lead gate ─────────────────────────────────────────────────────────────
  lead_gate_viewed: { sessionId: string; archetype: string };
  lead_gate_submitted: {
    sessionId: string;
    email: string;
    leadScore?: number;
  };

  // ── Contact & estimate funnel ─────────────────────────────────────────────
  contact_form_started: { path: string };
  contact_form_submitted: { leadSource: string };
  estimate_path_selected: { pathId: string };

  // ── CTAs ──────────────────────────────────────────────────────────────────
  cta_clicked: { location: string; label: string; href?: string };
}
