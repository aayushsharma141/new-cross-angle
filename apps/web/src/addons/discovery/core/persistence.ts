import type { AestheticScores, UserSignals } from "@/types/discovery";

const DISCOVERY_RESULT_KEY = "ca_discovery_result";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface DiscoveryResult {
  /** Base archetype name, e.g. "The Quiet Curator" */
  archetype: string;
  /** Display name — AI identity if available, otherwise base archetype name */
  displayName: string;
  scores: AestheticScores;
  /** Full quiz signals — used by the Estimator ALCS pipeline for rich DiscoveryHandoff */
  signals?: UserSignals;
  /** AI-generated identity, present when deep mode was used */
  aiIdentity?: {
    identityName: string;
    tagline?: string;
  };
  /** Archetype confidence score 0–1 (from ALCS engine) */
  archetypeConfidence?: number;
  savedAt: number;
}

export function saveDiscoveryResult(result: Omit<DiscoveryResult, "savedAt">): void {
  try {
    const payload: DiscoveryResult = { ...result, savedAt: Date.now() };
    localStorage.setItem(DISCOVERY_RESULT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("[Discovery] Failed to persist result to localStorage:", e);
  }
}

export function loadDiscoveryResult(): DiscoveryResult | null {
  try {
    const raw = localStorage.getItem(DISCOVERY_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiscoveryResult;
    // Reject stale results
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      clearDiscoveryResult();
      return null;
    }
    // Sanity check — must have an archetype string
    if (!parsed.archetype || typeof parsed.archetype !== "string") {
      clearDiscoveryResult();
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn("[Discovery] Failed to load result from localStorage:", e);
    return null;
  }
}

export function clearDiscoveryResult(): void {
  try {
    localStorage.removeItem(DISCOVERY_RESULT_KEY);
  } catch (e) {
    console.warn("[Discovery] Failed to clear result from localStorage:", e);
  }
}
