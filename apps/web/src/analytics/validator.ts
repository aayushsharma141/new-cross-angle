import { z } from "zod";
import type { AnalyticsEventMap, AnalyticsMetadata } from "./events";

// ── Shared Schema Validation ──────────────────────────────────────────────────
// Enforces that every event has required global correlation fields before shipping.

export const BaseMetadataSchema = z.object({
  // Versioning
  eventVersion: z.number().int().positive(),
  schemaVersion: z.string().min(1),
  timestamp: z.string().datetime(),
  sessionId: z.string().min(1),
  
  // Identifiers (Optional but tracked)
  designerId: z.string().optional(),
  leadId: z.string().optional(),
  
  // System context
  workspaceVersion: z.string().optional(),
  recommendationVersion: z.string().optional(),
  genomeVersion: z.string().optional(),
  buildVersion: z.string().optional(),
  
  // Cognitive/Project context snapshots
  activeRoom: z.string().optional(),
  activeArchetype: z.string().optional(),
  recommendationConfidence: z.number().optional(),
  designerExperienceLevel: z.string().optional(),
  leadComplexity: z.string().optional(),
  projectBudgetTier: z.string().optional(),
  projectCategory: z.string().optional(),
});

// ── Event Specific Validation Rules ───────────────────────────────────────────

export class AnalyticsValidationError extends Error {
  constructor(public event: string, message: string) {
    super(`[AnalyticsValidator] Invalid payload for '${event}': ${message}`);
    this.name = "AnalyticsValidationError";
  }
}

/**
 * Validates an event and its properties at runtime before emitting to PostHog.
 * Designed to drop or flag malformed metrics that would corrupt DQI/DCD scores.
 */
export function validateAnalyticsEvent<K extends keyof AnalyticsEventMap>(
  event: K,
  properties: AnalyticsEventMap[K] & Partial<AnalyticsMetadata>
): boolean {
  try {
    // 1. Verify strict DCD properties
    if (event === "designer.confidence.pre" || event === "designer.confidence.post") {
      const p = properties as AnalyticsEventMap["designer.confidence.pre"];
      if (typeof p.score !== "number" || p.score < 0 || p.score > 100) {
        throw new AnalyticsValidationError(event, `Confidence score must be 0-100, got ${p.score}`);
      }
      if (p.confidenceSource !== "manual" && p.confidenceSource !== "inferred") {
        throw new AnalyticsValidationError(event, `Invalid confidenceSource: ${p.confidenceSource}`);
      }
    }

    // 3. Prevent locked commitment without decision time and proper context
    if (event === "workspace.commitment.locked") {
      const p = properties as AnalyticsEventMap["workspace.commitment.locked"];
      if (typeof p.timeToDecisionMs !== "number" || p.timeToDecisionMs < 0) {
        throw new AnalyticsValidationError(event, `Invalid timeToDecisionMs: ${p.timeToDecisionMs}`);
      }
      // Extremely fast decisions (e.g., <30ms) are likely bot/automated or duplicate triggers
      if (p.timeToDecisionMs < 30) {
        throw new AnalyticsValidationError(event, `timeToDecisionMs too low (${p.timeToDecisionMs}ms) - likely invalid session`);
      }
      
      // Ensure revisions and learning context are intact
      if (!p.revisionId) {
        throw new AnalyticsValidationError(event, `Missing revisionId for commitment lock`);
      }
      if (typeof p.designerConfidence !== "number") {
        throw new AnalyticsValidationError(event, `Missing designerConfidence for commitment lock`);
      }
      if (!Array.isArray(p.confidenceDrivers)) {
        throw new AnalyticsValidationError(event, `Missing confidenceDrivers array for commitment lock`);
      }
    }

    return true;
  } catch (err) {
    if (err instanceof AnalyticsValidationError) {
      console.warn(err.message);
    } else {
      console.warn(`[AnalyticsValidator] Unexpected error validating '${event}':`, err);
    }
    return false; // Invalid events should be dropped
  }
}
