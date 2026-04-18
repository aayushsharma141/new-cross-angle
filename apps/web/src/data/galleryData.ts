// Gallery Data — All real images from crossangleinterior.com/gallery/
// These are the actual project images from the Cross Angle Interior portfolio.

export interface GalleryItem {
  id: string;
  image: string;
  fallbackImage?: string;
  category: string;
  title: string;
  location: string;
  year: number;
  description?: string;
  slug?: string;
}

const BASE = "https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-";

export const galleryItems: GalleryItem[] = [
  // ── Modular Kitchen (4 images) ──────────────────────────────────────────────
  {
    id: "mk-1",
    image: `${BASE}K1.png`,
    category: "Modular Kitchen",
    title: "Contemporary Modular Kitchen",
    location: "Jamshedpur",
    year: 2023,
    description: "A sleek white-and-wood modular kitchen designed for effortless functionality and modern appeal.",
  },
    {
      id: "mk-2",
      image: `${BASE}K2.png`,
      category: "Modular Kitchen",
      title: "Heritage Kitchen Remodel",
      location: "Bistupur",
      year: 2023,
      description: "Classic cabinetry meets modern appliances in this thoughtfully executed kitchen transformation.",
    },
  {
    id: "mk-3",
    image: `${BASE}K3.png`,
    category: "Modular Kitchen",
    title: "Minimalist Culinary Studio",
    location: "Ranchi",
    year: 2024,
    description: "A stripped-back minimalist kitchen with integrated handles and seamless surfaces.",
  },
  {
    id: "mk-4",
    image: `${BASE}K4.png`,
    category: "Modular Kitchen",
    title: "Open-Plan Cooking Space",
    location: "Jamshedpur",
    year: 2024,
    description: "An open-plan kitchen designed for entertaining, combining island worktop with ample storage.",
  },

  // ── Bedroom Interior (12 images) ────────────────────────────────────────────
  {
    id: "bd-1",
    image: `${BASE}1.png`,
    category: "Bedroom Interior",
    title: "Serene Master Suite",
    location: "Jamshedpur",
    year: 2023,
    description: "A calming master bedroom with neutral palettes and ambient lighting for restful sleep.",
  },
    {
      id: "bd-2",
      image: `${BASE}2.png`,
      category: "Bedroom Interior",
      title: "Luxury Guest Chamber",
      location: "Sakchi",
      year: 2023,
      description: "Hotel-inspired guest bedroom with bespoke headboard and layered textiles.",
    },
  {
    id: "bd-3",
    image: `${BASE}3.png`,
    category: "Bedroom Interior",
    title: "Children's Dreaming Room",
    location: "Jamshedpur",
    year: 2024,
    description: "A whimsical, safe, and functional space designed to fuel imagination.",
  },
  {
    id: "bd-4",
    image: `${BASE}4.png`,
    category: "Bedroom Interior",
    title: "Contemporary Bedroom Retreat",
    location: "Dhanbad",
    year: 2023,
    description: "Modern bedroom with built-in wardrobes and concealed lighting system.",
  },
  {
    id: "bd-5",
    image: `${BASE}5.png`,
    category: "Bedroom Interior",
    title: "Earthy Bohemian Bedroom",
    location: "Ranchi",
    year: 2024,
    description: "Warm earthy tones with rattan accents and layered rugs for a cosy retreat.",
  },
  {
    id: "bd-6",
    image: `${BASE}6.png`,
    category: "Bedroom Interior",
    title: "Studio Apartment Bedroom",
    location: "Jamshedpur",
    year: 2023,
    description: "Space-efficient bedroom design with smart storage integrated throughout.",
  },
    {
      id: "bd-7",
      image: `${BASE}7.png`,
      category: "Bedroom Interior",
      title: "Art Deco Master Bedroom",
      location: "Kadma",
      year: 2024,
      description: "Bold geometric patterns and rich jewel tones define this glamorous bedroom.",
    },
  {
    id: "bd-8",
    image: `${BASE}8.png`,
    category: "Bedroom Interior",
    title: "Scandinavian Bedroom",
    location: "Jamshedpur",
    year: 2023,
    description: "Clean lines, natural wood, and white walls for a serene Nordic aesthetic.",
  },
  {
    id: "bd-9",
    image: `${BASE}9.png`,
    category: "Bedroom Interior",
    title: "Velvet & Gold Bedroom",
    location: "Patna",
    year: 2024,
    description: "Opulent velvet textures paired with brass accents for a regal bedroom feel.",
  },
  {
    id: "bd-10",
    image: `${BASE}10.png`,
    category: "Bedroom Interior",
    title: "Teen Bedroom Makeover",
    location: "Jamshedpur",
    year: 2024,
    description: "Vibrant yet tasteful teen bedroom with study area and ample storage.",
  },
    {
      id: "bd-11",
      image: `${BASE}11.png`,
      category: "Bedroom Interior",
      title: "Penthouse Master Suite",
      location: "Sonari",
      year: 2023,
      description: "Floor-to-ceiling windows and bespoke joinery in a penthouse master suite.",
    },
  {
    id: "bd-12",
    image: `${BASE}12.png`,
    category: "Bedroom Interior",
    title: "Japandi Bedroom",
    location: "Jamshedpur",
    year: 2024,
    description: "Japandi fusion — Japanese simplicity meets Scandinavian warmth.",
  },

  // ── Living Room Interior (2 images) ─────────────────────────────────────────
  {
    id: "lr-1",
    image: `${BASE}L1.png`,
    category: "Living Room Interior",
    title: "Contemporary Living Lounge",
    location: "Jamshedpur",
    year: 2023,
    description: "An elegant living room with statement sofa, accent wall, and curated art pieces.",
  },
  {
    id: "lr-2",
    image: `${BASE}L2.png`,
    category: "Living Room Interior",
    title: "Open-Plan Family Living",
    location: "Dhanbad",
    year: 2024,
    description: "A generous open-plan living area connecting kitchen and lounge with seamless flow.",
  },

  // ── Commercial Interior (4 images) ──────────────────────────────────────────
  {
    id: "ci-1",
    image: "https://crossangleinterior.com/wp-content/uploads/2023/10/1.png",
    category: "Commercial Interior",
    title: "Modern Office Workspace",
    location: "Jamshedpur",
    year: 2023,
    description: "A productivity-focused office space with collaborative zones and ergonomic workstations.",
  },
    {
      id: "ci-2",
      image: "https://crossangleinterior.com/wp-content/uploads/2023/10/2.png",
      category: "Commercial Interior",
      title: "Boutique Retail Store",
      location: "Telco",
      year: 2024,
      description: "A carefully curated retail environment designed to enhance product discovery and dwell time.",
    },
  {
    id: "ci-3",
    image: "https://crossangleinterior.com/wp-content/uploads/2023/10/3.png",
    category: "Commercial Interior",
    title: "Corporate Reception Lobby",
    location: "Jamshedpur",
    year: 2023,
    description: "A commanding corporate lobby that communicates authority and professionalism.",
  },
  {
    id: "ci-4",
    image: "https://crossangleinterior.com/wp-content/uploads/2023/10/4.png",
    category: "Commercial Interior",
    title: "Creative Studio Space",
    location: "Ranchi",
    year: 2024,
    description: "An inspiring creative studio designed to unlock innovation and team collaboration.",
  },

  // ── Exterior Interior (4 images) ────────────────────────────────────────────
  {
    id: "ex-1",
    image: "https://crossangleinterior.com/wp-content/uploads/2023/10/1-1.png",
    category: "Exterior Interior",
    title: "Contemporary Home Façade",
    location: "Jamshedpur",
    year: 2023,
    description: "A clean modern exterior with stone cladding and large glass panels.",
  },
    {
      id: "ex-2",
      image: "https://crossangleinterior.com/wp-content/uploads/2023/10/2-1.png",
      category: "Exterior Interior",
      title: "Villa Garden Landscape",
      location: "Golmuri",
      year: 2024,
      description: "Lush landscape design with water feature, stone pathways, and ambient lighting.",
    },
  {
    id: "ex-3",
    image: "https://crossangleinterior.com/wp-content/uploads/2023/10/3-1.png",
    category: "Exterior Interior",
    title: "Rooftop Terrace Design",
    location: "Dhanbad",
    year: 2023,
    description: "A functional and stylish rooftop terrace with pergola, planters, and seating.",
  },
  {
    id: "ex-4",
    image: "https://crossangleinterior.com/wp-content/uploads/2023/10/4-1.png",
    category: "Exterior Interior",
    title: "Minimalist Building Exterior",
    location: "Jamshedpur",
    year: 2024,
    description: "Minimalist architectural exterior with precise material selection and bold geometry.",
  },
];

export const GALLERY_CATEGORIES = [
  "All",
  "Modular Kitchen",
  "Bedroom Interior",
  "Living Room Interior",
  "Commercial Interior",
  "Exterior Interior",
] as const;

export type GalleryCategory = typeof GALLERY_CATEGORIES[number];

export const getFilteredItems = (category: GalleryCategory): GalleryItem[] => {
  if (category === "All") return galleryItems;
  return galleryItems.filter((item) => item.category === category);
};

export const getCategoryCount = (category: GalleryCategory): number => {
  if (category === "All") return galleryItems.length;
  return galleryItems.filter((item) => item.category === category).length;
};
