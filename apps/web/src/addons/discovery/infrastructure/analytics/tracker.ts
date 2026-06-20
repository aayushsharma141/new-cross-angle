/**
 * tracker.ts — Discovery Engine analytics helpers
 *
 * Migration: Task 4 of posthog-analytics-replan.md
 *
 * REMOVED: Direct writes to `addon_events` and `addon_sessions` supabase tables.
 * ADDED:   Pure, dependency-injectable helpers that map to the typed `AnalyticsEventMap`.
 *
 * Lead persistence (submit-discovery-lead Edge Function) is intentionally
 * kept in LeadGatePhase.tsx — only behavioral analytics move here.
 */

import { v4 as uuidv4 } from "uuid";
import type { AnalyticsEventMap } from "@/analytics/events";

// ── Dependency-injectable track function type ─────────────────────────────────

/**
 * Any function that accepts (eventName, properties) — matches the
 * AnalyticsClient.track signature from posthog-client.ts, making
 * these helpers trivially testable with vi.fn().
 */
export type TrackFn = <K extends keyof AnalyticsEventMap>(
    event: K,
    properties: AnalyticsEventMap[K]
) => void;

// ── Session management (no Supabase side effects) ─────────────────────────────

/**
 * Generates a new session ID for funnel stitching.
 * No longer persists to `addon_sessions` — PostHog correlation
 * is done via the sessionId property on each event.
 */
export const startSession = (): string => uuidv4();

/**
 * No-op: session completion is now captured via `trackQuizCompleted`.
 * Retained to avoid breaking existing call sites while Task 4 is in progress.
 * @deprecated Call trackQuizCompleted instead.
 */
export const completeSession = (): void => {};

// ── Named event helpers (PostHog contract) ────────────────────────────────────

export const trackQuizStarted = (
    track: TrackFn,
    sessionId: string,
    mode: "quick" | "deep"
) => track("quiz_started", { sessionId, mode });

export const trackQuizStepViewed = (
    track: TrackFn,
    sessionId: string,
    stepName: string,
    stepIndex?: number
) => track("quiz_step_viewed", { sessionId, stepName, stepIndex });

export const trackQuizStepCompleted = (
    track: TrackFn,
    sessionId: string,
    stepName: string,
    durationMs?: number
) => track("quiz_step_completed", { sessionId, stepName, durationMs });

export const trackQuizCompleted = (
    track: TrackFn,
    sessionId: string,
    archetype: string,
    totalSeconds: number
) => track("quiz_completed", { sessionId, archetype, totalSeconds });

export const trackResultLoaded = (
    track: TrackFn,
    sessionId: string,
    archetype: string
) => track("result_loaded", { sessionId, archetype });

export const trackLeadGateViewed = (
    track: TrackFn,
    sessionId: string,
    archetype: string
) => track("lead_gate_viewed", { sessionId, archetype });

export const trackLeadGateSubmitted = (
    track: TrackFn,
    sessionId: string,
    email: string,
    leadScore?: number
) => track("lead_gate_submitted", { sessionId, email, leadScore });
