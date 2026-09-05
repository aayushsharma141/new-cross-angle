import { Navigate, Route } from "react-router-dom";
import { lazy } from "react";
import PageTransition from "@/components/layout/PageTransition";

const Index = lazy(() => import("@/pages/Index"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const ServiceCategoryPage = lazy(() => import("@/pages/ServiceCategoryPage"));
const ServiceDetailPage = lazy(() => import("@/pages/ServiceDetailPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const PortfolioPage = lazy(() => import("@/pages/PortfolioPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ProjectPage = lazy(() => import("@/pages/ProjectPage"));
const CostEstimatorPage = lazy(() => import("@/addons/calculators/pages/PriceEstimator"));
const DiscoveryPage = lazy(() => import("@/addons/discovery/pages/DiscoveryPage"));
const SharedResultPage = lazy(() => import("@/addons/discovery/pages/SharedResultPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const OurProcessPage = lazy(() => import("@/pages/OurProcessPage"));
const LocationsPage = lazy(() => import("@/pages/LocationsPage"));
const LocationPage = lazy(() => import("@/pages/LocationPage"));
const BlueprintPage = lazy(() => import("@/addons/discovery/pages/BlueprintPage"));

const LabLayout = lazy(() => import("@/components/lab/LabLayout"));
const LabOverview = lazy(() => import("@/pages/lab/LabOverview"));
const LabFoundations = lazy(() => import("@/pages/lab/LabFoundations"));
const LabInteractive = lazy(() => import("@/pages/lab/LabInteractive"));
const LabRoadmap = lazy(() => import("@/pages/lab/LabRoadmap"));
const LabOverlayDialog = lazy(() => import("@/pages/lab/LabOverlayDialog"));
const LabCards = lazy(() => import("@/pages/lab/LabCards"));
const LabNavigation = lazy(() => import("@/pages/lab/LabNavigation"));
const LabPatterns = lazy(() => import("@/pages/lab/LabPatterns"));
const LabTemplates = lazy(() => import("@/pages/lab/LabTemplates"));

export const publicRoutes = (
  <>
    <Route path="/" element={<PageTransition><Index /></PageTransition>} />
    <Route path="/about-us" element={<PageTransition><AboutPage /></PageTransition>} />
    <Route path="/our-process" element={<PageTransition><OurProcessPage /></PageTransition>} />
    <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
    <Route path="/services/:category" element={<PageTransition><ServiceCategoryPage /></PageTransition>} />
    <Route path="/services/:category/:service" element={<PageTransition><ServiceDetailPage /></PageTransition>} />
    <Route path="/portfolio" element={<PageTransition><PortfolioPage /></PageTransition>} />
    <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
    <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
    <Route path="/blog/:slug" element={<PageTransition><BlogDetailPage /></PageTransition>} />
    <Route path="/contact-us" element={<PageTransition><ContactPage /></PageTransition>} />
    <Route path="/estimate" element={<PageTransition><CostEstimatorPage /></PageTransition>} />
    <Route path="/aesthetic-discovery-engine" element={<PageTransition><DiscoveryPage /></PageTransition>} />
    <Route path="/aesthetic-discovery-engine/results/:slug" element={<PageTransition><SharedResultPage /></PageTransition>} />
    <Route path="/portfolio/:slug" element={<PageTransition><ProjectPage /></PageTransition>} />
    <Route path="/locations" element={<PageTransition><LocationsPage /></PageTransition>} />
    <Route path="/locations/:city" element={<PageTransition><LocationPage /></PageTransition>} />
    <Route path="/system-blueprint" element={<PageTransition><BlueprintPage /></PageTransition>} />
    
    <Route path="/foundation" element={<Navigate to="/lab/foundations" replace />} />
    <Route path="/lab" element={<PageTransition><LabLayout /></PageTransition>}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<LabOverview />} />
      <Route path="roadmap" element={<LabRoadmap />} />
      <Route path="foundations" element={<LabFoundations />} />
      <Route path="interactive" element={<LabInteractive />} />
      <Route path="overlay" element={<LabOverlayDialog />} />
      <Route path="cards" element={<LabCards />} />
      <Route path="navigation" element={<LabNavigation />} />
      <Route path="patterns" element={<LabPatterns />} />
      <Route path="templates" element={<LabTemplates />} />
    </Route>
    <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
    <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
    <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
    <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
    <Route path="/about" element={<Navigate to="/about-us" replace />} />
    <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
    <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
  </>
);
