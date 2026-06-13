import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  location: string;
  type: "residential" | "commercial";
  category: string;
  area: string;
  budget: string;
  duration: string;
  style: string;
  year: number;
  heroImage: string;
  gallery: { room: string; images: string[] }[];
  brief: string;
  approach: string;
  materials: { name: string; details: string }[];
  testimonial?: { quote: string; author: string; role: string };
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "serene-master-suite",
    title: "Serene Master Suite",
    client: "Mr. & Mrs. Sharma",
    location: "Jamshedpur",
    type: "residential",
    category: "Residential",
    area: "450 sq.ft",
    budget: "₹8-10 Lakhs",
    duration: "30 days",
    style: "Contemporary Modern",
    year: 2024,
    heroImage: portfolioBedroom,
    gallery: [
      { room: "Bedroom", images: [portfolioBedroom] },
    ],
    brief: "The clients envisioned a complete overhaul of their 450 sq.ft primary bedroom, seeking to transform a previously dated and cluttered space into a serene, luxury retreat. The core requirement was to create a calming environment that actively promotes relaxation and restful sleep, while maintaining a sleek, contemporary modern aesthetic. They specifically requested enhanced spatial flow, maximized concealed storage to eliminate visual noise, and a sophisticated lighting scheme that could transition seamlessly from bright morning energy to moody evening relaxation.",
    approach: "Our design methodology focused on a highly curated, minimalist aesthetic anchored by a sophisticated neutral color palette and premium natural materials. We introduced custom-built, floor-to-ceiling wardrobes with handleless profiles to maximize storage without compromising the room's visual tranquility. A bespoke upholstered headboard featuring integrated ambient LED lighting serves as the room's focal point. By layering soft, tactile textures like brushed cotton, Italian marble, and warm walnut wood accents, we successfully crafted a peaceful, resort-like sanctuary that perfectly aligns with the clients' lifestyle.",
    materials: [
      { name: "Flooring", details: "Italian Marble with underfloor heating" },
      { name: "Wall Finish", details: "Asian Paints Royale Matte in Warm Beige" },
      { name: "Furniture", details: "Custom upholstered headboard with walnut accents" },
      { name: "Lighting", details: "Philips Hue ambient lighting system" },
    ],
    testimonial: {
      quote: "Our bedroom has become our personal retreat. The attention to detail and quality of work exceeded our expectations.",
      author: "Mrs. Sharma",
      role: "Homeowner",
    },
  },
  {
    id: "2",
    slug: "modern-culinary-space",
    title: "Modern Culinary Space",
    client: "Desai Family",
    location: "Bistupur",
    type: "residential",
    category: "Residential",
    area: "300 sq.ft",
    budget: "₹12-15 Lakhs",
    duration: "35 days",
    style: "Modern Minimalist",
    year: 2024,
    heroImage: portfolioKitchen,
    gallery: [
      { room: "Kitchen", images: [portfolioKitchen] },
    ],
    brief: "The Desai family approached us for a comprehensive renovation of their 300 sq.ft kitchen, which suffered from an outdated layout, poor lighting, and insufficient storage. Their vision was to create a modern, culinary-focused space that balances high-performance functionality with an elegant, clean aesthetic. The new design needed to serve as both a serious cooking environment for a passionate home chef and an inviting social hub for family gatherings, all while seamlessly integrating with the home's existing modern minimalist architecture.",
    approach: "We completely reimagined the spatial layout by implementing an optimized work triangle, significantly improving movement and workflow. The custom modular kitchen features high-end German soft-close mechanisms, ceiling-height cabinetry for maximum storage efficiency, and deep pull-out pantries. We selected a pristine Arctic White Italian Quartz countertop paired with a subtle gold-accented subway tile backsplash to inject a touch of understated luxury. Integrated, high-performance Bosch appliances and layered task lighting were meticulously installed to ensure a superior, professional-grade cooking experience in a stunning residential setting.",
    materials: [
      { name: "Countertop", details: "Italian Quartz in Arctic White" },
      { name: "Cabinets", details: "Hafele soft-close mechanisms with laminate finish" },
      { name: "Backsplash", details: "Subway tiles with gold grout accents" },
      { name: "Appliances", details: "Bosch built-in appliances" },
    ],
    testimonial: {
      quote: "The kitchen is now the heart of our home. Cooking has become a joy!",
      author: "Mrs. Desai",
      role: "Homeowner",
    },
  },
  {
    id: "3",
    slug: "executive-workspace",
    title: "Executive Workspace",
    client: "TechStart Solutions",
    location: "Jamshedpur",
    type: "commercial",
    category: "Commercial",
    area: "2000 sq.ft",
    budget: "₹25-30 Lakhs",
    duration: "45 days",
    style: "Corporate Modern",
    year: 2023,
    heroImage: portfolioOffice,
    gallery: [
      { room: "Office", images: [portfolioOffice] },
    ],
    brief: "TechStart Solutions required a complete transformation of their 2000 sq.ft bare-shell commercial unit into a dynamic, modern corporate hub. The primary objective was to design a professional office environment that promotes creativity, maximizes team productivity, and reflects the innovative, fast-paced spirit of their tech startup. They needed a strategic layout that could accommodate focused individual work, high-energy collaborative brainstorming sessions, and formal client presentations without feeling cramped or disjointed.",
    approach: "We developed a comprehensive spatial strategy centered around an open-plan architecture, intentionally moving away from traditional cubicle farms. The workspace was divided into dedicated acoustic zones: a high-energy collaborative hub, whisper-quiet focus pods, and a premium executive boardroom. We integrated extensive biophilic design elements, including living moss walls and natural timber accents, to reduce stress and improve air quality. Smart lighting systems with daylight simulation were installed to maintain team energy levels throughout the workday. The final execution perfectly balanced corporate professionalism with start-up agility, delivered precisely within the 45-day window.",
    materials: [
      { name: "Flooring", details: "Engineered Wood with carpet tiles in work areas" },
      { name: "Wall Finish", details: "Acoustic panels with brand color accents" },
      { name: "Furniture", details: "Ergonomic workstations with sit-stand desks" },
      { name: "Lighting", details: "Philips LED panels with daylight simulation" },
    ],
    testimonial: {
      quote: "Our new office has transformed how our team works. The space truly reflects our company culture.",
      author: "Vikram Singh",
      role: "CEO, TechStart Solutions",
    },
  },
];

export const categories = ["All", "Residential", "Commercial"];
