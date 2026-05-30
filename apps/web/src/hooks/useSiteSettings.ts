import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  studio_name: string;
  tagline: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  map_embed_url: string | null;
  business_hours: Record<string, unknown> | null;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  about_video_url: string | null;
  seo_title_template: string | null;
  seo_description: string | null;
  ga_measurement_id: string | null;
  fb_pixel_id: string | null;
  posthog_api_key: string | null;
  posthog_host: string | null;
  admin_email: string | null;
  nav_links: Record<string, unknown>[] | null;
  footer_columns: Record<string, unknown>[] | null;
  social_links: Record<string, string> | null;
  studio_stats: Record<string, number> | null;
  updated_at: string | null;
}

interface UseSiteSettingsResult {
  settings: SiteSettings | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const defaultSettings: SiteSettings = {
  id: "",
  studio_name: "Crossangle Interior",
  tagline: null,
  email: "contact@crossangle.in",
  phone: "+917909041132",
  whatsapp: "917909041132",
  address: "2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango, Jamshedpur, Jharkhand 831012",
  map_embed_url: null,
  business_hours: null,
  logo_light_url: null,
  logo_dark_url: null,
  favicon_url: null,
  og_image_url: null,
  about_video_url: "https://www.youtube.com/embed/gJMCIaI7nKg",
  seo_title_template: "%s | Crossangle Interior",
  seo_description: null,
  ga_measurement_id: null,
  fb_pixel_id: null,
  posthog_api_key: null,
  posthog_host: null,
  admin_email: null,
  nav_links: null,
  footer_columns: null,
  social_links: {
    facebook: "https://www.facebook.com/crossangleinteriors/",
    instagram: "https://www.instagram.com/crossangleinterior/",
    twitter: "https://x.com/CrossangleInt",
    linkedin: "https://www.linkedin.com/company/cross-angle-interior/",
    pinterest: "https://in.pinterest.com/crossangleinterior/",
    youtube: "https://www.youtube.com/",
  },
  studio_stats: {
    yearsExperience: 15,
    happyClients: 500,
    projectsCompleted: 750,
    awardsWon: 25,
  },
  updated_at: null,
};


export function useSiteSettings(): UseSiteSettingsResult {
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          return {
            ...defaultSettings,
            ...data,
            social_links: { ...defaultSettings.social_links, ...(data.social_links as Record<string, string> || {}) },
          } as SiteSettings;
        }
        return defaultSettings;
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error("Error fetching site settings:", err);
        }
        return defaultSettings; // Fallback gracefully
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once
  });

  return {
    settings: settings ?? defaultSettings,
    loading: isLoading,
    error: error as Error | null,
    refetch: () => refetch(),
  };
}
