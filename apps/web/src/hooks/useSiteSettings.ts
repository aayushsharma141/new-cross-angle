import { useState, useEffect } from "react";
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
  admin_email: string | null;
  nav_links: Record<string, unknown>[] | null;
  footer_columns: Record<string, unknown>[] | null;
  social_links: Record<string, string> | null;
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
  updated_at: null,
};


export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
          social_links: { ...defaultSettings.social_links, ...(data.social_links as Record<string, string> || {}) },
        } as SiteSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error("Error fetching site settings:", err);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}
