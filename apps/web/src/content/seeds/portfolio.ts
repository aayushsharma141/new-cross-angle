import type { PortfolioModel } from "@/types/content/models"

/**
 * Portfolio Content Seed
 *
 * Strictly typed against PortfolioModel.
 */
export const portfolioSeed: PortfolioModel = {
  hero: {
    variant: "editorial",
    badge: "PORTFOLIO — SELECTED WORKS",
    title: "An Archive of Considered Interiors.",
    subtitle:
      "Every project in this collection was built to a single standard: that the space should feel inevitable. Not decorated. Designed.",
    primaryActionLabel: "Inquire About a Project",
  },

  gallery: {
    title: "All Projects",
    subtitle: "Filter by typology, location, or material palette.",
    mode: "grid",
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
      {
        id: "telco-villa",
        title: "Telco Villa Renovation",
        location: "Telco, Jamshedpur",
        imageUrl: "/hero_reality_render_1775299733746.png",
        category: "Residential",
      },
      {
        id: "adityapur-clinic",
        title: "Adityapur Medical Clinic",
        location: "Adityapur",
        imageUrl: "/hero_reality_render_1775299733746.png",
        category: "Commercial",
      },
    ],
  },

  cta: {
    headline: "Have a Project in Mind?",
    description:
      "We work with a limited number of clients each year to ensure every project receives our full attention.",
    primaryButtonLabel: "Start a Project",
    variant: "default",
  },
}
