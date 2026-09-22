/**
 * Internal Supabase row shapes — never exported to consumers.
 * All public types live in ../types.ts
 */

export interface SupabaseGalleryItem {
  room_name?: string;
  deprecated_image_url?: string;
  image_url?: string; // kept for backward compat pre-DAM-v3 migration
}

export interface SupabaseMaterialItem {
  name: string;
  details?: string;
}

export interface SupabaseProcessStep {
  step_number: number;
  title: string;
  description: string;
}

export interface SupabaseDesignProcessStep {
  id: string;
  step_number: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  image_url: string;
  timeline_estimate: string;
  budget_range: string;
  client_does: string[];
  we_do: string[];
  deliverables: string[];
}

export interface SupabaseFAQ {
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
  style_tags?: string[];
  featured?: boolean;
  year_completed?: string | number;
  year?: string | number;
  deprecated_cover_image_url?: string;
  deprecated_hero_image?: string;
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
  deprecated_cover_image?: string;
  cover_image?: string;
  created_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any;
  icon?: string;
  short_tag?: string;
  tags?: string[];
  tag?: string;
  deprecated_icon_url?: string;
  icon_url?: string;
  category_id?: string;
  features?: string[];
  service_steps?: SupabaseProcessStep[];
  process_steps?: SupabaseProcessStep[];
  service_faqs?: SupabaseFAQ[];
  faq?: SupabaseFAQ[];
  published_at?: string;
  view_count?: number;
}

export interface AssetVersion {
  url: string;
  mime_type?: string | null;
  size_bytes?: number | null;
}

export interface AssetUsageRecord {
  entity_id: string;
  role: string;
  display_order?: number | null;
  assets?: {
    asset_versions?: AssetVersion[];
  } | null;
}

export interface SupabaseTestimonialItem {
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
