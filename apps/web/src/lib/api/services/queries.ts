import { supabase } from "@/integrations/supabase/client";
import { services as staticServices } from "@/config/site-content";
import { ServiceDetail } from "@repo/types";
import { fetchAndStitchDamUsages } from "../_shared/dam-stitcher";
import type {
  SupabaseItem,
  SupabaseTestimonialItem,
  SupabaseProcessStep,
  SupabaseFAQ,
} from "../_shared/supabase-types";
import type { Testimonial } from "./types";

const SERVICE_SLUG_ALIASES: Record<string, string> = {
  hospitality: "restaurant",
  "retail-spaces": "retail",
};

const resolveSlug = (s: string) => SERVICE_SLUG_ALIASES[s] || s;

export const mapSupabaseToTestimonial = (item: SupabaseTestimonialItem): Testimonial => ({
  id: item.id || Math.random().toString(),
  quote: item.content || item.testimonial_quote || "",
  author: item.author_name || item.client_name || item.name || "Client",
  role: item.author_role || item.role || item.position || "Homeowner",
  rating: item.rating || 5,
  avatarUrl: item.avatar_url || null,
  active: item.active ?? true,
});

export const mapSupabaseToServiceDetail = (item: SupabaseItem): ServiceDetail => {
  let descJson: Record<string, unknown> = {};
  if (typeof item.description === "string") {
    try {
      const parsed = JSON.parse(item.description);
      descJson = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      descJson = {};
    }
  } else {
    descJson =
      item.description && typeof item.description === "object"
        ? (item.description as Record<string, unknown>)
        : {};
  }

  const rawSlug = item.slug || item.id;
  const resolved = resolveSlug(rawSlug);
  const staticFallback = staticServices.find(
    (s) => s.slug === resolved || s.id === resolved || s.slug === rawSlug,
  );

  const catId =
    (descJson.category_id as string) ||
    item.category_id ||
    staticFallback?.categoryId ||
    staticFallback?.category_id ||
    "residential";

  const getString = (val: unknown): string => (typeof val === "string" ? val : "");
  const getStringArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((v): v is string => typeof v === "string") : [];

  const parsedFeatures = getStringArray(descJson.features) || item.features || [];
  const parsedSteps = (item.service_steps || item.process_steps || [])
    .sort((a: SupabaseProcessStep, b: SupabaseProcessStep) => a.step_number - b.step_number)
    .map((s: SupabaseProcessStep) => ({ title: s.title, description: s.description }));
  const parsedFaqs = (item.service_faqs || item.faq || [])
    .sort((a: SupabaseFAQ, b: SupabaseFAQ) => a.display_order - b.display_order)
    .map((f: SupabaseFAQ) => ({ question: f.question, answer: f.answer }));

  return {
    id: item.id,
    created_at: item.created_at || new Date().toISOString(),
    title: item.name || item.title || staticFallback?.title || "Unknown Service",
    slug: resolved,
    description:
      getString(descJson.content) ||
      getString(item.description) ||
      staticFallback?.description ||
      "",
    longDescription: staticFallback?.longDescription,
    icon: getString(descJson.icon) || item.icon || "Home",
    tag: item.short_tag || item.tag,
    hero_image: item.icon_url || item.hero_image || staticFallback?.heroImage || staticFallback?.hero_image || "",
    galleryImages: staticFallback?.galleryImages,
    category_id: catId,
    features: parsedFeatures.length > 0 ? parsedFeatures : staticFallback?.features || [],
    process_steps:
      parsedSteps.length > 0
        ? parsedSteps
        : staticFallback?.processSteps || staticFallback?.process_steps || [],
    faq: parsedFaqs.length > 0 ? parsedFaqs : staticFallback?.faq || [],
    relatedServices: staticFallback?.relatedServices || [],
  };
};

export const servicesApi = {
  getServices: async (): Promise<ServiceDetail[]> => {
    let dbServices: ServiceDetail[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(
            `
            *,
            service_steps (*),
            service_faqs (*)
          `,
          )
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const itemsWithDam = await fetchAndStitchDamUsages(data, "service");
          dbServices = itemsWithDam.map(mapSupabaseToServiceDetail);
        }
      } catch (e) {
        console.warn("Error fetching services from DB, using fallback:", e);
      }
    }

    const mappedStatic: ServiceDetail[] = staticServices.map((s) => ({
      id: s.id,
      created_at: new Date().toISOString(),
      title: s.title,
      slug: s.slug,
      description: s.description,
      longDescription: s.longDescription,
      hero_image: s.heroImage || s.hero_image || "",
      galleryImages: s.galleryImages,
      category_id: s.categoryId || s.category_id || "residential",
      features: s.features,
      process_steps: s.processSteps || s.process_steps || [],
      faq: s.faq,
      relatedServices: s.relatedServices,
    }));

    if (dbServices.length === 0) return mappedStatic;

    const dbSlugs = new Set(dbServices.map((s) => s.slug));
    const missingStatic = mappedStatic.filter((s) => !dbSlugs.has(s.slug));
    return [...dbServices, ...missingStatic];
  },

  getServiceBySlug: async (slug: string): Promise<ServiceDetail | null> => {
    const resolvedSlug = resolveSlug(slug);
    let dbResult: ServiceDetail | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(
            `
            *,
            service_steps (*),
            service_faqs (*)
          `,
          )
          .or(`slug.eq.${slug},slug.eq.${resolvedSlug},id.eq.${slug}`)
          .maybeSingle();

        if (!error && data) {
          const itemsWithDam = await fetchAndStitchDamUsages([data], "service");
          dbResult = mapSupabaseToServiceDetail(itemsWithDam[0]);
        }
      } catch (e) {
        console.warn("Exception during getServiceBySlug:", e);
      }
    }

    if (dbResult) return dbResult;

    const staticItem = staticServices.find(
      (s) => s.slug === resolvedSlug || s.id === resolvedSlug || s.slug === slug,
    );
    if (!staticItem) return null;

    return {
      id: staticItem.id,
      created_at: new Date().toISOString(),
      title: staticItem.title,
      slug: staticItem.slug,
      description: staticItem.description,
      longDescription: staticItem.longDescription,
      hero_image: staticItem.heroImage || staticItem.hero_image || "",
      galleryImages: staticItem.galleryImages,
      category_id: staticItem.categoryId || staticItem.category_id || "residential",
      features: staticItem.features,
      process_steps: staticItem.processSteps || staticItem.process_steps || [],
      faq: staticItem.faq,
      relatedServices: staticItem.relatedServices,
    };
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase.from("testimonials").select("*");

    if (!error && data && data.length > 0) {
      return data.map(mapSupabaseToTestimonial);
    }

    // Fallback: extract from projects table if testimonials table fails/is empty
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: projData, error: projError } = await (supabase as any)
      .from("projects")
      .select("id, client_name, testimonial_quote, testimonial_role")
      .neq("testimonial_quote", null);

    if (!projError && projData) {
      return (projData as any[]).map((p: Record<string, string>) => ({
        id: p.id,
        quote: p.testimonial_quote || "",
        author: p.client_name || "Client",
        role: p.testimonial_role || "Homeowner",
      }));
    }

    return [];
  },
};
