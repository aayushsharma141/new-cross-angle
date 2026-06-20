import { AestheticScores } from "@/types/discovery";

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


