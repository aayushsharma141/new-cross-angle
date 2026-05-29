/**
 * ALCS Consultation Intelligence Engine
 *
 * This module computes the four intelligence layers:
 *   1. Confidence Score — aspiration vs realism alignment
 *   2. Interpretation Conflict — intent vs visual behavior contradiction
 *   3. Property Suitability — property constraints vs lifestyle goals
 *   4. Negotiation Memory — running track of compromises accepted/rejected
 *
 * All computations are deterministic and local — no API call required.
 * The engine runs post-VisualInstinct and its output is stored in UserSignals.consultationIntelligence
 */

import type {
  UserSignals,
  AestheticScores,
  ConfidenceScore,
  PropertySuitability,
  InterpretationConflict,
  NegotiationMemory,
  ConsultationIntelligence,
} from '@/types/discovery';

// ── 1. CONFIDENCE SCORE ────────────────────────────────────────────────────────

/**
 * Detects the gap between what a user says they want (aspirational)
 * and what their concrete answers suggest (realistic).
 *
 * High aspirationGap = user is dreaming. Needs softer, more reality-anchored advice.
 */
export function computeConfidenceScore(signals: UserSignals, scores: AestheticScores): ConfidenceScore {
  const flags: string[] = [];
  let aspirationGap = 0;
  let consistencyPenalty = 0;

  // --- Visual luxury vs budget mismatch ---
  const visualLuxuryScore = computeVisualLuxuryLevel(signals);
  const budgetLevel = getBudgetLevel(signals.budgetBracket);

  if (visualLuxuryScore >= 3 && budgetLevel <= 1) {
    aspirationGap += 40;
    flags.push('luxury_visual_low_budget');
  } else if (visualLuxuryScore >= 2 && budgetLevel === 1) {
    aspirationGap += 20;
    flags.push('moderate_luxury_tight_budget');
  }

  // --- Intent vs visual signal mismatch ---
  const intentIsCalm = ['Peace', 'Organization'].includes(signals.intent || '');
  const visualIsDramatic = isVisualDramatic(scores);

  if (intentIsCalm && visualIsDramatic) {
    aspirationGap += 20;
    consistencyPenalty += 20;
    flags.push('calm_intent_dramatic_visual');
  }

  // --- Social intent vs introverted lifestyle ---
  if (signals.hostingFrequency === 'Rarely' && scores.social >= 7) {
    consistencyPenalty += 15;
    flags.push('social_intent_introvert_signals');
  }

  // --- High novelty, small apartment ---
  const isSmallSpace = (signals.carpetArea || 1000) < 700;
  if (isSmallSpace && scores.novelty >= 7) {
    aspirationGap += 10;
    flags.push('high_novelty_small_space');
  }

  // --- Budget chose luxury resolution (hero focus) but area is very small ---
  if (isSmallSpace && signals.luxuryResolution === 'hero-focus') {
    consistencyPenalty += 10;
    flags.push('hero_focus_constrained_area');
  }

  const overall = Math.max(0, 100 - aspirationGap - consistencyPenalty);
  const consistencyScore = Math.max(0, 100 - consistencyPenalty);

  let realism: ConfidenceScore['realism'];
  if (overall >= 80) realism = 'grounded';
  else if (overall >= 60) realism = 'moderate';
  else if (overall >= 40) realism = 'aspirational';
  else realism = 'speculative';

  return { overall, aspirationGap, consistencyScore, realism, flags };
}

// ── 2. INTERPRETATION CONFLICT DETECTOR ──────────────────────────────────────

/**
 * Detects when a user's stated emotional intent contradicts their visual behavior.
 * Example: intent = "Peace" + selects dark luxury hotel images = conflict.
 */
export function detectInterpretationConflict(
  signals: UserSignals,
  scores: AestheticScores
): InterpretationConflict {
  const intent = signals.intent || '';
  const visualIsDramatic = isVisualDramatic(scores);
  const visualIsMinimal = scores.minimalism >= 7;

  // Peace/Organization intent → expects quiet, minimal visuals
  // But user selected dramatic, luxury-heavy visuals
  if (['Peace', 'Organization'].includes(intent) && visualIsDramatic) {
    return {
      detected: true,
      intentSignal: intent,
      visualSignal: 'dramatic luxury',
      conflictSummary:
        `Your emotional goal — ${intent} — suggests a desire for calm and quietude. ` +
        `Yet your visual instincts lean toward rich, dramatic environments. ` +
        `These are not incompatible, but they do need reconciliation.`,
    };
  }

  // Warmth intent → expects organic, warm visuals
  // But user selected cold, minimal, steel-heavy visuals
  if (intent === 'Warmth' && visualIsMinimal && scores.warmth < 4) {
    return {
      detected: true,
      intentSignal: 'Warmth',
      visualSignal: 'cool minimalism',
      conflictSummary:
        `You entered seeking warmth and organic comfort, but your visual selections lean cool and restrained. ` +
        `This could mean you want emotional warmth expressed through precision — not clutter.`,
    };
  }

  // Pride intent → expects aspirational, social visuals
  // But user selected introverted, quiet visuals
  if (intent === 'Pride' && scores.social < 4 && scores.novelty < 4) {
    return {
      detected: true,
      intentSignal: 'Pride',
      visualSignal: 'quiet restraint',
      conflictSummary:
        `Your stated goal — Pride — suggests wanting a space that makes a statement. ` +
        `But your visual choices lean toward quiet, private restraint. ` +
        `Your home may be designed to impress subtly rather than boldly.`,
    };
  }

  return {
    detected: false,
    intentSignal: intent,
    visualSignal: '',
    conflictSummary: '',
  };
}

