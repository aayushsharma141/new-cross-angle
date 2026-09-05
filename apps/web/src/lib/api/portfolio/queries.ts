import { supabase } from "@/integrations/supabase/client";
import { fetchAndStitchDamUsages } from "../_shared/dam-stitcher";
import { mapSupabaseToProject } from "./mappers";
import { staticProjects } from "./static-data";
import type { Project } from "./types";

export const portfolioApi = {
  getProjects: async (): Promise<Project[]> => {
    let dbProjects: Project[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            *,
            project_gallery (*),
            project_materials (*),
            project_categories (name)
          `,
          )
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const itemsWithDam = await fetchAndStitchDamUsages(data, "project");
          dbProjects = itemsWithDam.map(mapSupabaseToProject);
        }
      } catch (e) {
        console.warn("Exception during project fetch:", e);
      }
    }

    if (dbProjects.length === 0) return staticProjects;

    const dbSlugs = new Set(dbProjects.map((p) => p.slug));
    const missingStatic = staticProjects.filter((sp) => !dbSlugs.has(sp.slug));
    return [...dbProjects, ...missingStatic];
  },

  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            *,
            project_gallery (*),
            project_materials (*),
            project_categories (name)
          `,
          )
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle();

        if (!error && data) {
          const itemsWithDam = await fetchAndStitchDamUsages([data], "project");
          return mapSupabaseToProject(itemsWithDam[0]);
        }
      } catch (e) {
        console.warn("Exception during project by slug fetch:", e);
      }
    }

    const staticProject = staticProjects.find((p) => p.slug === slug || p.id === slug);
    return staticProject || null;
  },

  getMinimalProjects: async (): Promise<Partial<Project>[]> => {
    const allProjects = await portfolioApi.getProjects();
    return allProjects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
      location: p.location,
      heroImage: p.heroImage,
    }));
  },

  getFeaturedProjects: async (): Promise<Project[]> => {
    let dbFeatured: Project[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            *,
            project_gallery (*),
            project_materials (*),
            project_categories (name)
          `,
          )
          .eq("featured", true)
          .order("display_order", { ascending: true })
          .limit(3);

        if (!error && data && data.length > 0) {
          const itemsWithDam = await fetchAndStitchDamUsages(data, "project");
          dbFeatured = itemsWithDam.map(mapSupabaseToProject);
        }
      } catch (e) {
        console.warn("Exception during featured project fetch:", e);
      }
    }

    if (dbFeatured.length > 0) return dbFeatured;
    const all = await portfolioApi.getProjects();
    return all.slice(0, 3);
  },

  // Write stubs — this context is currently read-only
  createProject: async (): Promise<Project> => {
    throw new Error("Read only");
  },
  updateProject: async (): Promise<Project> => {
    throw new Error("Read only");
  },
  deleteProject: async (): Promise<void> => {
    throw new Error("Read only");
  },
};
