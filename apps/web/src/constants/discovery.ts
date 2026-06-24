import { MaterialOption, VisualImage } from "@/types/discovery";
export const TOTAL_STAGES = 16;

export const ADJECTIVE_OPTIONS = [
  "Calm", "Structured", "Bold", "Playful", "Elegant",
  "Moody", "Warm", "Minimal", "Eclectic", "Soft",
  "Grounded", "Luxurious", "Organic", "Modern", "Timeless",
];


export const visualImages: VisualImage[] = [
  { id: 1, url: "", assetKey: "discovery_visual-1", tags: { minimalism: 3, structure: 2, novelty: 1 } },
  { id: 2, url: "", assetKey: "discovery_visual-2", tags: { warmth: 3, social: 1, novelty: 2 } },
  { id: 3, url: "", assetKey: "discovery_visual-3", tags: { warmth: 2, minimalism: 2, novelty: 1 } },
  { id: 4, url: "", assetKey: "discovery_visual-4", tags: { minimalism: 3, structure: 3, novelty: 0 } },
  { id: 5, url: "", assetKey: "discovery_visual-5", tags: { warmth: 1, structure: 2, novelty: 2 } },
  { id: 6, url: "", assetKey: "discovery_visual-6", tags: { minimalism: 1, warmth: 3, novelty: 2 } },
  { id: 7, url: "", assetKey: "discovery_visual-7", tags: { social: 2, structure: 1, novelty: 1 } },
  { id: 8, url: "", assetKey: "discovery_visual-8", tags: { social: 3, warmth: 2, novelty: 2 } },
  { id: 9, url: "", assetKey: "discovery_visual-9", tags: { minimalism: 2, warmth: 1, novelty: 1 } },
  // Interiors - Scandinavian
  { id: 10, url: "", assetKey: "discovery_visual-10", tags: { minimalism: 3, structure: 2, warmth: 1, novelty: 0 } },
  // Interiors - Industrial
  { id: 11, url: "", assetKey: "discovery_visual-11", tags: { structure: 3, warmth: 2, social: 1, novelty: 2 } },
  // Textures - Luxe Velvet
  { id: 12, url: "", assetKey: "discovery_visual-12", tags: { warmth: 1, social: 0, minimalism: 0, novelty: 3 } },
  // Interiors - Warm Earthy
  { id: 13, url: "", assetKey: "discovery_visual-13", tags: { warmth: 3, social: 2, structure: 1, novelty: 1 } },
  // Architecture - Modern Geometric
  { id: 14, url: "", assetKey: "discovery_visual-14", tags: { minimalism: 3, structure: 3, warmth: 0, novelty: 2 } },
  // Textures - Natural Linen
  { id: 15, url: "", assetKey: "discovery_visual-15", tags: { minimalism: 2, warmth: 2, structure: 1, novelty: 0 } },
  // Interiors - Bohemian Eclectic
  { id: 16, url: "", assetKey: "discovery_visual-16", tags: { warmth: 3, social: 2, minimalism: -1, novelty: 3 } },
  // Textures - Industrial Concrete
  { id: 17, url: "", assetKey: "discovery_visual-17", tags: { minimalism: 2, structure: 2, warmth: 0, novelty: 1 } },
  // Nature - Zen Garden
  { id: 18, url: "", assetKey: "discovery_visual-18", tags: { minimalism: 2, warmth: 1, structure: 2, novelty: 1 } },
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

export const DESIGN_LANGUAGES = [
  { name: "Modern Indian", desc: "Contemporary with Indian warmth" },
  { name: "Contemporary", desc: "Clean, current, timeless" },
  { name: "Minimal", desc: "Less is more, breathing space" },
  { name: "Luxury Modern", desc: "Premium materials, statement pieces" },
  { name: "Warm Earthy", desc: "Natural tones, organic textures" },
  { name: "Japandi", desc: "Japanese minimalism + Scandinavian warmth" },
  { name: "Industrial", desc: "Raw materials, urban edge" },
  { name: "Traditional Indian", desc: "Heritage, carved wood, rich colors" },
  { name: "Hotel Luxury", desc: "Polished, curated, impressive" },
  { name: "Modern Royal", desc: "Grand but not old-fashioned" },
];

export const COLOR_MOODS = [
  { name: "Warm beige", color: "#d6c9b3" },
  { name: "White minimal", color: "#f4f4f2", border: true },
  { name: "Dark moody", color: "#2a2a2a" },
  { name: "Earthy clay", color: "#b05e3b" },
  { name: "Wood-heavy", color: "#8c7023" },
  { name: "Black luxury", color: "#101010" },
  { name: "Neutral luxury", color: "#c8bead" },
  { name: "Bold colors", color: "#8a1a41" },
  { name: "Pastel calm", color: "#c3d8cd" },
];

export const DISLIKE_COLORS = ["White", "Black", "Beige", "Grey", "Pink", "Yellow", "Red", "Blue"];
