import {
  HeroContent,
  StoryContent,
  GalleryContent,
  ProcessContent,
  MetricsContent,
  TestimonialsContent,
  CTAContent,
  ContactContent,
} from "./patterns"

/**
 * Content Architecture - Page Models
 * These interfaces define the aggregate payload required for full templates/pages.
 */

export interface HomepageModel {
  hero: HeroContent
  story: StoryContent
  gallery: GalleryContent
  process?: ProcessContent
  metrics?: MetricsContent
  testimonials?: TestimonialsContent
  cta?: CTAContent
  contact?: ContactContent
}

export interface PortfolioModel {
  hero: HeroContent
  gallery: GalleryContent
  cta?: CTAContent
}

export interface CaseStudyModel {
  hero: HeroContent
  specs?: {
    location: string
    year: string
    size: string
    category: string
  }
  story: StoryContent
  gallery: GalleryContent
  nextProjectNav?: {
    title: string
    slug: string
    imageUrl?: string
  }
}

export interface ServicesModel {
  hero: HeroContent
  process?: ProcessContent
  cta?: CTAContent
}

export interface AboutModel {
  hero: HeroContent
  story: StoryContent
  metrics?: MetricsContent
  cta?: CTAContent
}

export interface ContactModel {
  contact: ContactContent
  cta?: CTAContent
}
