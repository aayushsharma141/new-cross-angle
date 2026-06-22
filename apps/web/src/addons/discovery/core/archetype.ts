import { AestheticScores, Archetype } from "@/types/discovery";

export const archetypes: Archetype[] = [
    {
        name: "The Quiet Curator",
        tagline: "You prefer calm, simple, and thoughtfully arranged spaces. Every object earns its place through meaning, not trend. Peace and clarity are at the heart of your home.",
        traits: ["Intentional", "Restrained", "Thoughtful", "Peaceful"],
        materialBias: "Stone & Linen",
        strategy: "Embrace negative space as a design element — less is always more. Use soft, natural lighting and a few carefully chosen objects. Gallery-style display and calm, neutral tones will feel most like home.",
        match: (s) => s.minimalism * 1.5 + (10 - s.social) + s.structure + (5 - s.novelty),
    },
    {
        name: "The Social Minimalist",
        tagline: "You like clean, open spaces that are easy to move through and welcoming for others. Your home is both simple and warm — a place where people feel comfortable gathering.",
        traits: ["Open", "Welcoming", "Effortless", "Adaptable"],
        materialBias: "Linen & Timber",
        strategy: "Design flexible zones that shift easily from quiet time to social gatherings. Use warm lighting, open layouts, and modular furniture that invites people in without feeling cluttered.",
        match: (s) => s.social * 1.4 + s.minimalism + (10 - s.structure) + s.warmth * 0.5,
    },
    {
        name: "The Warm Modernist",
        tagline: "You enjoy modern, structured design but also want your space to feel warm and comfortable. You balance clean lines with natural materials and soft textures.",
        traits: ["Balanced", "Grounded", "Refined", "Comfortable"],
        materialBias: "Timber & Stone",
        strategy: "Layer natural materials — wood, stone, linen — over clean, modern layouts. Use diffused, indirect lighting and tactile textiles to add warmth without losing the sense of order.",
        match: (s) => s.warmth * 1.3 + s.structure + s.minimalism * 0.8 + (5 - s.novelty),
    },
    {
        name: "The Expressive Collector",
        tagline: "You love spaces full of personality, color, and meaningful objects. Your home tells the story of your life — bold, layered, and full of character.",
        traits: ["Bold", "Expressive", "Warm", "Story-driven"],
        materialBias: "Mixed Textures",
        strategy: "Arrange collections and personal items in gallery-style displays. Use layered lighting — ambient, accent, and task — to highlight what you love. Don't be afraid of color, contrast, and mixing old with new.",
        match: (s) => s.warmth + s.social + (10 - s.minimalism) * 1.3 + s.novelty,
    },
    {
        name: "The Serene Naturalist",
        tagline: "You are drawn to spaces that feel like an extension of the natural world — earthy, grounded, and deeply calming. Organic forms and raw materials speak to your soul.",
        traits: ["Earthy", "Organic", "Calm", "Grounded"],
        materialBias: "Raw Wood & Clay",
        strategy: "Bring the outside in with natural light, indoor plants, and raw organic materials. Favour earth tones, handmade ceramics, and furniture with visible grain. Let imperfection be the beauty.",
        match: (s) => s.warmth * 1.5 + s.minimalism * 0.8 + (10 - s.novelty) + (8 - s.social) * 0.6,
    },
    {
        name: "The Bold Structuralist",
        tagline: "You crave architectural precision and dramatic spatial composition. Your spaces are statements — deliberate, powerful, and unapologetically modern.",
        traits: ["Architectural", "Dramatic", "Precise", "Commanding"],
        materialBias: "Concrete & Metal",
        strategy: "Use strong geometric forms, high-contrast material pairings, and dramatic lighting to create impact. Think monolithic furniture, cantilevered shelving, and bold negative space as a power move.",
        match: (s) => s.structure * 1.6 + s.novelty + (10 - s.warmth) * 0.8 + s.minimalism * 0.5,
    },
    {
        name: "The Intimate Storyteller",
        tagline: "Your home is a living memoir — every corner holds a memory, every object has a story. Warmth, connection, and personal narrative define your space.",
        traits: ["Nostalgic", "Layered", "Personal", "Inviting"],
        materialBias: "Vintage Textiles & Brass",
        strategy: "Create intimate vignettes with personal objects, family heirlooms, and travel finds. Use warm ambient lighting, rich textiles, and a mix of eras. Your space should feel like a conversation, not a showroom.",
        match: (s) => s.warmth * 1.2 + s.social * 1.2 + s.novelty * 0.8 + (10 - s.minimalism) * 0.8,
    },
    {
        name: "The Refined Classicist",
        tagline: "You value timeless elegance and proven proportions. Your spaces honour tradition while feeling fresh — symmetry, quality materials, and quiet luxury define your taste.",
        traits: ["Timeless", "Elegant", "Symmetrical", "Luxurious"],
        materialBias: "Marble & Hardwood",
        strategy: "Invest in quality over quantity. Use classical proportions, symmetrical arrangements, and rich materials like marble, walnut, and silk. Avoid trends — choose pieces that will look right in 20 years.",
        match: (s) => s.structure * 1.3 + (10 - s.novelty) * 1.2 + s.warmth * 0.6 + s.minimalism * 0.5,
    },
    {
        name: "The Fluid Experimentalist",
        tagline: "You see your home as a living laboratory — always evolving, always surprising. Rules are starting points, not endpoints. You thrive on the unexpected.",
        traits: ["Experimental", "Dynamic", "Curious", "Unconventional"],
        materialBias: "Resin & Recycled Materials",
        strategy: "Embrace modular, reconfigurable spaces. Mix unexpected materials, play with scale, and rotate art frequently. Your home should surprise even you. Think gallery meets workshop meets sanctuary.",
        match: (s) => s.novelty * 1.8 + (10 - s.structure) + s.social * 0.5 + (8 - s.minimalism) * 0.4,
    },
    {
        name: "The Grounded Pragmatist",
        tagline: "You believe great design serves life, not the other way around. Your spaces are functional, comfortable, and quietly beautiful — no fuss, no pretence, just thoughtful living.",
        traits: ["Practical", "Comfortable", "Honest", "Unpretentious"],
        materialBias: "Solid Wood & Cotton",
        strategy: "Prioritise comfort and function in every decision. Choose durable, honest materials that age well. Keep layouts intuitive and storage generous. Beauty emerges from things working perfectly.",
        match: (s) => {
            // Rewards balanced, moderate scores — penalises extremes
            const balance = 10 - (Math.abs(s.minimalism - 5) + Math.abs(s.warmth - 5) + Math.abs(s.social - 5) + Math.abs(s.structure - 5) + Math.abs(s.novelty - 5)) * 0.4;
            return balance + s.warmth * 0.5 + s.structure * 0.5;
        },
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
