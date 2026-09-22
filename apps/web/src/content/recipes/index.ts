import type {
  HomepageModel,
  PortfolioModel,
  CaseStudyModel,
  ServicesModel,
  AboutModel,
  ContactModel,
} from "@/types/content/models"

/**
 * Content Architecture — Composition Recipes
 *
 * A Recipe declares:
 * - Which Template a page uses
 * - Which pattern slots are required vs optional
 * - The Model type it is typed against
 *
 * This is the canonical source of truth for page composition.
 * No production page should render pattern slots that are not declared here.
 */

export interface Recipe<T> {
  /** The Template component this recipe maps to */
  template: string
  /** The TypeScript model type */
  modelType: string
  /** Pattern slots that MUST be populated */
  required: (keyof T)[]
  /** Pattern slots that are optional */
  optional: (keyof T)[]
  /** Migration sprint order (1 = highest priority) */
  migrationSprint: number
}

export const HomepageRecipe: Recipe<HomepageModel> = {
  template: "LandingTemplate",
  modelType: "HomepageModel",
  required: ["hero", "story", "gallery"],
  optional: ["process", "metrics", "testimonials", "cta", "contact"],
  migrationSprint: 1,
}

export const PortfolioRecipe: Recipe<PortfolioModel> = {
  template: "PortfolioTemplate",
  modelType: "PortfolioModel",
  required: ["hero", "gallery"],
  optional: ["cta"],
  migrationSprint: 2,
}

export const CaseStudyRecipe: Recipe<CaseStudyModel> = {
  template: "CaseStudyTemplate",
  modelType: "CaseStudyModel",
  required: ["hero", "story", "gallery"],
  optional: ["specs", "nextProjectNav"],
  migrationSprint: 3,
}

export const ServicesRecipe: Recipe<ServicesModel> = {
  template: "ServicesTemplate",
  modelType: "ServicesModel",
  required: ["hero"],
  optional: ["process", "cta"],
  migrationSprint: 4,
}

export const AboutRecipe: Recipe<AboutModel> = {
  template: "AboutTemplate",
  modelType: "AboutModel",
  required: ["hero", "story"],
  optional: ["metrics", "cta"],
  migrationSprint: 5,
}

export const ContactRecipe: Recipe<ContactModel> = {
  template: "ContactTemplate",
  modelType: "ContactModel",
  required: ["contact"],
  optional: ["cta"],
  migrationSprint: 6,
}

/** All recipes ordered by migration priority */
export const ALL_RECIPES = [
  HomepageRecipe,
  PortfolioRecipe,
  CaseStudyRecipe,
  ServicesRecipe,
  AboutRecipe,
  ContactRecipe,
]
