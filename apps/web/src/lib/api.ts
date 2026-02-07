import { Project } from "@/data/projects";
import { supabase } from "@/lib/supabase";
import { ServiceDetail, ProcessStep, FAQItem } from "@repo/types";

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
    client: item.client || "Client",
    location: item.location || "Location",
    type: item.type === "commercial" ? "commercial" : "residential",
    category: item.category || "General",
    area: item.area || "-",
    budget: item.budget || "-",
    duration: item.duration || "-",
    style: item.style || "-",
    year: item.year || new Date().getFullYear(),
    heroImage: item.hero_image || "",
    gallery: gallery,
    brief: item.brief || item.description || "",
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
  return {
    id: item.id,
    created_at: item.created_at,
    title: item.title,
    slug: item.slug || item.id, // Fallback to ID if no slug
    description: item.description || "",
    icon: item.icon || "Home",
    tag: item.tag,
    hero_image: item.hero_image || "",
    category_id: item.category_id || "general",
    // Handle JSONB fields safely
    features: Array.isArray(item.features) ? item.features : [],
    process_steps: Array.isArray(item.process_steps) ? item.process_steps : [],
    faq: Array.isArray(item.faq) ? item.faq : []
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
          project_materials (*)
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
      .eq('published', true)
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
      .select('*')
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
      .select('*')
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
    const { data: rawData, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section_key', 'hero')
      .single();

    // Cast to any to bypass strict mapped type checks on Json/null fields for now
    const data = rawData as any;

    if (error || !data) {
      return {
        badgeText: "Premier Interior Design Studio",
        headlineLine1: "Elevate Your Space",
        headlineLine2: "Into Luxury",
        subtitle: "Transforming your vision..."
      };
    }

    return {
      badgeText: data.metadata?.badgeText || "Premier Interior Design Studio",
      headlineLine1: data.title || "Elevate Your Space",
      headlineLine2: data.metadata?.headlineLine2 || "Into Luxury",
      subtitle: data.subtitle || "Transforming your vision..."
    };
  },

  // Stub other methods if used by context, or leave empty
  createProject: async (_project: Omit<Project, "id">): Promise<Project> => { throw new Error("Read only"); },
  updateProject: async (_id: string, _updates: Partial<Project>): Promise<Project> => { throw new Error("Read only"); },
  deleteProject: async (_id: string): Promise<void> => { throw new Error("Read only"); },
  updateHeroContent: async (_content: Partial<HeroContent>): Promise<HeroContent> => { throw new Error("Read only"); }
};
