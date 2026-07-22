/**
 * Typed analytics event contract.
 *
 * Every event the app emits must live here. Adding a key gives you
 * full autocomplete + TypeScript enforcement at call sites via `track()`.
 */

export type OverrideReason = 
  | "client_preference"
  | "designer_experience"
  | "budget"
  | "technical_constraint"
  | "timeline"
  | "missing_information"
  | "other";

export interface AnalyticsMetadata {
  eventVersion: number;
  schemaVersion: string; // e.g. "2026-07"
  timestamp: string; // ISO8601
  sessionId: string;
  designerId?: string;
  leadId?: string;
  workspaceVersion?: string;
  recommendationVersion?: string;
  genomeVersion?: string;
  buildVersion?: string;
  // Context Snapshots
  activeRoom?: string;
  activeArchetype?: string;
  recommendationConfidence?: number;
  designerExperienceLevel?: string;
  leadComplexity?: string;
  projectBudgetTier?: string;
  projectCategory?: string;
}

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
  contact_form_submitted: { 
    leadSource: string;
    email: string;
    leadId?: string;
    sessionId?: string;
    correlationId?: string;
  };
  estimate_path_selected: { pathId: string };
  discovery_path_selected: { pathId: string };

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

  // ── Phase 30.5.1 Workspace Lifecycle ──────────────────────────────────────
  "workspace.opened": { leadId: string };
  "workspace.first_interaction": { leadId: string; interactionType: "clicked_evidence" | "opened_dossier" | "changed_room" | "expanded_recommendation" | "edited_commitment" | "other" };
  "workspace.room.entered": { leadId: string; room: string };
  "workspace.room.left": { leadId: string; room: string; timeSpentMs: number };
  
  // ── Phase 30.5.1 Decision Ledger & Commitment Revisions ───────────────────
  "workspace.commitment.created": { leadId: string; commitmentId: string; revisionId: string };
  "workspace.commitment.revised": { leadId: string; commitmentId: string; revisionId: string; previousRevisionId: string };
  "workspace.commitment.locked": { 
    leadId: string; 
    commitmentId: string; 
    revisionId: string;
    timeToDecisionMs: number; 
    
    // Deep Snapshot Context
    recommendationId?: string;
    genomeVersion?: string;
    workspaceVersion?: string;
    activeRoom?: string;
    confidenceScore?: number;
    selectedEvidence: string[];
    selectedConstraints: string[];
    selectedPriorities: string[];
    
    // Confidence & Learning Indicators
    designerConfidence: number;
    confidenceDrivers: string[]; // e.g. ["Evidence", "Recommendation", "Client Constraints"]
    
    // Evidence Utilization
    evidenceAvailable: number;
    evidenceViewed: number;
    evidenceUsed: number;
    
    // Divergence Tracking
    recommendationSimilarityScore?: number; // 0-100%

    // Learning Validation Safeguards
    dqiAlgorithmVersion?: string;
    dqiStage?: "provisional" | "outcome-adjusted" | "validated";
    dqiConfidence?: "LOW" | "MEDIUM" | "HIGH";
  };
  "workspace.commitment.unlocked": { leadId: string; commitmentId: string; revisionId: string };
  "workspace.commitment.archived": { leadId: string; commitmentId: string };
  
  "workspace.room.revisited": { leadId: string; room: string; revisitCount: number };
  "workspace.action.undone": { leadId: string; action: string };

  // ── Phase 30.5.1 Designer Confidence ──────────────────────────────────────
  "designer.confidence.pre": { leadId: string; score: number; confidenceSource: "manual" | "inferred" };
  "designer.confidence.post": { leadId: string; score: number; confidenceSource: "manual" | "inferred"; commitmentId?: string; confidenceDrivers?: string[] };

  // ── Phase 30.5.1 Recommendations ──────────────────────────────────────────
  "recommendation.generated": { 
    leadId: string; 
    recommendationId: string;
    recommendationVersion: string;
    genomeVersion: string;
    scoringVersion: string;
    algorithmVersion: string;
  };
  "recommendation.viewed": { leadId: string; recommendationId: string };
  "recommendation.expanded": { leadId: string; recommendationId: string };
  "recommendation.copied": { leadId: string; recommendationId: string };
  "recommendation.divergence_calculated": { leadId: string; recommendationId: string; commitmentId: string; similarityScore: number };

  // ── Phase 30.5.1 AI Explainability ────────────────────────────────────────
  "explainability.explanation.opened": { leadId: string; recommendationId: string };
  "explainability.evidence_card.clicked": { leadId: string; recommendationId: string; evidenceSource: string };
  "explainability.evidence.reopened": { leadId: string; recommendationId: string };
  "explainability.genome_reasoning.viewed": { leadId: string; recommendationId: string };
  "explainability.confidence_indicator.viewed": { leadId: string; recommendationId: string };

  // ── Phase 30.5.1 System / Automated Actions ───────────────────────────────
  "system.recommendation.generated": { leadId: string; recommendationId: string };
  "system.genome.completed": { leadId: string };
  "system.workspace.restored": { leadId: string };
  "system.error": { leadId?: string; errorType: string; message: string };
  "system.timeout": { leadId?: string; operation: string };
  "system.retry": { leadId?: string; operation: string; attempt: number };
  "system.recovery": { leadId?: string; operation: string };
  "analytics.failed": { originalEvent: string; reason: string };

  // ── Phase 30.5.1 CRM Lifecycle ────────────────────────────────────────────
  "crm.lead.opened": { leadId: string };
  "crm.lead.archived": { leadId: string; reason?: string };
  "crm.lead.converted": { leadId: string; proposalId?: string };

  // ── Phase 30.5.1 Session Lifecycle ────────────────────────────────────────
  "analytics.session.started": { designerId?: string };
  "analytics.session.ended": { designerId?: string; durationMs: number };

  // ── Phase 30.5.1 Outcome Layer ────────────────────────────────────────────
  "outcome.client_accepted": { leadId: string; proposalId: string };
  "outcome.client_rejected": { leadId: string; proposalId: string; reason?: string };
  "outcome.project_completed": { leadId: string; proposalId: string };
  "outcome.budget_changed": { leadId: string; proposalId: string; originalBudget: number; newBudget: number };
  "outcome.scope_changed": { leadId: string; proposalId: string };
  "outcome.designer_satisfaction": { leadId: string; score: number };
  "outcome.client_satisfaction": { leadId: string; score: number };
  "outcome.learning_locked": { leadId: string; commitmentId: string; reason: string };
}
