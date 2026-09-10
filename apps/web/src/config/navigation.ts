import { Home, Building2, Sofa, UtensilsCrossed, Lamp } from "lucide-react";

export const servicesMenu = {
  residential: [
    { name: "Living Room Design", href: "/services/residential/living-room", description: "Elegant spaces for daily living", icon: Sofa },
    { name: "Bedroom Interior", href: "/services/residential/bedroom", description: "Peaceful sanctuaries for rest", icon: Home },
    { name: "Kitchen & Dining", href: "/services/residential/kitchen", description: "Heart of your home", icon: UtensilsCrossed },
  ],
  commercial: [
    { name: "Office Design", href: "/services/commercial/office", description: "Productive work environments", icon: Building2 },
    { name: "Retail Spaces", href: "/services/commercial/retail", description: "Engaging customer experiences", icon: Building2 },
    { name: "Restaurant & Cafe", href: "/services/commercial/hospitality", description: "Memorable dining atmospheres", icon: UtensilsCrossed },
  ],
  specialized: [
    { name: "Modular Kitchen", href: "/services/specialized/modular-kitchens", description: "Factory-finished, quick install", icon: UtensilsCrossed, badge: "Popular" },
    { name: "False Ceiling", href: "/services/specialized/ceilings", description: "Architectural elegance", icon: Lamp }
  ],
};

export const navLinks: { name: string; href: string; hasMegaMenu?: boolean }[] = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services", hasMegaMenu: true },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Gallery", href: "/gallery" },
  { name: "Process", href: "/our-process" },
  { name: "About", href: "/about-us" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact-us" },
];
