/**
 * og-defaults.ts
 *
 * Static Open Graph metadata for pages that don't require a Supabase lookup.
 * These are consumed by the Vercel Edge Middleware (middleware.ts) to inject
 * OG tags for social crawlers on non-dynamic routes.
 */

export const SITE_URL = "https://crossangleinterior.com";
export const SITE_NAME = "Crossangle Interior";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: "website" | "article";
}

export const DEFAULT_OG: OgData = {
  title: "Crossangle Interior | Premium Interior Design Studio",
  description:
    "Transform your vision into exquisite living spaces. Award-winning interior design for homes and commercial spaces in Jamshedpur and nearby neighborhoods. 500+ projects completed.",
  image: DEFAULT_OG_IMAGE,
  url: SITE_URL,
  type: "website",
};

/** Exact-pathname → static OG overrides */
export const STATIC_OG_MAP: Record<string, Partial<OgData>> = {
  "/about-us": {
    title: "About Us | Crossangle Interior",
    description:
      "Meet the passionate design team behind Crossangle Interior — crafting premium residential and commercial spaces in Jamshedpur since 2015.",
    url: `${SITE_URL}/about-us`,
  },
  "/services": {
    title: "Interior Design Services | Crossangle Interior",
    description:
      "Comprehensive interior design services: residential, commercial, modular kitchens, false ceilings, lighting design, and more across Jamshedpur and nearby neighborhoods.",
    url: `${SITE_URL}/services`,
  },
  "/services/residential": {
    title: "Residential Interior Design | Crossangle Interior",
    description:
      "Personalized home interiors — living rooms, bedrooms, kitchens, and more. Crafted for your lifestyle and budget in Jamshedpur.",
    url: `${SITE_URL}/services/residential`,
  },
  "/services/commercial": {
    title: "Commercial Interior Design | Crossangle Interior",
    description:
      "Strategic commercial interior design for offices, retail outlets, restaurants, and showrooms. Enhance productivity and brand value.",
    url: `${SITE_URL}/services/commercial`,
  },
  "/services/specialized": {
    title: "Specialized Interior Executions | Crossangle Interior",
    description:
      "Expert solutions for modular kitchens, false ceilings, lighting design, and custom furniture by Crossangle Interior.",
    url: `${SITE_URL}/services/specialized`,
  },
  "/gallery": {
    title: "Project Gallery | Crossangle Interior",
    description:
      "Explore our curated gallery of luxurious interior design projects — residential and commercial spaces transformed across Jamshedpur and nearby neighborhoods.",
    url: `${SITE_URL}/gallery`,
  },
  "/portfolio": {
    title: "Portfolio | Crossangle Interior",
    description:
      "Browse 500+ completed interior design projects — from premium residences to award-winning commercial spaces.",
    url: `${SITE_URL}/portfolio`,
  },
  "/blog": {
    title: "Interior Design Blog | Crossangle Interior",
    description:
      "Expert insights, design trends, and inspiration from the Crossangle Interior design team. Explore tips for homes and commercial spaces.",
    url: `${SITE_URL}/blog`,
  },
  "/contact-us": {
    title: "Contact Us | Crossangle Interior",
    description:
       "Ready to transform your space? Get in touch with the Crossangle Interior team today. Located in Jamshedpur, serving Jamshedpur and nearby neighborhoods.",
    url: `${SITE_URL}/contact-us`,
  },
  "/estimate": {
    title: "Get a Free Estimate | Crossangle Interior",
    description:
      "Use our price estimator to get an instant ballpark estimate for your interior design project — no commitment required.",
    url: `${SITE_URL}/estimate`,
  },
};

/** Service-level static OG (for /services/:category/:slug) */
export const SERVICE_OG_MAP: Record<string, Partial<OgData>> = {
  "living-room": {
    title: "Living Room Design Services | Crossangle Interior",
    description:
      "Complete living room makeovers with custom TV units, strategic seating, and ambient lighting. Residential design experts in Jamshedpur.",
    url: `${SITE_URL}/services/residential/living-room`,
  },
  bedroom: {
    title: "Bedroom Interior Design | Crossangle Interior",
    description:
      "Peaceful bedroom sanctuaries with custom wardrobes, false ceilings, and cozy aesthetics. Transform your private retreat today.",
    url: `${SITE_URL}/services/residential/bedroom`,
  },
  kitchen: {
    title: "Kitchen & Dining Design | Crossangle Interior",
    description:
      "Functional and stylish kitchens with ergonomic planning, modular solutions, and premium materials. The heart of your home.",
    url: `${SITE_URL}/services/residential/kitchen`,
  },
  office: {
    title: "Office Interior Design | Crossangle Interior",
    description:
      "Productive office workspaces with ergonomic planning, acoustic meeting pods, and brand-aligned reception areas.",
    url: `${SITE_URL}/services/commercial/office`,
  },
  retail: {
    title: "Retail & Showroom Design | Crossangle Interior",
    description:
      "Engaging retail environments designed to maximize customer flow and product display for your business.",
    url: `${SITE_URL}/services/commercial/retail`,
  },
  restaurant: {
    title: "Restaurant & Cafe Design | Crossangle Interior",
    description:
      "Memorable dining atmospheres with hospitality-grade detailing that captivate guests and streamline operations.",
    url: `${SITE_URL}/services/commercial/restaurant`,
  },
  "modular-kitchens": {
    title: "Modular Kitchen Systems | Crossangle Interior",
    description:
      "State-of-the-art modular kitchens with Hettich/Hafele hardware, soft-close mechanisms, and factory-finish manufacturing.",
    url: `${SITE_URL}/services/specialized/modular-kitchens`,
  },
  ceilings: {
    title: "False Ceiling & Lighting Design | Crossangle Interior",
    description:
      "Transformative ceiling designs with gypsum, cove lighting, and acoustic panels that define your living or commercial space.",
    url: `${SITE_URL}/services/specialized/ceilings`,
  },
  lighting: {
    title: "Lighting Design Services | Crossangle Interior",
    description:
      "Architectural lighting that transforms ambience with layered ambient, task, and accent light solutions for any space.",
    url: `${SITE_URL}/services/specialized/lighting`,
  },
  "custom-furniture": {
    title: "Custom Furniture | Crossangle Interior",
    description:
      "Bespoke furniture crafted to your exact specifications — made-to-measure dimensions, premium materials, and superior craftsmanship.",
    url: `${SITE_URL}/services/specialized/custom-furniture`,
  },
};
