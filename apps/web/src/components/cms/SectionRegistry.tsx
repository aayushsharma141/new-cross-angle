import { lazy } from "react";

// Lazy load components to keep the main bundle size small
const Hero = lazy(() => import("@/components/Hero"));
const Services = lazy(() => import("@/components/Services"));
const Portfolio = lazy(() => import("@/components/Portfolio"));
const CTAContact = lazy(() => import("@/components/CTAContact"));
const About = lazy(() => import("@/components/About"));
const Team = lazy(() => import("@/components/Team"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const Process = lazy(() => import("@/components/Process"));
const FAQ = lazy(() => import("@/components/FAQ"));
const TrustSection = lazy(() => import("@/components/TrustSection"));

export const SectionRegistry: Record<string, React.ComponentType<Record<string, unknown>>> = {
    hero: Hero,
    services: Services,
    portfolio: Portfolio,
    cta: CTAContact,
    about: About,
    team: Team,
    testimonials: Testimonials,
    process: Process,
    faq: FAQ,
    trust: TrustSection,
};
