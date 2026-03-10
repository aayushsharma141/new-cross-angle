import { AestheticScores } from "@/types/discovery";

/**
 * SignalLayers — Separates raw inputs into four signal layers.
 *
 * Phase 1: Type definitions + stub combiner (pass-through).
 * Phase 2: Weighted combination across layers for more stable results.
 *
 * Future formula:
 *   finalWarmth = behavior.warmth * 0.4 + visual.warmth * 0.3
 *               + material.warmth * 0.2 + lighting.warmth * 0.1
 */

export interface SignalLayer {
    warmth: number;
    minimalism: number;
    social: number;
    structure: number;
    novelty: number;
}

export interface SignalLayers {
    behavior: SignalLayer;
    visual: SignalLayer;
    material: SignalLayer;
    lighting: SignalLayer;
}

const EMPTY_LAYER: SignalLayer = {
    warmth: 0,
    minimalism: 0,
    social: 0,
    structure: 0,
    novelty: 0,
};

export function createEmptyLayers(): SignalLayers {
    return {
        behavior: { ...EMPTY_LAYER },
        visual: { ...EMPTY_LAYER },
        material: { ...EMPTY_LAYER },
        lighting: { ...EMPTY_LAYER },
    };
}

/**
 * Phase 2 weights — how much each layer contributes to the final score.
 * Not used in Phase 1 (stub passes through existing addScores flow).
 */
export const LAYER_WEIGHTS = {
    behavior: 0.4,
    visual: 0.3,
    material: 0.2,
    lighting: 0.1,
} as const;

/**
 * Combines signal layers into final AestheticScores using weighted averages.
 *
 * Phase 1 stub: returns existing scores unchanged. This function exists
 * so the interface is ready for Phase 2 integration without refactoring.
 */
export function combineSignalLayers(
    layers: SignalLayers,
    existingScores: AestheticScores,
): AestheticScores {
    // Phase 1: pass-through — scoring still uses addScores() directly.
    // Phase 2 will replace this with the weighted combination formula.
    return existingScores;
}
