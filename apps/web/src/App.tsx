import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
// Public Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GalleryPage from "./pages/GalleryPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
// Admin Pages
import AdminAuth from "./pages/admin/AdminAuth";
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminServices from "./pages/admin/AdminServices";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";

import { ProjectProvider } from "./context/ProjectContext";

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {isAdmin ? (
        <Routes>
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="settings" element={<AdminSettings />} />
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
            <Route path="/contact-us" element={<PageTransition><ContactPage /></PageTransition>} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProjectProvider>
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
        </ProjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
