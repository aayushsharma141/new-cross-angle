import type { ServicesModel } from "@/types/content/models"

/**
 * Services Content Seed
 *
 * Strictly typed against ServicesModel.
 * Note: The services grid itself is dynamically fetched from the API (Supabase).
 * This seed covers the structural shell: hero, process, and CTA.
 */
export const servicesSeed: ServicesModel = {
  hero: {
    variant: "editorial",
    badge: "SERVICES — DESIGN DOMAINS",
    title: "Ultra-Luxury Turnkey Interior Solutions.",
    subtitle:
      "Design intelligence paired with hospitality-grade precision. Every commission is a collaboration — and every result is a space you'll never want to leave.",
    primaryActionLabel: "Explore Domains",
  },

  process: {
    title: "How We Work",
    subtitle:
      "A disciplined four-stage methodology that delivers predictability without sacrificing creativity.",
    steps: [
      {
        number: "01",
        title: "Discovery",
        description:
          "We study your lifestyle, aspirations, and the existing character of the space.",
      },
      {
        number: "02",
        title: "Design & Visualization",
        description:
          "Photorealistic 3D renders approved before execution. Zero ambiguity.",
      },
      {
        number: "03",
        title: "Material Execution",
        description:
          "Precision supervised installation with daily progress accountability.",
      },
      {
        number: "04",
        title: "Handover",
        description:
          "Every detail confirmed — down to art placement — before keys are handed over.",
      },
    ],
  },

  cta: {
    headline: "Begin Your Project",
    description:
      "Book a complimentary 30-minute consultation. We'll explore your space, budget, and vision together.",
    primaryButtonLabel: "Book Consultation",
    variant: "default",
  },
}
