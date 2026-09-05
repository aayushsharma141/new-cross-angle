import { HomepageModel } from "@/types/content/models"

/**
 * Production Recipe: Homepage
 * This represents a fully valid, strictly typed payload conforming to the Content Architecture.
 * This simulates the exact response we will eventually receive from the CMS (e.g., Supabase).
 */
export const homepageMock: HomepageModel = {
  hero: {
    variant: "editorial",
    badge: "CROSSANGLE INTERIOR ARCHITECTURE",
    title: "Where Light Meets Spatial Logic.",
    subtitle: "We design uncompromising luxury environments where every millimeter serves a distinct architectural purpose.",
    primaryActionLabel: "Explore Portfolio",
    secondaryActionLabel: "Book Consultation",
    imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80",
  },
  story: {
    headline: "We don't decorate rooms. We engineer environments.",
    manifestoText: "Our philosophy is rooted in architectural minimalism and material truth. We believe that true luxury is invisible—it's the absence of friction, the perfection of proportion, and the deliberate shaping of light and shadow.",
    secondaryText: "Founded in 2018, CrossAngle has redefined high-end residential interiors by applying commercial-grade rigor to private spaces.",
    imageUrl1: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80",
    imageUrl2: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80",
    metrics: [
      { value: "40,000", label: "SQFT OF DESIGNED SPACE" },
      { value: "150+", label: "COMPLETED RESIDENCES" },
      { value: "100%", label: "CUSTOM MATERIAL SOURCING" },
    ],
  },
  gallery: {
    title: "Selected Works",
    subtitle: "A curation of our most defining architectural transformations.",
    mode: "dark",
    projects: [
      {
        id: "p1",
        title: "The Glass House",
        location: "Beverly Hills, CA",
        category: "RESIDENTIAL",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
      },
      {
        id: "p2",
        title: "Minimalist Loft",
        location: "Tribeca, NY",
        category: "PENTHOUSE",
        imageUrl: "https://images.unsplash.com/photo-1600607687644-aac4c15a57b4?auto=format&fit=crop&q=80",
      },
      {
        id: "p3",
        title: "Desert Pavilion",
        location: "Scottsdale, AZ",
        category: "ESTATE",
        imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18efc2291?auto=format&fit=crop&q=80",
      },
    ],
  },
  process: {
    title: "The Architecture of Execution",
    subtitle: "A rigorous four-stage methodology ensuring absolute precision from concept to handover.",
    steps: [
      {
        number: "01",
        title: "Spatial Discovery",
        description: "We analyze light pathways, structural constraints, and functional requirements to establish the architectural baseline.",
      },
      {
        number: "02",
        title: "3D Virtual Concept",
        description: "Every millimeter is modeled in high-fidelity 3D, allowing you to experience the spatial flow before a single wall is touched.",
      },
      {
        number: "03",
        title: "Precision Execution",
        description: "Our master craftspeople execute the vision using exact tolerances, managing every aspect of the build phase.",
      },
      {
        number: "04",
        title: "Handover",
        description: "A flawless transition of the completed environment, accompanied by a comprehensive architectural manual.",
      },
    ],
  },
  metrics: {
    metrics: [
      { value: "34", label: "AWARDS WON", trend: "+2" },
      { value: "12", label: "YEARS EXP." },
      { value: "99.8%", label: "CLIENT SATISFACTION" },
    ],
  },
  testimonials: {
    title: "Client Perspectives",
    testimonials: [
      {
        quote: "CrossAngle didn't just redesign our home; they completely re-engineered how we live in it. The attention to spatial flow is unmatched.",
        author: "Sarah Jenkins",
        role: "Homeowner",
        projectScope: "Full Estate Renovation",
        rating: 5,
      },
      {
        quote: "Their 3D visualization process is terrifyingly accurate. The final result looked exactly like the renders, down to the lighting.",
        author: "Michael Chen",
        role: "Tech Executive",
        projectScope: "Penthouse Build",
        rating: 5,
      },
    ],
  },
  cta: {
    headline: "Ready to redefine your space?",
    description: "Our calendar is currently open for Q3 2024 architectural consultations.",
    primaryButtonLabel: "Request Consultation",
    variant: "default",
  },
  contact: {
    headline: "Initiate Spatial Consultation",
    subtitle: "Visit our design studio in Minato, Tokyo or send us your spatial architectural blueprint.",
    email: "consult@crossangle-interior.com",
    phone: "+81 (0)3 5410 8820",
    address: "Minato-ku, Roppongi 7-14-2, Tokyo",
  },
}
