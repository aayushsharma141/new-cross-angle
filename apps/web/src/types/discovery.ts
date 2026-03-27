export enum Stage {
  Welcome = 0,
  Reflection = 1,
  Lifestyle = 2,
  VisualInstinct = 3,
  AdjectiveSelection = 4,
  EmotionalMapping = 5,
  MaterialResonance = 6,
  LightCalibration = 7,
  PatternPreview = 8,
  Analysis = 9,
  MiniResult = 10,
  LeadCapture = 11,
  Results = 12,
}

export interface LifestyleOption {
  label: string;
  description: string;
  image: string;
  scores: Partial<AestheticScores>;
}

export interface LifestyleQuestion {
  question: string;
  options: LifestyleOption[];
}

export interface AestheticScores {
  minimalism: number;
  warmth: number;
  social: number;
  structure: number;
  novelty: number;
}

export interface MaterialOption {
  name: string;
  description: string;
  color: string;
  scores: Partial<AestheticScores>;
}

interface LightOption {
  name: string;
  description: string;
  bgColor: string;
  icons: string[];
}

export interface Archetype {
  name: string;
  tagline: string;
  traits: string[];
  materialBias: string;
  strategy: string;
  match: (scores: AestheticScores) => number;
}

export interface VisualImage {
  id: number;
  url: string;
  tags: Partial<AestheticScores>;
}

// --- AI Pipeline Types ---

export interface UserSignals {
  reflectionAnswers: { question: string; answer: string }[];
  lifestyleChoices: string[];
  selectedImageIds: number[];
  selectedImageTags: Partial<AestheticScores>[];
  selectedAdjectives: string[];
  freeTextReflection: string;
  sliderValues: { label: string; value: number }[];
  materialChoice: string;
  lightPreference: string;
  scores: AestheticScores;
}

export interface AIAestheticResult {
  identityName: string;
  tagline: string;
  narrative: string;
  sensoryMap: {
    light: string;
    material: string;
    layout: string;
    energy: string;
  };
  designStrategy: {
    lighting: string;
    materials: string;
    colorPalette: string;
    layout: string;
    atmosphere: string;
  };
  traits: string[];
  materialBias: string;
  confidence: number;
}
