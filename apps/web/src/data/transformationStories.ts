import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

export interface TransformationStory {
  id: string;
  title: string;
  location: string;
  beforeMedia: string;
  afterMedia: string;
  challenge: string;
  designMoves: string[];
  productsUsed: { name: string; brand: string; spec: string }[];
  outcomeMetric: string;
  testimonial?: { quote: string; clientName: string };
}

export const transformationStories: TransformationStory[] = [
  {
    id: "ts-bedroom-makeover",
    title: "Master Bedroom Makeover",
    location: "JAMSHEDPUR",
    beforeMedia: portfolioOffice,
    afterMedia: portfolioBedroom,
    challenge:
      "A dated 450 sq.ft bedroom that felt cramped, disconnected, and visually noisy. The clients wanted calm without sterility.",
    designMoves: [
      "Stripped the accent wall to bare plaster and introduced fluted walnut paneling for acoustic warmth.",
      "Replaced generic overhead light with a layered ambient lighting scheme using Philips Hue profiles.",
      "Chose Italian marble flooring with underfloor heating to ground the room in tactile luxury.",
    ],
    productsUsed: [
      { name: "Fluted Wall Panels", brand: "Custom Millwork", spec: "American Walnut, 12mm flutes" },
      { name: "Ambient Lighting", brand: "Philips Hue", spec: "White Ambiance gradient strips" },
      { name: "Italian Marble", brand: "Florim", spec: "Magnum 120x260cm, Calacatta finish" },
    ],
    outcomeMetric: "Completed in 30 days — client-reported 40% improvement in sleep quality.",
    testimonial: {
      quote:
        "CrossAngle didn't just redesign our bedroom; they completely changed how we feel when we wake up. The acoustic panelling and lighting made it a true sanctuary.",
      clientName: "Rahul & Megha",
    },
  },
  {
    id: "ts-minimalist-kitchen",
    title: "Minimalist Kitchen",
    location: "KOLKATA",
    beforeMedia: portfolioBedroom,
    afterMedia: portfolioKitchen,
    challenge:
      "A 300 sq.ft kitchen with cluttered counters, outdated cabinetry, and zero workflow logic. The family needed both beauty and performance.",
    designMoves: [
      "Implemented handle-less push-to-open cabinetry with Häfele soft-close mechanisms.",
      "Installed Arctic White quartz countertop with integrated drainboard for seamless utility.",
      "Subway tile backsplash with gold grout accents to anchor the material palette.",
    ],
    productsUsed: [
      { name: "Quartz Countertop", brand: "Caesarstone", spec: "Arctic White, 20mm polished edge" },
      { name: "Soft-Close Cabinets", brand: "Häfele", spec: "Blumotion integrated, laminate finish" },
      { name: "Built-in Appliances", brand: "Bosch", spec: "Serie 6 oven, induction hob, dishwasher" },
    ],
    outcomeMetric: "Completed in 35 days — 60% increase in usable counter space.",
    testimonial: {
      quote:
        "We asked for functionality, but they delivered a masterpiece. Every drawer, every hinge feels intentional. It's the heart of our home now.",
      clientName: "The Senguptas",
    },
  },
  {
    id: "ts-executive-office",
    title: "Executive Office",
    location: "JAMSHEDPUR",
    beforeMedia: portfolioKitchen,
    afterMedia: portfolioOffice,
    challenge:
      "A 2000 sq.ft generic office space that felt sterile and uninspiring. The startup needed a space that reflected its innovative culture.",
    designMoves: [
      "Created dedicated biophilic zones with living walls and natural light channels.",
      "Engineered ergonomic workstations with sit-stand desks in quiet-zone pods.",
      "Acoustic panel accent walls in brand colors to absorb sound while reinforcing identity.",
    ],
    productsUsed: [
      { name: "Engineered Wood Flooring", brand: "Pergo", spec: "Laminate oak with carpet tile zones" },
      { name: "Acoustic Panels", brand: "Baux", spec: "Triangular felt tiles, custom color match" },
      { name: "LED Panels", brand: "Philips", spec: "TrueForce daylight simulation, 5000K" },
    ],
    outcomeMetric: "Completed in 45 days — employee satisfaction survey up 35%.",
    testimonial: {
      quote:
        "A space that reflects authority yet feels incredibly inviting. My productivity has genuinely improved since the redesign.",
      clientName: "Vikram S.",
    },
  },
];


export interface PartnerProof {
  brandName: string;
  role: string;
  whyItMatters: string;
  roomsUsedIn: string[];
}

export const partnerProofs: PartnerProof[] = [
  {
    brandName: "Häfele",
    role: "Hardware & Fittings Partner",
    whyItMatters:
      "Every drawer, hinge, and pull mechanism uses Häfele's Blumotion soft-close technology — ensuring durability and a silent daily experience.",
    roomsUsedIn: ["kitchen", "wardrobe", "entry"],
  },
  {
    brandName: "Philips Hue",
    role: "Smart Lighting Partner",
    whyItMatters:
      "Ambient lighting is designed with Hue's gradient strips and scene controls, allowing rooms to shift mood from morning focus to evening warmth.",
    roomsUsedIn: ["bedroom", "living"],
  },
  {
    brandName: "Caesarstone",
    role: "Surface & Countertop Partner",
    whyItMatters:
      "Premium quartz surfaces that resist stains, heat, and scratches — chosen for their combination of visual elegance and daily resilience.",
    roomsUsedIn: ["kitchen"],
  },
  {
    brandName: "Bosch",
    role: "Appliance Partner",
    whyItMatters:
      "Built-in appliances designed for seamless integration with our modular kitchen systems, delivering professional performance in a residential form factor.",
    roomsUsedIn: ["kitchen"],
  },
];
