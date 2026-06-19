import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import ScrollProgress from "@/components/layout/ScrollProgress";
import { GrainOverlay } from "@/components/portfolio/GrainOverlay";
import { MeshGradientBg } from "@/components/portfolio/MeshGradientBg";
import { CursorGlow } from "@/components/portfolio/CursorGlow";
import HubHero from "@/components/portfolio/HubHero";
import Philosophy from "@/components/portfolio/Philosophy";
import { FeaturedProjectStory } from "@/components/portfolio/FeaturedProjectStory";
import { TrustLayer } from "@/components/portfolio/TrustLayer";
import { ProjectArchive } from "@/components/portfolio/ProjectArchive";
import { DesignPerspective } from "@/components/portfolio/DesignPerspective";
import { ClientPerspective } from "@/components/portfolio/ClientPerspective";
import { BehindTheWork } from "@/components/portfolio/BehindTheWork";
import HowWeWork from "@/components/portfolio/HowWeWork";
import PortfolioFinalCTA from "@/components/portfolio/PortfolioFinalCTA";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { projects } from "@/data/projects";

const PortfolioPage = () => {
  // Extract narrative lines for featured stories
  const storiesData = [
    {
      title: projects[0].title,
      category: projects[0].category,
      location: projects[0].location,
      area: projects[0].area,
      narrative: "A quiet residential sanctuary crafted to dial down the heavy pace of Jamshedpur into silent, tactile master suite comfort.",
      coverImage: projects[0].heroImage,
      slug: projects[0].slug,
    },
    {
      title: projects[1].title,
      category: projects[1].category,
      location: projects[1].location,
      area: projects[1].area,
      narrative: "Shattering closed-door isolation by dissolving walls and integrating a central social island for seamless culinary flow.",
      coverImage: projects[1].heroImage,
      slug: projects[1].slug,
    },
    {
      title: projects[2].title,
      category: projects[2].category,
      location: projects[2].location,
      area: projects[2].area,
      narrative: "Constructing an open-plan biophilic headquarters that projects command authority without corporate steel coldness.",
      coverImage: projects[2].heroImage,
      slug: projects[2].slug,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Portfolio | Cross Angle Interior - Immersive Portfolio</title>
        <meta
          name="description"
          content="Explore our cinematic portfolio of luxury interiors. From modular kitchens to peaceful bedrooms, experience spaces designed for real lifestyles."
        />
        <meta property="og:title" content="Portfolio | Cross Angle Interior" />
        <meta property="og:description" content="Explore our cinematic portfolio of luxury interiors — spaces designed for real lifestyles." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crossangleinterior.com/portfolio" />
        <link rel="canonical" href="https://crossangleinterior.com/portfolio" />
      </Helmet>

      {/* Global Interactive and Texture Layers */}
      <GrainOverlay />
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      

      <main id="main-content" className="relative bg-[#0B0B0B] text-white overflow-hidden w-full min-h-screen">
        {/* Subtle global mesh gradients in the background */}
        <MeshGradientBg />

        {/* 1. Hero Section */}
        <HubHero />

        {/* 2. Philosophy Section */}
        <Philosophy />

        {/* 3. Featured Project Stories (Alternating Views) */}
        <div className="relative space-y-12 bg-[#0B0B0B] z-10">
          {storiesData.map((story, idx) => (
            <FeaturedProjectStory
              key={story.slug}
              title={story.title}
              category={story.category}
              location={story.location}
              area={story.area}
              narrative={story.narrative}
              coverImage={story.coverImage}
              slug={story.slug}
              index={idx}
            />
          ))}
        </div>

        {/* 4. Trust Layer Marquee */}
        <TrustLayer />

        {/* 5. Bento Project Archive */}
        <ProjectArchive />

        {/* 6. Design Perspective Horizontal Scroll */}
        <DesignPerspective />

        {/* 7. Behind The Work — 4-pillar editorial cards */}
        <BehindTheWork />

        {/* 8. How We Work — 3-step process */}
        <HowWeWork />

        {/* 9. Client Perspective Testimonial */}
        <ClientPerspective />

        {/* 10. Final CTA */}
        <PortfolioFinalCTA />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default PortfolioPage;
