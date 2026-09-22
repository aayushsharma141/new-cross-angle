/**
 * Public types for the blog bounded context.
 */

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