// ── 3. PROPERTY SUITABILITY ENGINE ───────────────────────────────────────────

/**
 * Scores how well the declared property can support the desired lifestyle.
 * NEVER pushes "get a new property" — uses empathetic soft warnings.
 */
export function computePropertySuitability(signals: UserSignals, scores: AestheticScores): PropertySuitability {
  const area = signals.carpetArea || 1000;
  const propertyType = signals.propertyType || 'Apartment';
  const hosting = signals.hostingFrequency || 'Monthly';
  const social = scores.social;
  const novelty = scores.novelty;

  const blockedExperiences: string[] = [];
  const achievableExperiences: string[] = [];
  let score = 100;

  // Social + small space
  if (social >= 7 && area < 800) {
    blockedExperiences.push('expansive social openness');
    score -= 25;
  } else if (social >= 5 && area >= 800) {
    achievableExperiences.push('comfortable social hosting');
  }

  // Heavy hosting + studio/small apartment
  if (hosting === 'Weekly' && area < 700) {
    blockedExperiences.push('frequent large-group hosting');
    score -= 20;
  } else if (hosting === 'Weekly' && area >= 700) {
    achievableExperiences.push('regular intimate gatherings');
  }

  // Indoor-outdoor lifestyle (Villa compatible, Apartment not ideal)
  if (novelty >= 7 && propertyType === 'Apartment') {
    blockedExperiences.push('indoor-outdoor lifestyle flow');
    score -= 10;
  }

  // Experimental/novelty design in small space
  if (novelty >= 7 && area < 600) {
    blockedExperiences.push('statement architectural interventions');
    score -= 10;
  }

  // Always achievable with good design
  achievableExperiences.push('personalized material palette');
  achievableExperiences.push('emotionally resonant lighting design');
  if (area >= 600) achievableExperiences.push('curated functional zones');

  const tier: PropertySuitability['tier'] =
    score >= 80 ? 'natural-fit' :
    score >= 55 ? 'constrained' :
    'structurally-restrictive';

  let softWarning: string | undefined;
  if (blockedExperiences.length > 0) {
    softWarning =
      `Your property can support many of your desired experiences. Some — like ${blockedExperiences[0]} ` +
      `— may remain structurally limited within the available footprint, ` +
      `but design intelligence can create a powerful approximation.`;
  }

  return { score: Math.max(0, score), tier, blockedExperiences, achievableExperiences, softWarning };
}

// ── 4. NEGOTIATION MEMORY BUILDER ────────────────────────────────────────────

/**
 * Constructs the running negotiation memory from all compromises accepted
 * during the session so far.
 */
export function buildNegotiationMemory(signals: UserSignals): NegotiationMemory {
  const acceptedCompromises: string[] = [];
  const rejectedCompromises: string[] = [];
  const emotionalResistanceZones: string[] = [];
  const nonNegotiables: string[] = [];
  let compromiseFatigue = 0;

  // Room conflict resolution = accepted spatial compromise
  if (signals.roomConflictResolution === 'Multi-use') {
    acceptedCompromises.push('multi-use room configuration');
    compromiseFatigue += 2;
  } else if (signals.roomConflictResolution === 'Reduce Density') {
    acceptedCompromises.push('reduced room density');
    compromiseFatigue += 3;
  }

  // Budget luxury resolution = accepted aesthetic compromise
  if (signals.luxuryResolution === 'material-swap') {
    acceptedCompromises.push('engineered material alternatives');
    compromiseFatigue += 2;
  } else if (signals.luxuryResolution === 'phased') {
    acceptedCompromises.push('phased execution timeline');
    compromiseFatigue += 1;
  } else if (signals.luxuryResolution === 'hero-focus') {
    acceptedCompromises.push('premium finishes limited to hero spaces');
    compromiseFatigue += 1;
  }

  // Intent-visual conflict resolution
  if (signals.intentVisualConflict === 'emotionally-quiet') {
    acceptedCompromises.push('emotional quietude over visual drama');
    compromiseFatigue += 2;
  } else if (signals.intentVisualConflict === 'visually-luxurious') {
    acceptedCompromises.push('visual luxury as primary expression');
    compromiseFatigue += 1;
  }

  // Must-Have rooms = non-negotiables
  if (signals.roomPriorities) {
    for (const [room, priority] of Object.entries(signals.roomPriorities)) {
      if (priority === 'Must-Have') {
        nonNegotiables.push(room);
        // If emotional weight is restoration-type, flag as resistance zone
        const weight = signals.roomEmotionalWeights?.[room];
        if (weight === 'emotional-restoration' || weight === 'cultural-value') {
          emotionalResistanceZones.push(room);
        }
      }
    }
  }

  return {
    acceptedCompromises,
    rejectedCompromises,
    emotionalResistanceZones,
    nonNegotiables,
    compromiseFatigue: Math.min(10, compromiseFatigue),
  };
}

