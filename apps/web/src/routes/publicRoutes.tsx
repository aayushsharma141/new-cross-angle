import { Navigate, Route } from "react-router-dom";
import { lazy } from "react";
import PageTransition from "@/components/layout/PageTransition";

const Index = lazy(() => import("@/pages/Index"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const ServiceCategoryPage = lazy(() => import("@/pages/ServiceCategoryPage"));
const ServiceDetailPage = lazy(() => import("@/pages/ServiceDetailPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const ProjectHubPage = lazy(() => import("@/pages/ProjectHubPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ProjectPage = lazy(() => import("@/pages/ProjectPage"));
const CostEstimatorPage = lazy(() => import("@/addons/calculators/pages/PriceEstimator"));
const DiscoveryPage = lazy(() => import("@/addons/discovery/pages/DiscoveryPage"));
const BlueprintPage = lazy(() => import("@/addons/discovery/pages/BlueprintPage"));
const SharedResultPage = lazy(() => import("@/addons/discovery/pages/SharedResultPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const publicRoutes = (
  <>
    <Route path="/" element={<PageTransition><Index /></PageTransition>} />
    <Route path="/about-us" element={<PageTransition><AboutPage /></PageTransition>} />
    <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
    <Route path="/services/:category" element={<PageTransition><ServiceCategoryPage /></PageTransition>} />
    <Route path="/services/:category/:service" element={<PageTransition><ServiceDetailPage /></PageTransition>} />
    <Route path="/portfolio" element={<PageTransition><ProjectHubPage /></PageTransition>} />
    <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
    <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
    <Route path="/blog/:slug" element={<PageTransition><BlogDetailPage /></PageTransition>} />
    <Route path="/contact-us" element={<PageTransition><ContactPage /></PageTransition>} />
    <Route path="/estimate" element={<PageTransition><CostEstimatorPage /></PageTransition>} />
    <Route path="/aesthetic-discovery-engine" element={<PageTransition><DiscoveryPage /></PageTransition>} />
    <Route path="/aesthetic-discovery-engine/results/:slug" element={<PageTransition><SharedResultPage /></PageTransition>} />
    <Route path="/blueprint" element={<PageTransition><BlueprintPage /></PageTransition>} />
    <Route path="/portfolio/:slug" element={<PageTransition><ProjectPage /></PageTransition>} />
    <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
    <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
    <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
    <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
    <Route path="/about" element={<Navigate to="/about-us" replace />} />
    <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
    <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
  </>
);
