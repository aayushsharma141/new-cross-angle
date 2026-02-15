import { LifestyleQuestion, MaterialOption, Archetype, VisualImage, AestheticScores } from "@/types/discovery";
import visual1 from "@/assets/discovery/visual-1.jpg";
import visual2 from "@/assets/discovery/visual-2.jpg";
import visual3 from "@/assets/discovery/visual-3.jpg";
import visual4 from "@/assets/discovery/visual-4.jpg";
import visual5 from "@/assets/discovery/visual-5.jpg";
import visual6 from "@/assets/discovery/visual-6.jpg";
import visual7 from "@/assets/discovery/visual-7.jpg";
import visual8 from "@/assets/discovery/visual-8.jpg";
import visual9 from "@/assets/discovery/visual-9.jpg";
import visual10 from "@/assets/discovery/visual-10.jpg";
import visual11 from "@/assets/discovery/visual-11.jpg";
import visual12 from "@/assets/discovery/visual-12.jpg";
import visual13 from "@/assets/discovery/visual-13.jpg";
import visual14 from "@/assets/discovery/visual-14.jpg";
import visual15 from "@/assets/discovery/visual-15.jpg";
import visual16 from "@/assets/discovery/visual-16.jpg";
import visual17 from "@/assets/discovery/visual-17.jpg";
import visual18 from "@/assets/discovery/visual-18.jpg";
import lifestyle1 from "@/assets/discovery/lifestyle-1.jpg";
import lifestyle2 from "@/assets/discovery/lifestyle-2.jpg";
import lifestyle3 from "@/assets/discovery/lifestyle-3.jpg";
import lifestyle4 from "@/assets/discovery/lifestyle-4.jpg";
import lifestyle5 from "@/assets/discovery/lifestyle-5.jpg";
import lifestyle6 from "@/assets/discovery/lifestyle-6.jpg";
import lifestyle7 from "@/assets/discovery/lifestyle-7.jpg";
import lifestyle8 from "@/assets/discovery/lifestyle-8.jpg";
import lifestyle9 from "@/assets/discovery/lifestyle-9.jpg";

export const TOTAL_STAGES = 8;

export const ADJECTIVE_OPTIONS = [
  "Calm", "Structured", "Bold", "Playful", "Elegant",
  "Moody", "Warm", "Minimal", "Eclectic", "Soft",
  "Grounded", "Luxurious", "Organic", "Modern", "Timeless",
];

export const REFLECTION_PROMPTS = [
  "Where do you feel most at peace?",
  "Do you gravitate toward warmth or minimalism?",
  "Do you feel energized by boldness or calmness?",
];

export const lifestyleQuestions: LifestyleQuestion[] = [
  {
    question: "How do you prefer to spend your evenings?",
    options: [
      { label: "Solitary, with a book", image: lifestyle1, scores: { minimalism: 2, social: -2, novelty: 0 } },
      { label: "Hosting a dinner party", image: lifestyle2, scores: { social: 3, warmth: 1, novelty: 2 } },
      { label: "Focused creative work", image: lifestyle3, scores: { structure: 1, minimalism: 1, novelty: 1 } },
    ],
  },
  {
    question: "What feeling should your home evoke first?",
    options: [
      { label: "Calm retreat", image: lifestyle4, scores: { minimalism: 2, warmth: 1, novelty: 0 } },
      { label: "Energetic gathering", image: lifestyle5, scores: { social: 3, warmth: 2, novelty: 2 } },
      { label: "Curated gallery", image: lifestyle6, scores: { structure: 2, minimalism: -1, novelty: 3 } },
    ],
  },
  {
    question: "Your ideal weekend morning?",
    options: [
      { label: "Slow coffee ritual", image: lifestyle7, scores: { warmth: 2, minimalism: 1, novelty: 0 } },
      { label: "Active and outdoors", image: lifestyle8, scores: { social: 1, structure: -1, novelty: 2 } },
      { label: "Organizing and planning", image: lifestyle9, scores: { structure: 3, minimalism: 1, novelty: -1 } },
    ],
  },
];

