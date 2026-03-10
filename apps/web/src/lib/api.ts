import { Project, projects as dummyProjects } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDetail } from "@repo/types";

export interface HeroContent {
  badgeText: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
}

interface SupabaseGalleryItem {
  room_name?: string;
  image_url: string;
}

interface SupabaseMaterialItem {
  name: string;
  details?: string;
}

interface SupabaseProcessStep {
  step_number: number;
  title: string;
  description: string;
}

interface SupabaseFAQ {
  display_order: number;
  question: string;
  answer: string;
}

export interface SupabaseItem {
  id: string;
  slug?: string;
  title?: string;
  name?: string;
  client_name?: string;
  client?: string;
  location?: string;
  type?: string;
  project_categories?: { name: string };
  category?: string;
  area?: string;
  budget?: string;
  duration?: string;
  style?: string;
  year_completed?: string | number;
  year?: string | number;
  cover_image_url?: string;
  hero_image?: string;
  project_gallery?: SupabaseGalleryItem[];
  brief?: string;
  approach?: string;
  project_materials?: SupabaseMaterialItem[];
  testimonial_quote?: string;
  testimonial_author?: string;
  testimonial_role?: string;
  excerpt?: string;
  cover_image?: string;
  created_at?: string;
  content?: string;
  description?: string | { content?: string; icon?: string; category_id?: string; features?: string[] };
  icon?: string;
  short_tag?: string;
  tag?: string;
  icon_url?: string;
  category_id?: string;
  features?: string[];
  service_steps?: SupabaseProcessStep[];
  process_steps?: SupabaseProcessStep[];
  service_faqs?: SupabaseFAQ[];
  faq?: SupabaseFAQ[];
}

// Helper to map Supabase Project to Project interface
const mapSupabaseToProject = (item: SupabaseItem): Project => {
  // Group gallery items by room
  const galleryMap = new Map<string, string[]>();
  if (item.project_gallery && Array.isArray(item.project_gallery)) {
    item.project_gallery.forEach((g: SupabaseGalleryItem) => {
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
  const materials = item.project_materials?.map((m: SupabaseMaterialItem) => ({
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
    year: Number(item.year_completed || item.year || new Date().getFullYear()),
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
  // ... existing blog map code below ...
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

const mapSupabaseToBlog = (item: SupabaseItem): Blog => {
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

const mapSupabaseToServiceDetail = (item: SupabaseItem): ServiceDetail => {
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
    features: (descJson && typeof descJson !== 'string' ? descJson.features : undefined) || item.features || [],
    process_steps: (item.service_steps || item.process_steps || []).sort((a: SupabaseProcessStep, b: SupabaseProcessStep) => a.step_number - b.step_number).map((s: SupabaseProcessStep) => ({
      title: s.title,
      description: s.description
    })),
    faq: (item.service_faqs || item.faq || []).sort((a: SupabaseFAQ, b: SupabaseFAQ) => a.display_order - b.display_order).map((f: SupabaseFAQ) => ({
      question: f.question,
      answer: f.answer
    }))
  };
};

export const api = {
  getProjects: async (): Promise<Project[]> => {
    if (!supabase) return dummyProjects;

    // Check if we can reach supabase
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
      console.warn('Error fetching projects, falling back to static data:', error);
      return dummyProjects;
    }

    // If no data is returned from Supabase, return dummy data to avoid blank portfolio sections
    if (!data || data.length === 0) {
      return dummyProjects;
    }

    return data.map(mapSupabaseToProject);
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

  getPageBySlug: async (slug: string) => {
    if (!supabase) return null;

    // Attempt to hit our CDA Edge function directly. If that fails or is not present, we hit DB.
    try {
      const { data, error } = await supabase.functions.invoke('cda-api', {
        body: { path: `/api/page/${slug}` }
      });

      if (data?.data) {
        return data.data; // Edge API usually returns { data: { page, sections } }
      }
    } catch (err) {
      console.warn("CDA edge function failed, falling back to standard DB query:", err)
    }

    // Direct DB fallback
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page', slug)
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (error) {
      console.error(`Error fetching page ${slug}:`, error);
      return null;
    }
    return { sections: data };
  },

  getPreviewPageBySlug: async (slug: string) => {
    if (!supabase) return null;

    // Direct DB query bypassing edge function / cache for preview
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page', slug)
      .order('order_index', { ascending: true });

    if (error) {
      console.error(`Error fetching preview page ${slug}:`, error);
      return null;
    }
    return { sections: data };
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
