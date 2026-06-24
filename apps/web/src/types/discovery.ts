export enum Stage {
  Welcome = 0,
  PropertyReality = 1,
  Lifestyle = 2,
  RoomPriority = 3,
  VisualInstinct = 4,
  ReinterpretationGate = 5,
  AdjectiveSelection = 6,
  PivotQuestion = 7,
  MaterialResonance = 8,
  LightCalibration = 9,
  BudgetAlignment = 10,
  Analysis = 11,
  MiniResult = 12,
  LeadCapture = 13,
  Results = 14,
}

export interface LifestyleOption {
  label: string;
  description: string;
  image: string;
  assetKey?: string;
  scores: Partial<AestheticScores>;
}

export interface LifestyleQuestion {
  question: string;
  options: LifestyleOption[];
}

export interface AestheticScores {
  minimalism: number;
  warmth: number;
  social: number;
  structure: number;
  novelty: number;
}

export interface MaterialOption {
  name: string;
  description: string;
  color: string;
  scores: Partial<AestheticScores>;
}

export interface Archetype {
  name: string;
  tagline: string;
  traits: string[];
  materialBias: string;
  strategy: string;
  heroImageUrl?: string;
  moodboardImageUrl?: string;
  match: (scores: AestheticScores) => number;
}

export interface VisualImage {
  id: number;
  url: string;
  assetKey?: string;
  tags: Partial<AestheticScores>;
}

// --- AI Pipeline Types ---

export interface UserSignals {
  intent?: string;
  propertyType?: 'Apartment' | 'Villa' | 'Independent Floor' | 'Studio';
  carpetArea?: number;
  projectScope?: 'Cosmetic Renovation' | 'Full Structural Renovation' | 'Bare Shell' | 'New Build';
  familyStructure?: 'Nuclear' | 'Joint' | 'Pets' | 'Elderly';
  cookingRole?: 'Daily Ritual' | 'Quick Utility' | 'Hosting';
  hostingFrequency?: 'Weekly' | 'Monthly' | 'Rarely';
  roomPriorities?: Record<string, 'Must-Have' | 'Nice-to-Have'>;
  roomEmotionalWeights?: Record<string, RoomEmotionalWeight>;
  roomConflictResolution?: 'Multi-use' | 'Reduce Density';
  budgetBracket?: string;
  luxuryResolution?: string;
  // Interpretation conflict resolution
  intentVisualConflict?: 'emotionally-quiet' | 'visually-luxurious' | 'balanced';
  // Life-stage planning
  householdEvolution?: 'Stable' | 'Growing' | 'Downsizing' | 'Uncertain';
  // Consultation intelligence (computed post-visual)
  consultationIntelligence?: ConsultationIntelligence;
  primaryValue?: 'beauty' | 'practicality' | 'impression' | 'longevity' | 'identity';
  reflectionAnswers: { question: string; answer: string }[];
  lifestyleChoices: string[];
  selectedImageIds: number[];
  selectedImageTags: Partial<AestheticScores>[];
  selectedAdjectives: string[];
  freeTextReflection: string;
  sliderValues: { label: string; value: number }[];
  materialChoice: string;
  lightPreference: string;
  scores: AestheticScores;
}

export interface AIAestheticResult {
  identityName: string;
  tagline: string;
  narrative: string;
  sensoryMap: {
    light: string;
    material: string;
    layout: string;
    energy: string;
  };
  designStrategy: {
    lighting: string;
    materials: string;
    colorPalette: string;
    layout: string;
    atmosphere: string;
  };
  traits: string[];
  materialBias: string;
  confidence: number;
}

// ── ALCS Intelligence Layer Types ──────────────────────────────────

/** Why a room matters — drives negotiation flexibility */
export type RoomEmotionalWeight =
  | 'emotional-restoration'   // nervous-system regulation (non-negotiable)
  | 'social-identity'         // how others see the home
  | 'family-necessity'        // functional daily need
  | 'daily-utility'           // practical convenience
  | 'cultural-value'          // tradition / family expectation (partially negotiable)
  | 'aspiration';             // desired but flexible

/** Tracks the negotiation history across the session */
export interface NegotiationMemory {
  acceptedCompromises: string[];          // e.g. "multi-use guest+office"
  rejectedCompromises: string[];          // user said NO to these
  emotionalResistanceZones: string[];     // high-sensitivity areas
  nonNegotiables: string[];               // rooms/features flagged as absolute
  compromiseFatigue: number;              // 0–10, increases with each accepted compromise
}

/** Aspiration vs Realism alignment score */
export interface ConfidenceScore {
  overall: number;                        // 0–100
  aspirationGap: number;                  // how far visual choices exceed budget reality
  consistencyScore: number;               // how internally consistent the signals are
  realism: 'grounded' | 'moderate' | 'aspirational' | 'speculative';
  flags: string[];                        // e.g. ["luxury_visual_low_budget", "social_intent_introvert_signals"]
}

/** How well the property supports the declared lifestyle */
export interface PropertySuitability {
  score: number;                          // 0–100
  tier: 'natural-fit' | 'constrained' | 'structurally-restrictive';
  blockedExperiences: string[];           // e.g. ["expansive social openness"]
  achievableExperiences: string[];        // what CAN be done
  softWarning?: string;                   // empathetic, non-aggressive note
}

/** Conflict between stated emotional intent and observed visual behavior */
export interface InterpretationConflict {
  detected: boolean;
  intentSignal: string;           // e.g. "Peace"
  visualSignal: string;           // e.g. "dramatic luxury"
  conflictSummary: string;        // human-readable
  resolution?: 'emotionally-quiet' | 'visually-luxurious' | 'balanced';
}

/** Synthesized consultation intelligence — attached to UserSignals after visual stage */
export interface ConsultationIntelligence {
  confidence: ConfidenceScore;
  propertySuitability: PropertySuitability;
  interpretationConflict: InterpretationConflict;
  negotiationMemory: NegotiationMemory;
  strategicAdvice: string;         // value-priority intelligence for estimator handoff
}
