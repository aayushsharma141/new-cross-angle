import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Columns anonymous visitors may read from `site_settings`.
 *
 * Migration 20260911000000_lock_down_site_settings.sql replaced the table-wide
 * anon SELECT with a column-level GRANT. A `select("*")` as anon is now
 * rejected by Postgres (401 from PostgREST), so the public site must name the
 * allow-listed columns explicitly. Authenticated staff keep the full row via
 * RLS and continue to use `select("*")`.
 *
 * Keep this list a subset of the GRANT in that migration.
 */
const PUBLIC_COLUMNS = [
  "id",
  "studio_name",
  "tagline",
  "email",
  "phone",
  "whatsapp",
  "address",
  "map_embed_url",
  "business_hours",
  "logo_light_url",
  "logo_dark_url",
  "company_logo_url",
  "favicon_url",
  "og_image_url",
  "about_video_url",
  "seo_title_template",
  "seo_description",
  "ga_measurement_id",
  "fb_pixel_id",
  "maintenance_mode_active",
  "nav_links",
  "footer_columns",
  "social_links",
  "studio_stats",
  "updated_at",
] as const;

const PUBLIC_SELECT = PUBLIC_COLUMNS.join(",");

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
  company_logo_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  about_video_url: string | null;
  seo_title_template: string | null;
  seo_description: string | null;
  ga_measurement_id: string | null;
  fb_pixel_id: string | null;
  posthog_api_key: string | null;
  posthog_host: string | null;
  resend_api_key: string | null;
  supabase_api_key: string | null;
  vercel_api_key: string | null;
  maintenance_mode_active: boolean | null;
  admin_email: string | null;
  nav_links: Record<string, unknown>[] | null;
  footer_columns: Record<string, unknown>[] | null;
  social_links: Record<string, string> | null;
  studio_stats: Record<string, number> | null;
  integrations: Record<string, unknown> | null;
  security_config?: Record<string, unknown> | null;
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
  company_logo_url: null,
  favicon_url: null,
  og_image_url: null,
  about_video_url: "https://www.youtube.com/embed/gJMCIaI7nKg",
  seo_title_template: "%s | Crossangle Interior",
  seo_description: null,
  ga_measurement_id: null,
  fb_pixel_id: null,
  posthog_api_key: null,
  posthog_host: null,
  resend_api_key: null,
  supabase_api_key: null,
  vercel_api_key: null,
  maintenance_mode_active: false,
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
  integrations: null,
  updated_at: null,
};


export function useSiteSettings(): UseSiteSettingsResult {
  const queryClient = useQueryClient();

  // The row we may read depends on whether the visitor is signed in. When that
  // changes (login/logout), drop the cached settings so the next read uses the
  // right column set instead of serving a stale anon/staff result for 5 minutes.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data, error: fetchError } = await supabase
          .from("site_settings")
          .select(session ? "*" : PUBLIC_SELECT)
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          // The column list is chosen at runtime, so the row type is a union;
          // treat it as a partial settings row and let defaults fill the rest.
          const row = data as unknown as Partial<SiteSettings>;
          return {
            ...defaultSettings,
            ...row,
            social_links: { ...defaultSettings.social_links, ...((row.social_links as Record<string, string>) || {}) },
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
