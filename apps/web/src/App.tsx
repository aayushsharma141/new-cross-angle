import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { useEffect, Suspense, lazy } from "react";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { LanguageProvider } from "./hooks/useLanguage";
import { ThemeProvider } from "./components/theme-provider";
import { ScrollManager } from "./components/layout/ScrollManager";
// Public Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GalleryPage from "./pages/GalleryPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import ContactPage from "./pages/ContactPage";
import ProjectPage from "./pages/ProjectPage";
import PreviewPage from "./pages/PreviewPage";
import PriceEstimator from "./addons/calculators/pages/PriceEstimator";
import DiscoveryPage from "./addons/discovery/pages/DiscoveryPage";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
const BlueprintPage = lazy(() => import("./addons/discovery/pages/BlueprintPage"));
// Admin Pages
import AdminAuth from "./pages/admin/AdminAuth";
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import AdminLayout from "./components/admin/AdminLayout";
import AdminHub from "./pages/admin/AdminHub";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPageSections from "./pages/admin/AdminPageSections";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminServices from "./pages/admin/AdminServices";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminEstimateLeads from "./pages/admin/AdminEstimateLeads";
import AdminEstimateRates from "./pages/admin/AdminEstimateRates";
import AdminTeamMembers from "./pages/admin/AdminTeamMembers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
// Admin Module Wrappers
import { CmsModule } from "./pages/admin/modules/CmsModule";
import { CrmModule } from "./pages/admin/modules/CrmModule";
import { DiscoveryModule } from "./pages/admin/modules/DiscoveryModule";
import { EstimatorModule } from "./pages/admin/modules/EstimatorModule";
import { SystemModule } from "./pages/admin/modules/SystemModule";
import { RoleGuard } from "./components/admin/RoleGuard";

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

import useLenis from "./hooks/useLenis";

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Initialize smooth scrolling for the entire app
  useLenis();

  useEffect(() => {
    console.log("Debug: AnimatedRoutes rendered, path:", location.pathname, "isAdmin:", isAdmin);
  }, [location.pathname, isAdmin]);

  return (
    <>
      <ScrollToTop />
      {isAdmin ? (
        <Routes>
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHub />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="cms" element={<RoleGuard allowedRoles={["admin", "editor", "viewer"]}><CmsModule /></RoleGuard>}>
              <Route path="pages" element={<RoleGuard allowedRoles={["admin", "editor"]}><AdminPageSections /></RoleGuard>} />
              <Route path="portfolio" element={<RoleGuard allowedRoles={["admin", "editor"]}><AdminPortfolio /></RoleGuard>} />
              <Route path="services" element={<RoleGuard allowedRoles={["admin", "editor"]}><AdminServices /></RoleGuard>} />
              <Route path="testimonials" element={<RoleGuard allowedRoles={["admin", "editor"]}><AdminTestimonials /></RoleGuard>} />
              <Route path="team" element={<RoleGuard allowedRoles={["admin", "editor"]}><AdminTeam /></RoleGuard>} />
              <Route path="blogs" element={<RoleGuard allowedRoles={["admin", "editor"]}><AdminBlogs /></RoleGuard>} />
              <Route path="media" element={<RoleGuard allowedRoles={["admin", "editor", "viewer"]}><AdminMedia /></RoleGuard>} />
            </Route>

            <Route path="crm" element={<RoleGuard allowedRoles={["admin", "editor", "viewer"]}><CrmModule /></RoleGuard>}>
              <Route path="leads" element={<AdminLeads />} />
              <Route path="users" element={<RoleGuard allowedRoles={["admin"]}><AdminUsers /></RoleGuard>} />
            </Route>

            <Route path="discovery" element={<RoleGuard allowedRoles={["admin", "editor", "viewer"]}><DiscoveryModule /></RoleGuard>}>
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="estimator" element={<RoleGuard allowedRoles={["admin", "editor", "viewer"]}><EstimatorModule /></RoleGuard>}>
              <Route path="leads" element={<AdminEstimateLeads />} />
              <Route path="rates" element={<RoleGuard allowedRoles={["admin"]}><AdminEstimateRates /></RoleGuard>} />
            </Route>

            <Route path="system" element={<RoleGuard allowedRoles={["admin"]}><SystemModule /></RoleGuard>}>
              <Route path="settings" element={<AdminSettings />} />
              <Route path="team-members" element={<AdminTeamMembers />} />
            </Route>
          </Route>
        </Routes>
      ) : (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/about-us" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
            <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
            <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
            <Route path="/blog/:slug" element={<PageTransition><BlogDetailPage /></PageTransition>} />
            <Route path="/preview/:slug" element={<PageTransition><PreviewPage /></PageTransition>} />
            <Route path="/contact-us" element={<PageTransition><ContactPage /></PageTransition>} />
            <Route path="/estimate" element={<PageTransition><PriceEstimator /></PageTransition>} />
            <Route path="/spatial-identity-os" element={<PageTransition><DiscoveryPage /></PageTransition>} />
            <Route path="/blueprint" element={<PageTransition><Suspense fallback={<div className="min-h-screen bg-[#080808] w-full" />}><BlueprintPage /></Suspense></PageTransition>} />
            <Route path="/portfolio/:slug" element={<PageTransition><ProjectPage /></PageTransition>} />
            {/* Redirect routes for common variations */}
            <Route path="/about" element={<Navigate to="/about-us" replace />} />
            <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <SchemaMarkup
      type="LocalBusiness"
      data={{
        "@type": "InteriorDesigner",
        "name": "Cross Angle Interior",
        "image": "https://crossangleinterior.com/logo-icon.png",
        "@id": "https://crossangleinterior.com",
        "url": "https://crossangleinterior.com",
        "telephone": "+917909041132",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango",
          "addressLocality": "Jamshedpur",
          "addressRegion": "Jharkhand",
          "postalCode": "831012",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 22.8027,
          "longitude": 86.2047
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "09:00",
          "closes": "20:00"
        },
        "sameAs": [
          "https://www.instagram.com/crossangleinterior/",
          "https://www.facebook.com/crossangleinterior"
        ]
      }}
    />
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ScrollManager />
        <TooltipProvider>
          <AuthProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <AnimatedRoutes />
              </BrowserRouter>
            </LanguageProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