export const visualImages: VisualImage[] = [
  { id: 1, url: visual1, tags: { minimalism: 3, structure: 2, novelty: 1 } },
  { id: 2, url: visual2, tags: { warmth: 3, social: 1, novelty: 2 } },
  { id: 3, url: visual3, tags: { warmth: 2, minimalism: 2, novelty: 1 } },
  { id: 4, url: visual4, tags: { minimalism: 3, structure: 3, novelty: 0 } },
  { id: 5, url: visual5, tags: { warmth: 1, structure: 2, novelty: 2 } },
  { id: 6, url: visual6, tags: { minimalism: 1, warmth: 3, novelty: 2 } },
  { id: 7, url: visual7, tags: { social: 2, structure: 1, novelty: 1 } },
  { id: 8, url: visual8, tags: { social: 3, warmth: 2, novelty: 2 } },
  { id: 9, url: visual9, tags: { minimalism: 2, warmth: 1, novelty: 1 } },
  // Interiors - Scandinavian
  { id: 10, url: visual10, tags: { minimalism: 3, structure: 2, warmth: 1, novelty: 0 } },
  // Interiors - Industrial
  { id: 11, url: visual11, tags: { structure: 3, warmth: 2, social: 1, novelty: 2 } },
  // Textures - Luxe Velvet
  { id: 12, url: visual12, tags: { warmth: 1, social: 0, minimalism: 0, novelty: 3 } },
  // Interiors - Warm Earthy
  { id: 13, url: visual13, tags: { warmth: 3, social: 2, structure: 1, novelty: 1 } },
  // Architecture - Modern Geometric
  { id: 14, url: visual14, tags: { minimalism: 3, structure: 3, warmth: 0, novelty: 2 } },
  // Textures - Natural Linen
  { id: 15, url: visual15, tags: { minimalism: 2, warmth: 2, structure: 1, novelty: 0 } },
  // Interiors - Bohemian Eclectic
  { id: 16, url: visual16, tags: { warmth: 3, social: 2, minimalism: -1, novelty: 3 } },
  // Textures - Industrial Concrete
  { id: 17, url: visual17, tags: { minimalism: 2, structure: 2, warmth: 0, novelty: 1 } },
  // Nature - Zen Garden
  { id: 18, url: visual18, tags: { minimalism: 2, warmth: 1, structure: 2, novelty: 1 } },
];

export const materialOptions: MaterialOption[] = [
  { name: "Brushed Concrete", description: "Raw, honest, urban texture.", color: "hsl(0 0% 75%)", scores: { minimalism: 3, warmth: -1, novelty: 1 } },
  { name: "Warm Timber", description: "Organic, grounded, living texture.", color: "hsl(30 60% 40%)", scores: { warmth: 3, structure: 1, novelty: 0 } },
  { name: "Polished Stone", description: "Refined, enduring, quiet strength.", color: "hsl(30 5% 65%)", scores: { structure: 3, minimalism: 1, novelty: 0 } },
  { name: "Woven Linen", description: "Soft, layered, human warmth.", color: "hsl(40 20% 88%)", scores: { warmth: 2, social: 1, novelty: 0 } },
  { name: "Matte Metal", description: "Precise, modern, understated edge.", color: "hsl(210 5% 55%)", scores: { minimalism: 2, structure: 2, novelty: 2 } },
];

export const lightOptions = [
  { name: "Golden Hour", description: "Warm, sentimental, relaxing.", bgColor: "hsl(45 80% 90%)", scores: { warmth: 3, social: 1, novelty: 0 } },
  { name: "Cool Daylight", description: "Crisp, focused, energizing.", bgColor: "hsl(200 30% 92%)", scores: { minimalism: 2, structure: 1, novelty: 1 } },
  { name: "Soft Candlelight", description: "Intimate, protective, slow.", bgColor: "hsl(30 50% 85%)", scores: { warmth: 2, social: -1, novelty: 0 } },
  { name: "Dramatic Spotlight", description: "Theatrical, curated, bold.", bgColor: "hsl(0 0% 20%)", scores: { structure: 2, minimalism: -1, novelty: 3 } },
];

export const archetypes: Archetype[] = [
  {
    name: "The Quiet Curator",
    tagline: "Your space is a sanctuary of carefully chosen stillness. Every object earns its place through meaning, not trend.",
    traits: ["Intentional", "Restrained", "Thoughtful"],
    materialBias: "Stone",
    strategy: "Use gallery walls and directional spot lighting to highlight your unique pieces. Embrace negative space as a design element.",
    match: (s) => s.minimalism + (10 - s.social) + s.structure + (5 - s.novelty),
  },
  {
    name: "The Social Minimalist",
    tagline: "You create spaces that breathe — open, welcoming, and effortlessly elegant for gathering.",
    traits: ["Open", "Warm", "Effortless"],
    materialBias: "Linen",
    strategy: "Design flexible zones that transition from intimate to communal. Use warm lighting and modular furniture.",
    match: (s) => s.social + s.minimalism + (10 - s.structure) + s.novelty,
  },
  {
    name: "The Warm Modernist",
    tagline: "You blend clean architecture with organic warmth. Structure meets soul in your space.",
    traits: ["Balanced", "Grounded", "Refined"],
    materialBias: "Wood",
    strategy: "Layer natural materials over structured layouts. Diffused lighting and tactile textiles bring your spaces to life.",
    match: (s) => s.warmth + s.structure + s.minimalism + (5 - s.novelty),
  },
  {
    name: "The Expressive Collector",
    tagline: "Your home is a canvas for your life. You embrace layers, memories, and bold statements over perfect symmetry.",
    traits: ["Bold", "Sentimental", "Dynamic"],
    materialBias: "Wood",
    strategy: "Use gallery walls and directional spot lighting to highlight your unique pieces.",
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
