import type { HomepageModel } from "@/types/content/models"

/**
 * Homepage Content Seed
 *
 * This is the authoritative content object for the Homepage.
 * It is strictly typed against HomepageModel.
 * When a CMS is introduced, this object shape becomes the adapter contract.
 */
export const homepageSeed: HomepageModel = {
  hero: {
    variant: "split",
    badge: "CROSSANGLE INTERIOR ARCHITECTURE",
    title: "Homes Designed For Living.\nEngineered For Predictability.",
    subtitle:
      "We treat interior design as an engineering challenge, not just decoration. Enjoy beautiful, highly functional spaces through our CrossAngle Predictable Interior System™.",
    primaryActionLabel: "Take Style Quiz",
    secondaryActionLabel: "Explore Portfolio",
    imageUrl: "/hero_reality_render_1775299733746.png",
  },

  story: {
    headline: "The Philosophy",
    manifestoText:
      "We don't design rooms. We engineer lives. Every spatial decision is a deliberate act that shapes how you feel, move, and exist within your home.",
    secondaryText:
      "Our process is rooted in material honesty, functional clarity, and a relentless pursuit of the detail that makes a space feel inevitable — as though it could not have been designed any other way.",
    imageUrl1: "/hero_reality_render_1775299733746.png",
    metrics: [
      { value: "150+", label: "Projects Completed" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "45–75", label: "Days Avg. Delivery" },
      { value: "8+", label: "Years of Excellence" },
    ],
  },

  gallery: {
    title: "Selected Works",
    subtitle: "A curated archive of our most defining interior commissions.",
    mode: "dark",
    projects: [
      {
        id: "highland-residence",
        title: "The Highland Residence",
        location: "Jamshedpur",
        imageUrl: "/hero_reality_render_1775299733746.png",
        category: "Luxury Residential",
      },
      {
        id: "mango-apartment",
        title: "The Mango Apartment",
        location: "Mango, Jamshedpur",
        imageUrl: "/hero_reality_render_1775299733746.png",
        category: "Residential",
      },
      {
        id: "bistupur-office",
        title: "Bistupur Commercial Hub",
        location: "Bistupur",
        imageUrl: "/hero_reality_render_1775299733746.png",
        category: "Commercial",
      },
    ],
  },

  process: {
    title: "The CrossAngle System",
    subtitle:
      "A four-stage methodology that transforms your brief into a predictable, on-time delivery.",
    steps: [
      {
        number: "01",
        title: "Discovery & Brief",
        description:
          "We listen deeply, map your lifestyle, and define the exact spatial personality of your project.",
      },
      {
        number: "02",
        title: "3D Visualization",
        description:
          "Photorealistic renders are approved before a single material is purchased. No surprises.",
      },
      {
        number: "03",
        title: "Material Execution",
        description:
          "Precision-supervised installation with daily progress updates and zero quality compromise.",
      },
      {
        number: "04",
        title: "Final Handover",
        description:
          "We complete every detail — down to art placement and accessory curation — before handover.",
      },
    ],
  },

  metrics: {
    title: "The Numbers That Define Us",
    metrics: [
      { value: "150+", label: "Projects Delivered", trend: "↑" },
      { value: "4.9", label: "Average Client Rating", trend: "↑" },
      { value: "98%", label: "On-Time Completion", trend: "→" },
      { value: "₹2Cr+", label: "Projects Executed" },
    ],
  },

  cta: {
    headline: "Ready To Transform Your Space?",
    description:
      "Book a free 30-minute consultation. We'll walk through your brief, budget, and vision — no obligation.",
    primaryButtonLabel: "Book Free Consultation",
    variant: "default",
  },

  contact: {
    headline: "Get In Touch",
    email: "hello@crossangleinterior.com",
    phone: "+91 93344 09530",
    address:
      "2-G, 2nd Floor, Aditya Signature Building, Dimna Rd, Mango, Jamshedpur – 831012",
    coordinates: { lat: 22.8027, lng: 86.2047 },
  },
}
