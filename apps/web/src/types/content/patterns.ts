/**
 * Content Architecture - Pattern Contracts
 * These interfaces define the strict data payload that the CMS must provide
 * to populate the pattern library. They contain NO behavioral logic (like onClick handlers).
 */

export interface HeroContent {
  variant?: "editorial" | "split" | "manifesto" | "gallery"
  badge?: string
  title: string
  subtitle?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
  imageUrl?: string
}

export interface StoryContent {
  headline: string
  manifestoText: string
  secondaryText?: string
  imageUrl1?: string
  imageUrl2?: string
  metrics?: Array<{ value: string; label: string }>
}

export interface GalleryContent {
  title: string
  subtitle?: string
  mode?: "grid" | "dark"
  projects: Array<{
    id: string
    title: string
    location: string
    imageUrl?: string
    category?: string
  }>
}

export interface ProcessContent {
  title: string
  subtitle?: string
  steps: Array<{
    number: string
    title: string
    description: string
  }>
}

export interface MetricsContent {
  title?: string
  metrics: Array<{ value: string; label: string; trend?: string }>
}

export interface CTAContent {
  headline: string
  description: string
  primaryButtonLabel: string
  variant?: "default" | "newsletter"
}

export interface TestimonialsContent {
  title: string
  testimonials: Array<{
    quote: string
    author: string
    role: string
    rating?: number
    projectScope?: string
  }>
}

export interface ContactContent {
  headline: string
  email: string
  phone: string
  address: string
  coordinates?: { lat: number; lng: number }
}
