export interface WorkspaceDQIInputs {
  evidenceAvailable: number;
  evidenceUsed: number;
  confidenceScore: number; // The AI's confidence in the genome/recommendation (0-100)
  explainabilityScore: number; // A measure of how much the designer explored the 'why' (0-100)
  similarityScore?: number; // How similar the final decision is to the AI recommendation (0-100)
}

/**
 * Designer Confidence Delta (DCD)
 * Measures the shift in a designer's confidence before and after interacting with the system.
 */
export function computeDCD(confidenceBefore: number, confidenceAfter: number): number {
  return confidenceAfter - confidenceBefore;
}

export type DQIStage = "provisional" | "outcome-adjusted" | "validated";
export type DQIConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface DQIScore {
  value: number;
  stage: DQIStage;
  confidence: DQIConfidence;
  version: string;
}

/**
 * Decision Quality Index (DQI) - Workspace Phase
 * Measures evidence-backed decision quality, actively preventing "blind obedience" from being scored as success.
 * 
 * Weights for the Workspace phase:
 * - Evidence Utilization: 40% (evidenceUsed / Math.max(1, evidenceAvailable))
 * - Genome/Recommendation Confidence: 30% (how confident the system was in the baseline)
 * - Explainability / Deliberation: 30% (how much the designer explored the reasoning)
 */
export function computeWorkspaceDQI(inputs: WorkspaceDQIInputs): DQIScore {
  const {
    evidenceAvailable,
    evidenceUsed,
    confidenceScore,
    explainabilityScore,
  } = inputs;

  // 1. Evidence Score (0-100)
  // If there was no evidence available, we can't penalize them for not using it,
  // but it also means the decision wasn't strongly evidence-backed. We'll default to 50 in that edge case.
  let evidenceScore = 50;
  if (evidenceAvailable > 0) {
    const utilizationRatio = Math.min(1, evidenceUsed / evidenceAvailable);
    // Even using some evidence is good. Using all of it is 100.
    evidenceScore = utilizationRatio * 100;
  }

  // 2. Base calculation
  const weightedScore = 
    (evidenceScore * 0.40) +
    (confidenceScore * 0.30) +
    (explainabilityScore * 0.30);

  const value = Math.round(weightedScore * 10) / 10;
  
  // Determine confidence based on evidence volume
  let confidence: DQIConfidence = "LOW";
  if (evidenceAvailable >= 8 && evidenceUsed >= 3) {
    confidence = "HIGH";
  } else if (evidenceAvailable >= 4 && evidenceUsed >= 1) {
    confidence = "MEDIUM";
  }
  
  return {
    value,
    stage: "provisional",
    confidence,
    version: "1.0"
  };
}