// ── 5. STRATEGIC ADVICE GENERATOR ────────────────────────────────────────────

/**
 * Generates value-priority intelligence for the estimator handoff.
 * Tells the estimator WHAT to prioritize, not just WHAT is constrained.
 */
export function generateStrategicAdvice(
  signals: UserSignals,
  scores: AestheticScores,
  confidence: ConfidenceScore,
  suitability: PropertySuitability
): string {
  const intent = signals.intent || 'a personalized home';
  const area = signals.carpetArea || 1000;
  const isConstrained = suitability.tier !== 'natural-fit';

  // High calm intent + spatial constraints
  if (['Peace', 'Organization'].includes(signals.intent || '') && isConstrained) {
    return `Given your emotional priority for ${intent.toLowerCase()} and spatial limitations, reducing visual fragmentation ` +
      `will create more psychological impact than investing in premium finishes. ` +
      `A disciplined, curated edit — fewer, better things — is your highest-return strategy.`;
  }

  // Aspirational with budget constraints
  if (confidence.realism === 'aspirational' || confidence.realism === 'speculative') {
    return `Your design vision has strong aspirational energy. The highest-impact approach is to ` +
      `concentrate investment in the spaces where you spend the most emotional time — ` +
      `typically the master bedroom and primary living zone — and let secondary spaces be quietly functional.`;
  }

  // Social, warm, constrained space
  if (scores.social >= 6 && area < 900) {
    return `Your social instincts are strong, but your footprint rewards intentionality. ` +
      `Design the living zone as a transformable social hub — furniture that breathes, ` +
      `lighting that shifts from ambient to intimate, surfaces that invite gathering without clutter.`;
  }

  // Well-aligned, high confidence
  return `Your signals are internally consistent and well-matched to your property. ` +
    `Focus the investment on material quality and lighting — these two axes produce the most ` +
    `emotionally significant return for your identified aesthetic profile.`;
}

// ── 6. MASTER INTELLIGENCE SYNTHESIZER ───────────────────────────────────────

/**
 * Runs all engines and returns the complete ConsultationIntelligence object.
 * Call this after VisualInstinct completes.
 */
export function synthesizeConsultationIntelligence(
  signals: UserSignals,
  scores: AestheticScores
): ConsultationIntelligence {
  const confidence = computeConfidenceScore(signals, scores);
  const propertySuitability = computePropertySuitability(signals, scores);
  const interpretationConflict = detectInterpretationConflict(signals, scores);
  const negotiationMemory = buildNegotiationMemory(signals);
  const strategicAdvice = generateStrategicAdvice(signals, scores, confidence, propertySuitability);

  return {
    confidence,
    propertySuitability,
    interpretationConflict,
    negotiationMemory,
    strategicAdvice,
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

/** Visual luxury level derived from material + light + image choices */
function computeVisualLuxuryLevel(signals: UserSignals): number {
  const materialScore: Record<string, number> = {
    'Polished Stone': 4, 'Matte Metal': 3, 'Warm Timber': 2, 'Woven Linen': 2, 'Brushed Concrete': 2
  };
  const lightScore: Record<string, number> = {
    'Dramatic Spotlight': 4, 'Golden Hour': 2, 'Cool Daylight': 2, 'Soft Candlelight': 2
  };
  const matScore = materialScore[signals.materialChoice || ''] ?? 2;
  const ltScore = lightScore[signals.lightPreference || ''] ?? 2;
  return Math.round((matScore + ltScore) / 2);
}

/** True if the user's aesthetic scores signal dramatic, rich visual taste */
function isVisualDramatic(scores: AestheticScores): boolean {
  return scores.novelty >= 6 && scores.minimalism <= 4 && scores.warmth >= 5;
}

/** Convert budget bracket string to numeric level */
function getBudgetLevel(bracket?: string): number {
  const map: Record<string, number> = {
    '₹5L–₹15L': 1,
    '₹15L–₹30L': 2,
    '₹30L–₹60L': 3,
    '₹60L–₹1Cr': 4,
    '₹1Cr+': 5,
  };
  return bracket ? (map[bracket] ?? 2) : 2;
}
