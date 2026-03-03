import { AestheticScores } from "@/types/discovery";

export const ADJECTIVE_WEIGHTS: Record<string, Partial<AestheticScores>> = {
    Calm: { warmth: 1, social: -1 },
    Structured: { structure: 2 },
    Bold: { social: 1, minimalism: -1 },
    Playful: { social: 1, warmth: 1 },
    Elegant: { structure: 1, minimalism: 1 },
    Moody: { warmth: -1, minimalism: 1 },
    Warm: { warmth: 2 },
    Minimal: { minimalism: 2 },
    Eclectic: { minimalism: -2, social: 1 },
    Soft: { warmth: 1, structure: -1 },
    Grounded: { warmth: 1, structure: 1 },
    Luxurious: { structure: 1, warmth: 1 },
    Organic: { warmth: 2, minimalism: -1 },
    Modern: { minimalism: 1, structure: 1 },
    Timeless: { structure: 2, minimalism: 1 },
};

export const SLIDER_WEIGHTS = [
    { key: "warmth" as keyof AestheticScores, invert: false },
    { key: "social" as keyof AestheticScores, invert: false },
    { key: "minimalism" as keyof AestheticScores, invert: true },
    { key: "structure" as keyof AestheticScores, invert: false },
];

export const MATERIAL_WEIGHTS: Record<string, Partial<AestheticScores>> = {
    "Brushed Concrete": { minimalism: 3, warmth: -1, novelty: 1 },
    "Warm Timber": { warmth: 3, structure: 1, novelty: 0 },
    "Polished Stone": { structure: 3, minimalism: 1, novelty: 0 },
    "Woven Linen": { warmth: 2, social: 1, novelty: 0 },
    "Matte Metal": { minimalism: 2, structure: 2, novelty: 2 },
};

export const LIGHT_WEIGHTS: Record<string, Partial<AestheticScores>> = {
    "Golden Hour": { warmth: 3, social: 1, novelty: 0 },
    "Cool Daylight": { minimalism: 2, structure: 1, novelty: 1 },
    "Soft Candlelight": { warmth: 2, social: -1, novelty: 0 },
    "Dramatic Spotlight": { structure: 2, minimalism: -1, novelty: 3 },
};

export const LIFESTYLE_WEIGHTS: Record<number, Record<number, Partial<AestheticScores>>> = {
    0: {
        0: { warmth: 2, minimalism: 1, novelty: 0 },
        1: { social: 1, structure: 2, novelty: 1 },
        2: { structure: 3, minimalism: 2, warmth: -1 },
        3: { social: 3, warmth: 1, structure: -1 },
    },
    1: {
        0: { minimalism: 2, social: -1, novelty: 0 },
        1: { social: 3, warmth: 2, novelty: 2 },
        2: { warmth: 3, structure: 1, social: -1 },
        3: { novelty: 2, minimalism: 1, structure: 1 },
    }
};

export const VISUAL_WEIGHTS: Record<number, Partial<AestheticScores>> = {
    1: { minimalism: 3, structure: 2, novelty: 1 },
    2: { warmth: 3, social: 1, novelty: 2 },
    3: { warmth: 2, minimalism: 2, novelty: 1 },
    4: { minimalism: 3, structure: 3, novelty: 0 },
    5: { warmth: 1, structure: 2, novelty: 2 },
    6: { minimalism: 1, warmth: 3, novelty: 2 },
    7: { social: 2, structure: 1, novelty: 1 },
    8: { social: 3, warmth: 2, novelty: 2 },
    9: { minimalism: 2, warmth: 1, novelty: 1 },
    10: { minimalism: 3, structure: 2, warmth: 1, novelty: 0 },
    11: { structure: 3, warmth: 2, social: 1, novelty: 2 },
    12: { warmth: 1, social: 0, minimalism: 0, novelty: 3 },
    13: { warmth: 3, social: 2, structure: 1, novelty: 1 },
    14: { minimalism: 3, structure: 3, warmth: 0, novelty: 2 },
    15: { minimalism: 2, warmth: 2, structure: 1, novelty: 0 },
    16: { warmth: 3, social: 2, minimalism: -1, novelty: 3 },
    17: { minimalism: 2, structure: 2, warmth: 0, novelty: 1 },
    18: { minimalism: 2, warmth: 1, structure: 2, novelty: 1 },
};
