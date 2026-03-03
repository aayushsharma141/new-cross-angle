import { AestheticScores, Archetype } from "@/types/discovery";

export const archetypes: Archetype[] = [
    {
        name: "The Quiet Curator",
        tagline: "You prefer calm, simple, and thoughtfully arranged spaces. Every object earns its place through meaning, not trend. Peace and clarity are at the heart of your home.",
        traits: ["Intentional", "Restrained", "Thoughtful", "Peaceful"],
        materialBias: "Stone & Linen",
        strategy: "Embrace negative space as a design element — less is always more. Use soft, natural lighting and a few carefully chosen objects. Gallery-style display and calm, neutral tones will feel most like home.",
        match: (s) => s.minimalism + (10 - s.social) + s.structure + (5 - s.novelty),
    },
    {
        name: "The Social Minimalist",
        tagline: "You like clean, open spaces that are easy to move through and welcoming for others. Your home is both simple and warm — a place where people feel comfortable gathering.",
        traits: ["Open", "Welcoming", "Effortless", "Adaptable"],
        materialBias: "Linen & Timber",
        strategy: "Design flexible zones that shift easily from quiet time to social gatherings. Use warm lighting, open layouts, and modular furniture that invites people in without feeling cluttered.",
        match: (s) => s.social + s.minimalism + (10 - s.structure) + s.novelty,
    },
    {
        name: "The Warm Modernist",
        tagline: "You enjoy modern, structured design but also want your space to feel warm and comfortable. You balance clean lines with natural materials and soft textures.",
        traits: ["Balanced", "Grounded", "Refined", "Comfortable"],
        materialBias: "Timber & Stone",
        strategy: "Layer natural materials — wood, stone, linen — over clean, modern layouts. Use diffused, indirect lighting and tactile textiles to add warmth without losing the sense of order.",
        match: (s) => s.warmth + s.structure + s.minimalism + (5 - s.novelty),
    },
    {
        name: "The Expressive Collector",
        tagline: "You love spaces full of personality, color, and meaningful objects. Your home tells the story of your life — bold, layered, and full of character.",
        traits: ["Bold", "Expressive", "Warm", "Story-driven"],
        materialBias: "Mixed Textures",
        strategy: "Arrange collections and personal items in gallery-style displays. Use layered lighting — ambient, accent, and task — to highlight what you love. Don't be afraid of color, contrast, and mixing old with new.",
        match: (s) => s.warmth + s.social + (10 - s.minimalism) + s.novelty,
    },
];

export function getArchetype(scores: AestheticScores): Archetype {
    let best = archetypes[0];
    let bestScore = -Infinity;
    for (const a of archetypes) {
        const s = a.match(scores);
        if (s > bestScore) {
            bestScore = s;
            best = a;
        }
    }
    return best;
}
