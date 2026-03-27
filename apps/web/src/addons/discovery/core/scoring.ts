import { AestheticScores } from "@/types/discovery";
import {
    ADJECTIVE_WEIGHTS,
    MATERIAL_WEIGHTS,
    LIGHT_WEIGHTS,
} from "./weights";

export const initialScores: AestheticScores = {
    minimalism: 5, warmth: 5, social: 5, structure: 5, novelty: 5,
};

export function addScores(current: AestheticScores, partial: Partial<AestheticScores>): AestheticScores {
    const next = { ...current };
    for (const [k, v] of Object.entries(partial)) {
        if (typeof v === "number") {
            const key = k as keyof AestheticScores;
            next[key] = Math.max(0, Math.min(10, next[key] + v));
        }
    }
    return next;
}

/**
 * Central signal map — maps named signal keys to score deltas.
 * Consolidates weights that were previously scattered across components.
 *
 * Usage: const newScores = applySignal(scores, "material_warm_timber");
 */
const SIGNAL_MAP: Record<string, Partial<AestheticScores>> = {
    // Adjective signals
    ...Object.fromEntries(
        Object.entries(ADJECTIVE_WEIGHTS).map(([k, v]) => [`adj_${k.toLowerCase()}`, v])
    ),
    // Material signals
    ...Object.fromEntries(
        Object.entries(MATERIAL_WEIGHTS).map(([k, v]) => [`material_${k.toLowerCase().replace(/\s+/g, "_")}`, v])
    ),
    // Lighting signals
    ...Object.fromEntries(
        Object.entries(LIGHT_WEIGHTS).map(([k, v]) => [`light_${k.toLowerCase().replace(/\s+/g, "_")}`, v])
    ),
};

/**
 * Apply a named signal to the current scores.
 * Returns new scores (immutable). Falls back to unchanged scores
 * if the signal key is unknown.
 */
function applySignal(current: AestheticScores, signal: string): AestheticScores {
    const weights = SIGNAL_MAP[signal];
    if (!weights) {
        console.warn(`[scoring] Unknown signal key: "${signal}"`);
        return current;
    }
    return addScores(current, weights);
}
