/**
 * LeadScore — Lead qualification scoring logic.
 *
 * Calculates a composite score from three signals:
 *   1. Intent   — when is the project planned?
 *   2. Budget   — estimated investment range
 *   3. Decision — is the user the decision-maker?
 *
 * Score range: 0–14
 * Intent levels: low (0–3) | medium (4–7) | high (8+)
 */

export type IntentKey = "exploring" | "twelveMonths" | "sixMonths" | "immediate";
export type BudgetKey = "under2L" | "twoToFiveL" | "fiveToFifteenL" | "fifteenPlusL";
export type DecisionKey = "researching" | "shared" | "decisionMaker";
export type IntentLevel = "low" | "medium" | "high";

export const INTENT_WEIGHTS: Record<IntentKey, number> = {
    exploring: 0,
    twelveMonths: 1,
    sixMonths: 3,
    immediate: 5,
};

export const BUDGET_WEIGHTS: Record<BudgetKey, number> = {
    under2L: 0,
    twoToFiveL: 1,
    fiveToFifteenL: 3,
    fifteenPlusL: 5,
};

export const DECISION_WEIGHTS: Record<DecisionKey, number> = {
    researching: 0,
    shared: 2,
    decisionMaker: 4,
};

export interface LeadSignals {
    intent: IntentKey;
    budget: BudgetKey;
    decision: DecisionKey;
}

export interface LeadResult {
    score: number;
    level: IntentLevel;
}

/**
 * Pure function — no side effects. Computes composite lead score.
 */
export function calculateLeadScore(signals: LeadSignals): LeadResult {
    const score =
        INTENT_WEIGHTS[signals.intent] +
        BUDGET_WEIGHTS[signals.budget] +
        DECISION_WEIGHTS[signals.decision];

    return { score, level: intentLevel(score) };
}

/**
 * Maps numeric score to categorical intent level.
 */
export function intentLevel(score: number): IntentLevel {
    if (score <= 3) return "low";
    if (score <= 7) return "medium";
    return "high";
}
