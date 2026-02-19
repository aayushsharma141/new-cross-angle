import { Project } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDetail } from "@repo/types";

export interface HeroContent {
  badgeText: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
}

// Helper to map Supabase Project to Project interface
const mapSupabaseToProject = (item: any): Project => {
  // Group gallery items by room
  const galleryMap = new Map<string, string[]>();
  if (item.project_gallery && Array.isArray(item.project_gallery)) {
    item.project_gallery.forEach((g: any) => {
      const room = g.room_name || "General";
      if (!galleryMap.has(room)) {
        galleryMap.set(room, []);
      }
      galleryMap.get(room)?.push(g.image_url);
    });
  }

  const gallery = Array.from(galleryMap.entries()).map(([room, images]) => ({
    room,
    images
  }));

  // Map materials
  const materials = item.project_materials?.map((m: any) => ({
    name: m.name,
    details: m.details || ""
  })) || [];

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    client: item.client_name || item.client || "Client",
    location: item.location || "Location",
    type: item.type === "commercial" ? "commercial" : "residential",
    category: item.project_categories?.name || item.category || "General",
    area: item.area || "-",
    budget: item.budget || "-",
    duration: item.duration || "-",
    style: item.style || "-", // Check if style_tags is used instead
    year: item.year_completed || item.year || new Date().getFullYear(),
    heroImage: item.cover_image_url || item.hero_image || "",
    gallery: gallery,
    brief: item.brief || "",
    approach: item.approach || "",
    materials: materials,
    testimonial: item.testimonial_quote ? {
      quote: item.testimonial_quote,
      author: item.testimonial_author || "Client",
      role: item.testimonial_role || "Homeowner"
    } : undefined
  };
};

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  slug: string;
  content?: string;
}

// Re-export or use from @repo/types
export type { ServiceDetail };

const mapSupabaseToBlog = (item: any): Blog => {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt || "",
    image: item.cover_image || "",
    category: "Interior Design", // Default for now, as schema doesn't have category yet
    date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    slug: item.slug,
    content: item.content
  };
};

const mapSupabaseToServiceDetail = (item: any): ServiceDetail => {
  // Parse description if it's a string (JSONB)
  const descJson = typeof item.description === 'string'
    ? JSON.parse(item.description)
    : item.description || {};

  return {
    id: item.id,
    created_at: item.created_at,
    title: item.name || item.title, // services table has 'name'
    slug: item.slug || item.id,
    description: descJson.content || item.description || "",
    icon: descJson.icon || item.icon || "Home",
    tag: item.short_tag || item.tag,
    hero_image: item.icon_url || item.hero_image || "",
    category_id: descJson.category_id || item.category_id || "residential",
    // Handle JSONB fields safely and joined relations
    features: descJson.features || item.features || [],
    process_steps: (item.service_steps || item.process_steps || []).sort((a: any, b: any) => a.step_number - b.step_number).map((s: any) => ({
      title: s.title,
      description: s.description
    })),
    faq: (item.service_faqs || item.faq || []).sort((a: any, b: any) => a.display_order - b.display_order).map((f: any) => ({
      question: f.question,
      answer: f.answer
    }))
  };
};

export const api = {
  getProjects: async (): Promise<Project[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('projects')
      .select(`
          *,
          project_gallery (*),
          project_materials (*),
          project_categories (name)
        `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return (data || []).map(mapSupabaseToProject);
  },

  getBlogs: async (): Promise<Blog[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }

    return (data || []).map(mapSupabaseToBlog);
  },

  getServices: async (): Promise<ServiceDetail[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        service_steps (*),
        service_faqs (*)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return (data || []).map(mapSupabaseToServiceDetail);
  },

  getServiceBySlug: async (slug: string): Promise<ServiceDetail | null> => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        service_steps (*),
        service_faqs (*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return mapSupabaseToServiceDetail(data);
  },

  getHeroContent: async (): Promise<HeroContent> => {
    if (!supabase) {
      return {
        badgeText: "Premier Interior Design Studio",
        headlineLine1: "Elevate Your Space",
        headlineLine2: "Into Luxury",
        subtitle: "Transforming your vision..."
      };
    }

    try {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page', 'home')
        .eq('section_key', 'hero')
        .maybeSingle();

      if (error) {
        console.error("Error fetching hero content:", error);
        return {
          badgeText: "Premier Interior Design Studio",
          headlineLine1: "Elevate Your Space",
          headlineLine2: "Into Luxury",
          subtitle: "Transforming your vision into exquisite living spaces."
        };
      }

      if (!data) {
        return {
          badgeText: "Premier Interior Design Studio",
          headlineLine1: "Elevate Your Space",
          headlineLine2: "Into Luxury",
          subtitle: "Transforming your vision into exquisite living spaces."
        };
      }

      // Safe access for extra/metadata
      const extra = typeof data.extra === 'object' ? data.extra : {};

      return {
        badgeText: extra?.badge_text || "Premier Interior Design Studio",
        headlineLine1: data.title || "Elevate Your Space",
        headlineLine2: extra?.headline_line_2 || "Into Luxury",
        subtitle: data.subtitle || data.body || "Transforming your vision into exquisite living spaces."
      };
    } catch (e) {
      console.error("Exception in getHeroContent:", e);
      return {
        badgeText: "Premier Interior Design Studio",
        headlineLine1: "Elevate Your Space",
        headlineLine2: "Into Luxury",
        subtitle: "Transforming your vision into exquisite living spaces."
      };
    }
  },

  // Stub other methods if used by context, or leave empty
  createProject: async (_project: Omit<Project, "id">): Promise<Project> => { throw new Error("Read only"); },
  updateProject: async (_id: string, _updates: Partial<Project>): Promise<Project> => { throw new Error("Read only"); },
  deleteProject: async (_id: string): Promise<void> => { throw new Error("Read only"); },
  updateHeroContent: async (_content: Partial<HeroContent>): Promise<HeroContent> => { throw new Error("Read only"); }
};
