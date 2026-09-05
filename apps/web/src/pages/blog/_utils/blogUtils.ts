import { Blog } from "@/lib/api";

export const CRIMSON = "#D4AF37";
export const GOLD = "#C6A15B";

export const CATEGORIES = [
  "All",
  "Modular Kitchens",
  "Luxury Residential",
  "Commercial Fit-outs",
  "False Ceilings",
  "Turnkey Execution",
  "Interior Styling",
];

export const POPULAR_TAGS = [
  "Bespoke Kitchens", "Villa Design", "Corporate Spaces",
  "Lighting & Ceilings", "Materials", "Smart Homes",
];

export const cleanTitle = (title: string) => {
  if (!title) return "";
  let cleaned = title
    .replace(/&#8211;/g, "—")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/\s*[—\-–]\s*Cross Angle Interior\s*$/i, "");
  return cleaned;
};

export const readTime = (post: Blog) => `${Math.max(3, Math.ceil((post.excerpt?.length || 200) / 200))} min`;

export const formatViews = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
