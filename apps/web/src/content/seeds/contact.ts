import type { ContactModel } from "@/types/content/models"

/**
 * Contact Content Seed
 *
 * Strictly typed against ContactModel.
 */
export const contactSeed: ContactModel = {
  contact: {
    headline: "Start the Conversation",
    email: "hello@crossangleinterior.com",
    phone: "+91 93344 09530",
    address:
      "2-G, 2nd Floor, Aditya Signature Building, Dimna Rd, Mango, Jamshedpur – 831012",
    coordinates: { lat: 22.8027, lng: 86.2047 },
  },

  cta: {
    headline: "Book a Free Consultation",
    description:
      "30 minutes. No obligation. We'll walk through your brief, budget, and vision — and tell you honestly whether we're the right fit.",
    primaryButtonLabel: "Schedule a Call",
    variant: "default",
  },
}
