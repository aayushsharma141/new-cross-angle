import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

export interface RoomJourney {
  slug: string;
  title: string;
  moodStatement: string;
  heroMedia: string;
  supportingCopy: string;
  relatedProjects: string[];
  relatedServices: string[];
  ctaVariant: "consultation" | "whatsapp" | "estimate";
}

export const roomJourneys: RoomJourney[] = [
  {
    slug: "kitchen",
    title: "The Kitchen",
    moodStatement: "Where warmth meets precision.",
    heroMedia: portfolioKitchen,
    supportingCopy:
      "A kitchen should be more than functional. We design cooking spaces where every drawer, surface, and light source is intentional — blending modular efficiency with materials that invite touch.",
    relatedProjects: ["modern-culinary-space"],
    relatedServices: ["modular-kitchens", "kitchen"],
    ctaVariant: "consultation",
  },
  {
    slug: "wardrobe",
    title: "The Wardrobe",
    moodStatement: "Quiet mornings start here.",
    heroMedia: portfolioBedroom,
    supportingCopy:
      "Fluted glass, back-lit shelving, and seamless matte finishes designed around your daily rituals. A wardrobe that understands the rhythm of your routine.",
    relatedProjects: ["serene-master-suite"],
    relatedServices: ["bedroom"],
    ctaVariant: "whatsapp",
  },
  {
    slug: "bedroom",
    title: "The Bedroom",
    moodStatement: "Your personal sanctuary.",
    heroMedia: portfolioBedroom,
    supportingCopy:
      "Soft textures, acoustic calm, and ambient lighting engineered for deep rest. We build bedrooms where the world outside simply stops.",
    relatedProjects: ["serene-master-suite"],
    relatedServices: ["bedroom"],
    ctaVariant: "consultation",
  },
  {
    slug: "living",
    title: "The Living Room",
    moodStatement: "The art of gathering.",
    heroMedia: portfolioOffice,
    supportingCopy:
      "Open sightlines, layered lighting, and material palettes that anchor conversation. A living room designed to make presence feel effortless.",
    relatedProjects: [],
    relatedServices: ["living-room"],
    ctaVariant: "consultation",
  },
  {
    slug: "entry",
    title: "The Entry",
    moodStatement: "First impressions, every day.",
    heroMedia: portfolioOffice,
    supportingCopy:
      "Door hardware, console lighting, and spatial flow that sets the tone before a single word is spoken. Your home begins here.",
    relatedProjects: [],
    relatedServices: [],
    ctaVariant: "whatsapp",
  },
];
