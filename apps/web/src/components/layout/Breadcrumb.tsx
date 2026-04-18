import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Dynamic breadcrumb navigation.
 * - Hidden on the root page (`/`).
 * - Visible on all subpages, accurately reflecting the user's path.
 * - Handles nested routes like `/blog/post-name`, `/services/modular-kitchens`, `/portfolio/project-slug`.
 */

// Human-readable labels for known route segments
const SEGMENT_LABELS: Record<string, string> = {
  "about-us": "About",
  "contact-us": "Contact",
  "style-quiz": "Style Quiz",
  blog: "Blog",
  services: "Services",
  portfolio: "Projects",
  gallery: "Gallery",
  estimate: "Estimate",
  blueprint: "Blueprint",
  privacy: "Privacy Policy",
  admin: "Admin",
};

// Format a URL segment into a readable label
const formatSegment = (segment: string): string => {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];

  // Convert slug format (e.g. "my-blog-post") to title case
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Breadcrumb() {
  const location = useLocation();

  // Don't render on root page
  if (location.pathname === "/") return null;

  const segments = location.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // Build breadcrumb items with cumulative paths
  const crumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label = formatSegment(segment);

    return { label, path, isLast };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full pt-20 pb-0 relative z-30"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
          {/* Home link */}
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              <Home className="w-3 h-3" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>

          {crumbs.map((crumb) => (
            <li key={crumb.path} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
              {crumb.isLast ? (
                <span
                  className="text-[#C41230] font-semibold truncate max-w-[200px]"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-white/40 hover:text-white/70 transition-colors duration-200 truncate max-w-[160px]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
