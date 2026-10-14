import { useParams, Navigate } from "react-router-dom";
import { useSiteContent } from "@/content/useSiteContent";

/**
 * `/locations/:city` no longer renders a page of its own.
 *
 * Jamshedpur's neighbourhoods are districts of one city, and the regional
 * cities don't yet have the distinct projects, photography or testimonials
 * that would justify separate pages — so all of them live as anchors on
 * `/locations` instead. Redirecting keeps every existing link working.
 *
 * Areas are edited in admin → Website Content → Site Content → Locations page.
 */
const LocationPage = () => {
  const { city } = useParams<{ city: string }>();
  const { bands } = useSiteContent("locations.areas");
  const area = bands.flatMap((band) => band.areas).find((a) => a.slug === city?.toLowerCase());

  return <Navigate to={area ? `/locations#${area.slug}` : "/locations"} replace />;
};

export default LocationPage;
