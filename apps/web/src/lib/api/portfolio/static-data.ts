import type { Project } from "./types";

/**
 * Static fallback projects — displayed when Supabase is unavailable or returns
 * no results. These are real completed projects; they are not demo data.
 */
export const staticProjects: Project[] = [
  {
    id: "serene-master-suite",
    slug: "serene-master-suite",
    title: "Serene Master Suite",
    client: "Private Residence",
    location: "Jamshedpur",
    type: "residential",
    category: "Bedroom Interior",
    area: "650 sq.ft",
    budget: "₹18-25 Lakhs",
    duration: "5 Weeks",
    style: "Warm Modern Minimalist",
    year: 2024,
    heroImage: "/images/projects/discovery/lifestyle-7.jpg",
    gallery: [
      {
        room: "Master Suite Bed Area",
        images: [
          "/images/projects/discovery/lifestyle-7.jpg",
          "/images/projects/discovery/visual-18.jpg",
        ],
      },
      {
        room: "Walk-in Closet & Vanity",
        images: [
          "/images/projects/discovery/visual-10.jpg",
          "/images/projects/discovery/visual-7.jpg",
        ],
      },
    ],
    brief:
      "Transform a master bedroom into a tranquil, hotel-suite-inspired sanctuary featuring warm ambient coves, custom walk-in wardrobes, and acoustic sound insulation.",
    approach:
      "We designed an integrated headboard wall with indirect warm LED cove lighting, paired with floor-to-ceiling HDMR sliding wardrobes and sound-damping acoustic upholstered wall panels.",
    challengeShort: "Managing low ceiling drops while incorporating ducted AC and layered cove lighting.",
    resultShort: "A serene sanctuary combining seamless storage with 30% reduction in external ambient noise.",
    materials: [
      { name: "HDMR Carcass & Marine Plywood", details: "BWP grade moisture-resistant structural core" },
      { name: "Fluted Italian Walnut Veneer", details: "Natural matte polyurethane lacquer finish" },
      {
        name: "Custom Acoustic Headboard Upholstery",
        details: "Commercial-grade velvet with acoustic foam backing",
      },
      { name: "Warm Ambient Lighting Grid", details: "3000K high-CRI recessed magnetic tracks and coves" },
    ],
    testimonial: {
      quote:
        "Cross Angle Interior transformed our master bedroom into a tranquil, luxury sanctuary that feels like a 5-star hotel suite every evening.",
      author: "Ananya & Rakesh Sharma",
      role: "Homeowners, Jamshedpur",
    },
  },
  {
    id: "executive-workspace",
    slug: "executive-workspace",
    title: "Executive Workspace",
    client: "Tech Logistics Corp",
    location: "Ranchi",
    type: "commercial",
    category: "Office Interiors",
    area: "4,200 sq.ft",
    budget: "₹45-60 Lakhs",
    duration: "7 Weeks",
    style: "Biophilic Corporate Modernism",
    year: 2024,
    heroImage: "/images/projects/discovery/visual-16.jpg",
    gallery: [
      {
        room: "Reception & Lounge",
        images: [
          "/images/projects/discovery/visual-16.jpg",
          "/images/projects/discovery/visual-14.jpg",
        ],
      },
      {
        room: "Executive Boardroom",
        images: [
          "/images/projects/discovery/visual-11.jpg",
          "/images/projects/discovery/visual-8.jpg",
        ],
      },
    ],
    brief:
      "Design a corporate headquarters that projects command authority and innovation while providing ergonomic focus zones for a 40+ person team.",
    approach:
      "Utilized biophilic design principles with live greenery walls, acoustic ceiling baffles, modular workstation islands, and an impressive executive boardroom with integrated AV.",
    challengeShort: "Balancing open collaborative areas with soundproof executive meeting spaces.",
    resultShort: "Enhanced team collaboration with a 40% reduction in ambient noise cross-talk.",
    materials: [
      { name: "Acoustic Slatted Wood Panels", details: "Fire-rated acoustic wood baffles" },
      {
        name: "Modular Steel & Laminate Workstations",
        details: "Ergonomic height-adjustable desks with cable raceways",
      },
      { name: "Commercial Carpet Tiles", details: "Heavy-duty nylon tiles with sound absorption" },
    ],
    testimonial: {
      quote: "Our new office has boosted team morale and impressed visiting investors from day one.",
      author: "Vikram Malhotra",
      role: "Managing Director, Tech Logistics",
    },
  },
  {
    id: "modern-culinary-space",
    slug: "modern-culinary-space",
    title: "Modern Culinary Space",
    client: "Private Villa Residence",
    location: "Bhubaneswar",
    type: "residential",
    category: "Modular Kitchen & Dining",
    area: "480 sq.ft",
    budget: "₹15-22 Lakhs",
    duration: "4 Weeks",
    style: "Sleek German Ergonomics",
    year: 2024,
    heroImage: "/images/projects/discovery/visual-12.jpg",
    gallery: [
      {
        room: "Main Kitchen Island",
        images: [
          "/images/projects/discovery/visual-12.jpg",
          "/images/projects/discovery/visual-15.jpg",
        ],
      },
      {
        room: "Dining & Pantry Area",
        images: [
          "/images/projects/discovery/visual-13.jpg",
          "/images/projects/discovery/visual-3.jpg",
        ],
      },
    ],
    brief:
      "Create a state-of-the-art modular kitchen with a multi-functional island, integrated German appliances, and custom dining banquette.",
    approach:
      "Engineered factory-built modular cabinets with Blum soft-close hardware, a waterfall quartz island counter, and a pull-out tall pantry system.",
    challengeShort: "Optimizing heavy cooking workflows within an open-concept dining space.",
    resultShort: "Delivered a clean, dust-free installation with 50% more storage efficiency.",
    materials: [
      { name: "BWP Marine Grade Plywood", details: "100% waterproof carcass construction" },
      { name: "Blum Movento & Legrabox Hardware", details: "Soft-close motion technology" },
      { name: "Calacatta Gold Quartz Countertop", details: "Stain, scratch, and heat resistant surface" },
    ],
    testimonial: {
      quote: "Cooking and entertaining guests has become an absolute pleasure in our new modular kitchen.",
      author: "Siddharth & Meera Roy",
      role: "Homeowners, Bhubaneswar",
    },
  },
  {
    id: "minimalist-villa",
    slug: "minimalist-villa",
    title: "Minimalist Villa",
    client: "Singhania Residence",
    location: "Jamshedpur",
    type: "residential",
    category: "Turnkey Villa Interior",
    area: "3,800 sq.ft",
    budget: "₹65-85 Lakhs",
    duration: "10 Weeks",
    style: "Warm Minimalist Luxury",
    year: 2024,
    heroImage: "/reality_render.jpg",
    gallery: [
      {
        room: "Living & Foyer",
        images: ["/reality_render.jpg", "/images/projects/discovery/lifestyle-8.jpg"],
      },
      {
        room: "Dining & Terrace",
        images: [
          "/images/projects/discovery/visual-1.jpg",
          "/images/projects/discovery/visual-16.jpg",
        ],
      },
    ],
    brief:
      "A complete turnkey interior design for a contemporary 4-BHK villa, emphasizing clean architectural lines and natural materials.",
    approach:
      "Integrated micro-cement flooring, hidden doors, recessed magnetic track lighting, and bespoke handcrafted solid teak furniture.",
    challengeShort: "Ensuring seamless material transitions across 3 split levels.",
    resultShort: "An architectural masterpiece featured in leading luxury design publications.",
    materials: [
      { name: "Micro-Cement Flooring", details: "Seamless matte mineral coating" },
      { name: "Solid Teak & Oak Joinery", details: "Custom architectural furniture" },
      { name: "Recessed Magnetic Light Tracks", details: "Dimmable architectural lighting" },
    ],
    testimonial: {
      quote: "Cross Angle Interior captured our vision perfectly. The attention to detail is world-class.",
      author: "Rajesh Singhania",
      role: "Villa Owner, Jamshedpur",
    },
  },
  {
    id: "boutique-retail",
    slug: "boutique-retail",
    title: "Boutique Retail Space",
    client: "Aura Fashion Atelier",
    location: "Kolkata",
    type: "commercial",
    category: "Retail & Showroom",
    area: "1,800 sq.ft",
    budget: "₹25-35 Lakhs",
    duration: "4 Weeks",
    style: "High-Fashion Luxe",
    year: 2024,
    heroImage: "/images/projects/discovery/lifestyle-5.jpg",
    gallery: [
      {
        room: "Main Display Floor",
        images: [
          "/images/projects/discovery/lifestyle-5.jpg",
          "/images/projects/discovery/visual-17.jpg",
        ],
      },
      {
        room: "Fitting Lounge & POS",
        images: [
          "/images/projects/discovery/visual-6.jpg",
          "/images/projects/discovery/visual-4.jpg",
        ],
      },
    ],
    brief:
      "Design a luxury fashion showroom engineered to guide foot traffic and highlight haute couture collections.",
    approach:
      "Constructed arch portals, high-CRI 95+ merchandise spotlights, velvet fitting lounges, and custom brass-finished display racks.",
    challengeShort: "Strict mall night-shift fit-out timeline of 25 calendar days.",
    resultShort: "Opened on schedule with record launch-day sales figures.",
    materials: [
      { name: "Brushed Brass Display Channels", details: "PVD coated anti-tarnish metalwork" },
      { name: "High-CRI 95+ Merchandise Lighting", details: "Precision color rendering lights" },
      { name: "Plush Velvet Wall Upholstery", details: "Acoustic fitting lounge paneling" },
    ],
    testimonial: {
      quote: "The store layout naturally draws shoppers in and displays our garments like works of art.",
      author: "Priya Mukherjee",
      role: "Creative Director, Aura Fashion",
    },
  },
];
