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
    brief: "The clients wanted a serene, calming bedroom retreat that promotes relaxation and restful sleep while maintaining a modern aesthetic.",
    approach: "We focused on a neutral color palette with natural materials, incorporating soft textures and ambient lighting to create a peaceful sanctuary.",
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
    brief: "A complete kitchen renovation with focus on functionality, storage optimization, and a clean aesthetic that matches the rest of the home.",
    approach: "We designed a modular kitchen with maximum storage efficiency, incorporating high-end appliances and premium finishes for a luxurious cooking experience.",
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
    brief: "Design a professional office environment that promotes creativity, productivity, and reflects the innovative spirit of a tech startup.",
    approach: "We created an open-plan workspace with dedicated zones for collaboration, focus work, and client meetings, incorporating biophilic design elements.",
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
