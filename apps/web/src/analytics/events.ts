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
  /** Fires for all result page views — including shared URLs — for retargeting. */
  quiz_result_viewed: {
    archetype: string;
    scores: Record<string, number>;
    traits: string[];
  };
  image_selected: { sessionId: string; imageId: number; tags: Record<string, number> };
  adjective_selected: { sessionId: string; adjective: string };

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

  // ── Discovery → Estimator integration ─────────────────────────────────────
  /** Fires once when Discovery localStorage data is read and used to pre-fill the Estimator. */
  discovery_prefill_applied: {
    archetype: string;
    service: string;
    executionTier: string | null;
    /** Names of add-on form fields that were toggled on by the pre-fill (e.g. ["customFurniture", "premiumLighting"]). */
    addonsApplied: string[];
    /** True when the user reached results in deep mode and we have an AI-derived identity name. */
    hasAiIdentity: boolean;
  };
  /** Fires when the user explicitly dismisses the personalized badge (X click) — disinterest signal. */
  discovery_prefill_dismissed: {
    archetype: string;
    /** 0-indexed step the user was on at dismissal time. */
    step: number;
  };
  /**
   * Fires at lead submission for any session that started with a Discovery pre-fill.
   * Lets you answer "what % of pre-filled leads converted with the recommended tier vs overrode it".
   */
  discovery_prefill_outcome: {
    archetype: string;
    originalService: string;
    finalService: string | null;
    originalTier: string | null;
    finalTier: string | null;
    serviceKept: boolean;
    tierKept: boolean;
    /** How many of the originally-toggled add-ons remained on at submission. */
    addonsKeptCount: number;
    /** Total add-ons originally toggled by the pre-fill. */
    addonsOriginalCount: number;
  };

  // ── CTAs ──────────────────────────────────────────────────────────────────
  cta_clicked: { ctaId: string; destination: string };
}
