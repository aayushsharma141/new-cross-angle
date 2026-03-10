import { AestheticScores } from "@/types/discovery";

/**
 * PatternEngine — Rule-based behavioral pattern mapping.
 *
 * Maps score combinations to human-readable behavioral insights.
 * These patterns make the result feel "intelligent" without AI —
 * similar to how Myers-Briggs or StrengthsFinder interpret raw dimensions.
 */

export interface BehavioralPattern {
    name: string;
    description: string;
}

interface PatternRule {
    name: string;
    description: string;
    match: (s: AestheticScores) => boolean;
    priority: number; // higher = checked first
}

const PATTERN_RULES: PatternRule[] = [
    {
        name: "Emotional Expression",
        description: "You design emotionally. Your spaces carry personal stories, warmth, and a sense of lived-in character.",
        match: (s) => s.warmth >= 7 && s.novelty >= 6,
        priority: 10,
    },
    {
        name: "Controlled Simplicity",
        description: "You prefer precision. Clean lines, deliberate placement, and a sense of order give you peace.",
        match: (s) => s.minimalism >= 7 && s.structure >= 7,
        priority: 10,
    },
    {
        name: "Open Gathering",
        description: "Your spaces are designed for people. Welcoming, flexible, and alive with social energy.",
        match: (s) => s.social >= 7 && s.minimalism <= 5,
        priority: 9,
    },
    {
        name: "Private Comfort",
        description: "You need calm. Your ideal environment is a personal sanctuary — warm, quiet, and protective.",
        match: (s) => s.warmth >= 6 && s.social <= 4,
        priority: 9,
    },
    {
        name: "Curated Experimentation",
        description: "You balance boldness with order. Novel ideas within a structured framework feel most natural.",
        match: (s) => s.novelty >= 6 && s.structure >= 6,
        priority: 8,
    },
    {
        name: "Serene Minimalism",
        description: "Space and silence are your design tools. Less is genuinely more — every object must earn its place.",
        match: (s) => s.minimalism >= 7 && s.social <= 4 && s.warmth <= 5,
        priority: 8,
    },
    {
        name: "Warm Structure",
        description: "You want both comfort and organization. Natural materials within clean, ordered layouts.",
        match: (s) => s.warmth >= 6 && s.structure >= 6 && s.minimalism >= 5,
        priority: 7,
    },
    {
        name: "Bold Explorer",
        description: "Convention bores you. You're drawn to the unexpected — textures, colors, and layouts that surprise.",
        match: (s) => s.novelty >= 7 && s.minimalism <= 4,
        priority: 7,
    },
];

// Fallback when no rule matches
const DEFAULT_PATTERN: BehavioralPattern = {
    name: "Balanced Harmony",
    description: "Your design preferences are well-balanced — a blend of warmth, structure, and openness that adapts to your mood.",
};

/**
 * Returns the top matching behavioral patterns for the given scores.
 * Returns up to `maxPatterns` results, sorted by priority.
 */
export function getPatterns(scores: AestheticScores, maxPatterns = 2): BehavioralPattern[] {
    const matched = PATTERN_RULES
        .filter((rule) => rule.match(scores))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxPatterns)
        .map(({ name, description }) => ({ name, description }));

    return matched.length > 0 ? matched : [DEFAULT_PATTERN];
}

/**
 * Returns the single dominant pattern (highest-priority match).
 */
export function getDominantPattern(scores: AestheticScores): BehavioralPattern {
    return getPatterns(scores, 1)[0];
}
