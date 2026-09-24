import { useParams, Navigate } from "react-router-dom";
import { findArea } from "@/config/service-area";

/**
 * `/locations/:city` no longer renders a page of its own.
 *
 * Jamshedpur's neighbourhoods are districts of one city, and the regional
 * cities don't yet have the distinct projects, photography or testimonials
 * that would justify separate pages — so all of them live as anchors on
 * `/locations` instead. Redirecting keeps every existing link working.
 *
 * Give an area `hasOwnPage: true` in `config/service-area.ts` (and add a route)
 * once it has enough of its own content to stand alone.
 */
const LocationPage = () => {
  const { city } = useParams<{ city: string }>();
  const area = findArea(city);

  return <Navigate to={area ? `/locations#${area.slug}` : "/locations"} replace />;
};

export default LocationPage;
