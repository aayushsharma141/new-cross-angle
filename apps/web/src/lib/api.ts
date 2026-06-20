import { Project } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDetail } from "@repo/types";

// Hero content type no longer necessary as it's hardcoded but kept for signature consistency if used elsewhere, wait, we can remove it.

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

interface SupabaseItem {
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
  style_tags?: string[];
  featured?: boolean;
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
  // Parse description JSON if necessary
  let descJson: Record<string, unknown> = {};
  if (typeof item.description === 'string') {
    try {
      const parsed = JSON.parse(item.description);
      descJson = (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      // Ignore parse errors for older projects without JSON description
    }
  } else {
    descJson = (item.description && typeof item.description === 'object') ? (item.description as Record<string, unknown>) : {};
  }

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

  const heroImageFromDesc = typeof descJson.hero_image_url === 'string' ? descJson.hero_image_url : undefined;

  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title || 'Untitled',
    client: item.client_name || item.client || "Client",
    location: item.location || "Location",
    type: item.type === "commercial" ? "commercial" : "residential",
    category: item.project_categories?.name || item.category || "General",
    area: item.area || "-",
    budget: item.budget || "-",
    duration: item.duration || "-",
    style: (item.style_tags && Array.isArray(item.style_tags) && item.style_tags.length > 0) ? item.style_tags.join(', ') : (item.style || "-"),
    year: Number(item.year_completed || item.year || new Date().getFullYear()),
    heroImage: heroImageFromDesc || item.cover_image_url || item.hero_image || "",
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
  view_count: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating?: number;
  avatarUrl?: string | null;
  active?: boolean;
}

interface SupabaseTestimonialItem {
  id?: string;
  author_name?: string;
  author_role?: string;
  avatar_url?: string | null;
  content?: string;
  rating?: number;
  display_order?: number;
  active?: boolean;
  testimonial_quote?: string;
  client_name?: string;
  name?: string;
  role?: string;
  position?: string;
}

const mapSupabaseToTestimonial = (item: SupabaseTestimonialItem): Testimonial => {
  return {
    id: item.id || Math.random().toString(),
    quote: item.content || item.testimonial_quote || "",
    author: item.author_name || item.client_name || item.name || "Client",
    role: item.author_role || item.role || item.position || "Homeowner",
    rating: item.rating || 5,
    avatarUrl: item.avatar_url || null,
    active: item.active ?? true,
  };
};

const mapSupabaseToServiceDetail = (item: SupabaseItem): ServiceDetail => {
  let descJson: Record<string, unknown> = {};
  if (typeof item.description === 'string') {
    try {
      const parsed = JSON.parse(item.description);
      descJson = (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      console.warn('Failed to parse service description JSON for item:', item.id);
      descJson = {};
    }
  } else {
    descJson = (item.description && typeof item.description === 'object') ? (item.description as Record<string, unknown>) : {};
  }

  const catId = (descJson.category_id as string) || item.category_id || "residential";

  const getString = (val: unknown): string => typeof val === 'string' ? val : '';
  const getStringArray = (val: unknown): string[] => Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

  return {
    id: item.id,
    created_at: item.created_at || new Date().toISOString(),
    title: item.name || item.title || "Unknown Service", // services table has 'name'
    slug: item.slug || item.id,
    description: getString(descJson.content) || getString(item.description) || "",
    icon: getString(descJson.icon) || item.icon || "Home",
    tag: item.short_tag || item.tag,
    hero_image: item.icon_url || item.hero_image || "",
    category_id: catId,
    features: getStringArray(descJson.features) || item.features || [],
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
    if (!supabase) return [];

    try {
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
        console.warn('Error fetching projects from Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        const { projects: localProjects } = await import('@/data/projects');
        return localProjects;
      }

      return data.map(mapSupabaseToProject);
    } catch (e) {
      console.warn('Exception during project fetch:', e);
      return [];
    }
  },

  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            project_gallery (*),
            project_materials (*),
            project_categories (name)
          `)
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (error || !data) {
        const { projects: localProjects } = await import('@/data/projects');
        const localP = localProjects.find(p => p.slug === slug || p.id === slug);
        if (localP) return localP;
        return null;
      }
      return mapSupabaseToProject(data);
    } catch (e) {
      console.warn('Exception during project by slug fetch:', e);
      return null;
    }
  },

  getMinimalProjects: async (): Promise<Partial<Project>[]> => {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, slug, type, location, cover_image_url')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const { projects: localProjects } = await import('@/data/projects');
        return localProjects.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          type: item.type,
          location: item.location,
          heroImage: item.heroImage
        }));
      }
      
      return data.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        type: item.type,
        location: item.location,
        heroImage: item.cover_image_url
      }));
    } catch (e) {
      console.warn('Exception during minimal projects fetch:', e);
      return [];
    }
  },

  getBlogs: async (): Promise<Blog[]> => {
    if (!supabase) return [];
    interface BlogRow {
      id: string;
      title: string | null;
      excerpt: string | null;
      cover_image_url: string | null;
      tags: string[] | null;
      published_at: string | null;
      created_at: string | null;
      slug: string | null;
      content: string | null;
      view_count: number | null;
    }
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }

    return (data || []).map((item: BlogRow) => ({
      id: item.id,
      title: item.title || 'Untitled',
      excerpt: item.excerpt || '',
      image: item.cover_image_url || '',
      category: (item.tags && item.tags.length > 0) ? item.tags[0] : 'Interior Design',
      date: new Date(item.published_at || item.created_at || new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      slug: item.slug || item.id,
      content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
      view_count: item.view_count ?? 0,
    }));
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

  getTestimonials: async (): Promise<Testimonial[]> => {
    if (!supabase) return [];
    
    // First try a dedicated testimonials table
    const { data, error } = await supabase
      .from('testimonials')
      .select('*');
      // Removed .order('created_at') due to schema mismatch
      
    if (!error && data && data.length > 0) {
      return data.map(mapSupabaseToTestimonial);
    }
    
    // Fallback: extract from projects table if testimonials table fails/is empty
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('id, client_name, testimonial_quote, testimonial_role')
      .neq('testimonial_quote', null);
      
    if (!projError && projData) {
      return projData.map((p: Record<string, string>) => ({
        id: p.id,
        quote: p.testimonial_quote || '',
        author: p.client_name || 'Client',
        role: p.testimonial_role || 'Homeowner'
      }));
    }
    
    return [];
  },

  getFeaturedProjects: async (): Promise<Project[]> => {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            project_gallery (*),
            project_materials (*),
            project_categories (name)
          `)
        .eq('featured', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (error) {
        console.warn('Error fetching featured projects:', error);
        return [];
      }

      if (!data || data.length === 0) {
        // Fallback to top 3 projects if no featured ones
        const fallback = await api.getProjects();
        return fallback.slice(0, 3);
      }

      return data.map(mapSupabaseToProject);
    } catch (e) {
      console.warn('Exception during featured project fetch:', e);
      return [];
    }
  },

  // Stub other methods if used by context, or leave empty
  createProject: async (): Promise<Project> => { throw new Error("Read only"); },
  updateProject: async (): Promise<Project> => { throw new Error("Read only"); },
  deleteProject: async (): Promise<void> => { throw new Error("Read only"); }
};
