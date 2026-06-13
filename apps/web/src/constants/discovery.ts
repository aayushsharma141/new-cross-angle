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

export const TOTAL_STAGES = 16;

export const ADJECTIVE_OPTIONS = [
  "Calm", "Structured", "Bold", "Playful", "Elegant",
  "Moody", "Warm", "Minimal", "Eclectic", "Soft",
  "Grounded", "Luxurious", "Organic", "Modern", "Timeless",
];

const REFLECTION_PROMPTS = [
  "Where do you feel most at peace?",
  "Do you gravitate toward warmth or minimalism?",
  "Do you feel energized by boldness or calmness?",
];

export const lifestyleQuestions: LifestyleQuestion[] = [
  {
    question: "How do you prefer to begin your mornings?",
    options: [
      { label: "Slow Morning", description: "Slowly, in silence, with natural light", image: lifestyle1, assetKey: "discovery_lifestyle-1", scores: { warmth: 2, minimalism: 1, novelty: 0 } },
      { label: "Active Morning", description: "With movement — workout or stretching", image: lifestyle2, assetKey: "discovery_lifestyle-2", scores: { social: 1, structure: 2, novelty: 1 } },
      { label: "Productive Morning", description: "Immediately productive, diving into work", image: lifestyle3, assetKey: "discovery_lifestyle-3", scores: { structure: 3, minimalism: 2, warmth: -1 } },
      { label: "Social Morning", description: "Surrounded by family or conversation", image: lifestyle4, assetKey: "discovery_lifestyle-4", scores: { social: 3, warmth: 1, structure: -1 } },
    ],
  },
  {
    question: "What kind of morning environment feels right to you?",
    options: [
      { label: "Natural Environment", description: "Fresh breeze, warm nature", image: lifestyle5, assetKey: "discovery_lifestyle-5", scores: { minimalism: 2, social: -1, novelty: 0 } },
      { label: "Clean Environment", description: "Clean, clutter-free", image: lifestyle6, assetKey: "discovery_lifestyle-6", scores: { social: 3, warmth: 2, novelty: 2 } },
      { label: "Analog Environment", description: "Warm, analog, accompanied by music", image: lifestyle7, assetKey: "discovery_lifestyle-7", scores: { warmth: 3, structure: 1, social: -1 } },
      { label: "Lively Environment", description: "Bustling, lively, focused on people", image: lifestyle8, assetKey: "discovery_lifestyle-8", scores: { novelty: 2, minimalism: 1, structure: 1 } },
    ],
  },
];

export const visualImages: VisualImage[] = [
  { id: 1, url: visual1, assetKey: "discovery_visual-1", tags: { minimalism: 3, structure: 2, novelty: 1 } },
  { id: 2, url: visual2, assetKey: "discovery_visual-2", tags: { warmth: 3, social: 1, novelty: 2 } },
  { id: 3, url: visual3, assetKey: "discovery_visual-3", tags: { warmth: 2, minimalism: 2, novelty: 1 } },
  { id: 4, url: visual4, assetKey: "discovery_visual-4", tags: { minimalism: 3, structure: 3, novelty: 0 } },
  { id: 5, url: visual5, assetKey: "discovery_visual-5", tags: { warmth: 1, structure: 2, novelty: 2 } },
  { id: 6, url: visual6, assetKey: "discovery_visual-6", tags: { minimalism: 1, warmth: 3, novelty: 2 } },
  { id: 7, url: visual7, assetKey: "discovery_visual-7", tags: { social: 2, structure: 1, novelty: 1 } },
  { id: 8, url: visual8, assetKey: "discovery_visual-8", tags: { social: 3, warmth: 2, novelty: 2 } },
  { id: 9, url: visual9, assetKey: "discovery_visual-9", tags: { minimalism: 2, warmth: 1, novelty: 1 } },
  // Interiors - Scandinavian
  { id: 10, url: visual10, assetKey: "discovery_visual-10", tags: { minimalism: 3, structure: 2, warmth: 1, novelty: 0 } },
  // Interiors - Industrial
  { id: 11, url: visual11, assetKey: "discovery_visual-11", tags: { structure: 3, warmth: 2, social: 1, novelty: 2 } },
  // Textures - Luxe Velvet
  { id: 12, url: visual12, assetKey: "discovery_visual-12", tags: { warmth: 1, social: 0, minimalism: 0, novelty: 3 } },
  // Interiors - Warm Earthy
  { id: 13, url: visual13, assetKey: "discovery_visual-13", tags: { warmth: 3, social: 2, structure: 1, novelty: 1 } },
  // Architecture - Modern Geometric
  { id: 14, url: visual14, assetKey: "discovery_visual-14", tags: { minimalism: 3, structure: 3, warmth: 0, novelty: 2 } },
  // Textures - Natural Linen
  { id: 15, url: visual15, assetKey: "discovery_visual-15", tags: { minimalism: 2, warmth: 2, structure: 1, novelty: 0 } },
  // Interiors - Bohemian Eclectic
  { id: 16, url: visual16, assetKey: "discovery_visual-16", tags: { warmth: 3, social: 2, minimalism: -1, novelty: 3 } },
  // Textures - Industrial Concrete
  { id: 17, url: visual17, assetKey: "discovery_visual-17", tags: { minimalism: 2, structure: 2, warmth: 0, novelty: 1 } },
  // Nature - Zen Garden
  { id: 18, url: visual18, assetKey: "discovery_visual-18", tags: { minimalism: 2, warmth: 1, structure: 2, novelty: 1 } },
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


