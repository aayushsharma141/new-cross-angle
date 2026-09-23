import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Public-safe site settings.
 *
 * Anonymous visitors hold a column-level SELECT grant on `site_settings` that
 * covers exactly PUBLIC_COLUMNS (see
 * supabase/migrations/20260911000000_lock_down_site_settings.sql). A
 * `select("*")` as anon is rejected by Postgres, so public code must always
 * go through this hook, which selects the allow-list explicitly.
 *
 * Adding a public column means updating the GRANT in that migration, the
 * PUBLIC_COLUMNS list, and the interface + defaults below.
 */
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
  /** PostHog *project* token (phc_…). Public by design — it ships in the bundle. */
  posthog_api_key: string | null;
  posthog_host: string | null;
  maintenance_mode_active: boolean | null;
  nav_links: Record<string, unknown>[] | null;
  footer_columns: Record<string, unknown>[] | null;
  social_links: Record<string, string> | null;
  studio_stats: Record<string, number> | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
  footer_text: string | null;
  contact_intro: string | null;
  updated_at: string | null;
}

/**
 * Full configuration row — staff-only columns included.
 * Only the admin dashboard may use this; it never reaches the public site.
 */
export interface AdminSiteSettings extends SiteSettings {
  admin_email: string | null;
  telegram_chat_ids: string[] | null;
  report_recipients: string[] | null;
  is_2fa_enforced: boolean | null;
  session_timeout: number | null;
  rbac_permissions: Record<string, unknown> | null;
  /** Non-secret integration config, e.g. `email_templates`. Never API keys. */
  integrations: Record<string, unknown> | null;
  security_config: Record<string, unknown> | null;
}

interface UseSiteSettingsResult<T extends SiteSettings = SiteSettings> {
  settings: T | null;
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
  maintenance_mode_active: false,
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
  hero_title: null,
  hero_subtitle: null,
  about_text: null,
  footer_text: null,
  contact_intro: null,
  updated_at: null,
};

const defaultAdminSettings: AdminSiteSettings = {
  ...defaultSettings,
  admin_email: null,
  telegram_chat_ids: null,
  report_recipients: null,
  is_2fa_enforced: null,
  session_timeout: null,
  rbac_permissions: null,
  integrations: null,
  security_config: null,
};

/** Must match the anon column GRANT in the lock-down migration. */
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
  "posthog_api_key",
  "posthog_host",
  "maintenance_mode_active",
  "nav_links",
  "footer_columns",
  "social_links",
  "studio_stats",
  "hero_title",
  "hero_subtitle",
  "about_text",
  "footer_text",
  "contact_intro",
  "updated_at",
] as const satisfies readonly (keyof SiteSettings)[];

// postgrest-js can only infer result types from a string *literal*; a joined
// string degrades to GenericStringError. The result is merged into typed
// defaults immediately, so the "*" cast is contained to this call.
const PUBLIC_SELECT = PUBLIC_COLUMNS.join(",") as "*";

function mergeWithDefaults<T extends SiteSettings>(defaults: T, row: Record<string, unknown>): T {
  return {
    ...defaults,
    ...row,
    social_links: {
      ...defaults.social_links,
      ...((row.social_links as Record<string, string>) || {}),
    },
  } as T;
}

function reportFetchError(err: unknown): void {
  if (err instanceof Error && err.name !== "AbortError") {
    console.error("Error fetching site settings:", err);
  }
}

export function useSiteSettings(): UseSiteSettingsResult {
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.siteSettings.public,
    queryFn: async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("site_settings")
          .select(PUBLIC_SELECT)
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        return data ? mergeWithDefaults(defaultSettings, data) : defaultSettings;
      } catch (err: unknown) {
        reportFetchError(err);
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

/**
 * Full settings row for the admin dashboard (security_config, integrations,
 * report recipients, …). RLS restricts this to signed-in staff; for an
 * anonymous caller the query fails and the public defaults are returned.
 */
export function useAdminSiteSettings(): UseSiteSettingsResult<AdminSiteSettings> {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useQuery({
    queryKey: queryKeys.siteSettings.admin,
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

        return data ? mergeWithDefaults(defaultAdminSettings, data) : defaultAdminSettings;
      } catch (err: unknown) {
        reportFetchError(err);
        return defaultAdminSettings;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    settings: settings ?? defaultAdminSettings,
    loading: isLoading,
    error: error as Error | null,
    // Admin writes must also invalidate the public projection, otherwise the
    // AdminLayout/public site keep a stale copy for up to five minutes.
    refetch: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.siteSettings.public });
    },
  };
}
