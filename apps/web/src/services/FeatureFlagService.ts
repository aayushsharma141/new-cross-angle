/**
 * FeatureFlagService.ts
 * 
 * Centralized interface for evaluating feature flags. 
 * Allows separating deployment (shipping code) from release (enabling features).
 * 
 * In a real production scenario, this would be backed by PostHog, LaunchDarkly, or a DB table.
 */

export type FeatureFlag = 
  | 'enable-new-search-backend'
  | 'show-experimental-gallery'
  | 'use-edge-image-processing';

class FeatureFlagService {
  private flags: Record<FeatureFlag, boolean> = {
    'enable-new-search-backend': false,
    'show-experimental-gallery': false,
    'use-edge-image-processing': false,
  };

  /**
   * Evaluates if a feature is enabled for the current user/session.
   * Can accept context (e.g. userId) for targeted rollouts (canary/percentage).
   */
  isEnabled(flag: FeatureFlag, _context?: { userId?: string }): boolean {
    // Basic static fallback
    return this.flags[flag] || false;
  }

  // Used only for local development or chaos testing overrides
  _overrideFlag(flag: FeatureFlag, value: boolean) {
    this.flags[flag] = value;
  }
}

export const featureFlags = new FeatureFlagService();
