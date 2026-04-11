import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import ScrollProgress from "@/components/ScrollProgress";
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
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-black">Loading Experience...</div>}>
          <section id="hero">
            <HubHero />
          </section>

          <section id="explore" className="py-24 text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <SpaceNavigator />
            </div>
          </section>

          <section id="featured" className="bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto">
              <FeaturedJourneys />
            </div>
          </section>

          <section id="styles" className="py-24 bg-black text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <StyleSelector />
            </div>
          </section>

          <section id="inspiration" className="py-24 bg-[#050505] text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <InspirationGallery />
            </div>
          </section>

          <section id="light-experience" className="bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto">
              <HubLightExperience />
            </div>
          </section>

          <section id="trust" className="py-24">
            <div className="max-w-7xl mx-auto">
              <TrustSection />
            </div>
          </section>

          <section id="cta">
            <div className="max-w-7xl mx-auto">
              <HubFinalCTA />
            </div>
          </section>
        </Suspense>
      </main>

      <Footer />
    </>
  );
};

export default ProjectHubPage;
