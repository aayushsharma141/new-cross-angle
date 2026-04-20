import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import ScrollProgress from "@/components/layout/ScrollProgress";
import { Suspense, lazy } from "react";

// Lazy load components for the Hub
const HubHero = lazy(() => import("@/components/portfolio/HubHero"));
const SpaceNavigator = lazy(() => import("@/components/portfolio/SpaceNavigator"));
const FeaturedJourneys = lazy(() => import("@/components/portfolio/FeaturedJourneys"));
const StyleSelector = lazy(() => import("@/components/portfolio/StyleSelector"));
const InspirationGallery = lazy(() => import("@/components/portfolio/InspirationGallery"));
const HubLightExperience = lazy(() => import("@/components/portfolio/HubLightExperience"));
const TrustSection = lazy(() => import("@/components/portfolio/TrustSection"));
const HubFinalCTA = lazy(() => import("@/components/portfolio/HubFinalCTA"));

const ProjectHubPage = () => {
  return (
    <>
      <Helmet>
        <title>Project Experience Hub | Cross Angle Interior - Immersive Portfolio</title>
        <meta
          name="description"
          content="Explore our cinematic portfolio of luxury interiors. From modular kitchens to peaceful bedrooms, experience spaces designed for real lifestyles."
        />
      </Helmet>

      <ScrollProgress />
      <Navbar />
      <FixedSocialBar />

      <main className="bg-[#050505] text-white overflow-x-hidden">
        <section id="hero">
          <Suspense fallback={<div className="h-screen flex items-center justify-center bg-black text-white/50 text-sm tracking-widest uppercase">Loading Hero...</div>}>
            <HubHero />
          </Suspense>
        </section>

        <section id="explore" className="py-24 text-center">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading Explorer...</div>}>
              <SpaceNavigator />
            </Suspense>
          </div>
        </section>

        <section id="featured" className="bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading Journeys...</div>}>
              <FeaturedJourneys />
            </Suspense>
          </div>
        </section>

        <section id="styles" className="py-24 bg-black text-center">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading Styles...</div>}>
              <StyleSelector />
            </Suspense>
          </div>
        </section>

        <section id="inspiration" className="py-24 bg-[#050505] text-center">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading Inspiration...</div>}>
              <InspirationGallery />
            </Suspense>
          </div>
        </section>

        <section id="light-experience" className="bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading Experience...</div>}>
              <HubLightExperience />
            </Suspense>
          </div>
        </section>

        <section id="trust" className="py-24">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading Trust metrics...</div>}>
              <TrustSection />
            </Suspense>
          </div>
        </section>

        <section id="cta">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">Loading CTA...</div>}>
              <HubFinalCTA />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ProjectHubPage;
