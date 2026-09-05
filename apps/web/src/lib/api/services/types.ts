/**
 * Public types for the testimonials subdomain of services.
 */

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating?: number;
  avatarUrl?: string | null;
  active?: boolean;
}
