export type BlogStatus = "draft" | "review" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown | null;
  cover_image_url: string | null;
  status: string;
  featured: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[] | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string | null;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: BlogStatus;
  featured: boolean;
  seo_title: string;
  seo_description: string;
  tags: string;
  scheduled_at: string;
}
