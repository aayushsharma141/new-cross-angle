/**
 * Public domain types for the portfolio bounded context.
 */

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  location: string;
  type: "residential" | "commercial";
  category: string;
  area: string;
  budget: string;
  duration: string;
  style: string;
  year: number;
  heroImage: string;
  heroAsset?: { url: string; mime_type?: string | null; size_bytes?: number | null };
  coverAsset?: { url: string; mime_type?: string | null; size_bytes?: number | null };
  gallery: { room: string; images: string[] }[];
  brief: string;
  approach: string;
  challengeShort?: string;
  resultShort?: string;
  materials: { name: string; details: string }[];
  testimonial?: { quote: string; author: string; role: string };
}
