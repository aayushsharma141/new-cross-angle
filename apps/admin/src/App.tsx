import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminServices from "./pages/admin/AdminServices";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMedia from "./pages/admin/AdminMedia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="portfolio" element={<AdminPortfolio />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;