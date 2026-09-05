import type { AboutModel } from "@/types/content/models"

/**
 * About Content Seed
 *
 * Strictly typed against AboutModel.
 */
export const aboutSeed: AboutModel = {
  hero: {
    variant: "manifesto",
    badge: "ABOUT — THE STUDIO",
    title: "We Build Spaces That Work\nFor How You Actually Live.",
    subtitle:
      "Crossangle Interior Architecture is a Jamshedpur-based design studio specialising in turn-key residential and commercial interiors built around your lifestyle — not around convention.",
  },

  story: {
    headline: "The Studio Philosophy",
    manifestoText:
      "We don't apply formulas. Every project starts from first principles — your routine, your material preferences, your light, your family. The result is a home that could only have been designed for you.",
    secondaryText:
      "Our process is disciplined: we finalize drawings and material selections before execution begins, so the build phase is smooth, predictable, and free from costly change orders. Precision is not a premium feature. It is our baseline.",
    imageUrl1: "/hero_reality_render_1775299733746.png",
    metrics: [
      { value: "8+", label: "Years Operating" },
      { value: "150+", label: "Projects Completed" },
      { value: "Jamshedpur", label: "Headquarters" },
    ],
  },

  metrics: {
    title: "The Studio in Numbers",
    metrics: [
      { value: "150+", label: "Projects Delivered" },
      { value: "4.9/5", label: "Client Satisfaction Score" },
      { value: "98%", label: "On-Time Completion Rate" },
      { value: "45–75 Days", label: "Average Project Duration" },
    ],
  },

  cta: {
    headline: "Let's Build Something Together",
    description:
      "Whether it's a full home renovation or a single room reimagined — we bring the same rigour and care to every brief.",
    primaryButtonLabel: "Start a Conversation",
    variant: "default",
  },
}
