/**
 * api/index.ts — Master backward-compatible barrel
 *
 * All 24 existing import sites use `@/lib/api` — this file keeps them working
 * without any changes while the implementation is now split into bounded contexts.
 *
 * Import paths:
 *   import { api } from "@/lib/api"              ← unchanged
 *   import { type Project } from "@/lib/api"     ← unchanged
 *   import { Blog } from "@/lib/api"             ← unchanged
 */

// Re-export all public types from each bounded context
export type { Project } from "./portfolio";
export type { Blog } from "./blog";
export type { Testimonial } from "./services";
export type { ProcessStage, ProcessFAQ, ProcessMetric } from "./process";

// Re-export static data (used by a few admin pages)
export { staticProjects } from "./portfolio";

// Compose the unified `api` object that matches the original api.ts surface exactly
import { portfolioApi } from "./portfolio";
import { blogApi } from "./blog";
import { servicesApi } from "./services";
import { processApi } from "./process";

export const api = {
  // Portfolio
  getProjects: portfolioApi.getProjects,
  getProjectBySlug: portfolioApi.getProjectBySlug,
  getMinimalProjects: portfolioApi.getMinimalProjects,
  getFeaturedProjects: portfolioApi.getFeaturedProjects,
  createProject: portfolioApi.createProject,
  updateProject: portfolioApi.updateProject,
  deleteProject: portfolioApi.deleteProject,

  // Blog
  getBlogs: blogApi.getBlogs,

  // Services + Testimonials
  getServices: servicesApi.getServices,
  getServiceBySlug: servicesApi.getServiceBySlug,
  getTestimonials: servicesApi.getTestimonials,

  // Process
  getProcessStages: processApi.getProcessStages,
  getProcessFAQs: processApi.getProcessFAQs,
  getProcessMetrics: processApi.getProcessMetrics,
};
