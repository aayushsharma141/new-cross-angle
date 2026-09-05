import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import ScrollProgress from "@/components/layout/ScrollProgress";

import HubHero from "@/components/portfolio/HubHero";
import Philosophy from "@/components/portfolio/Philosophy";
import { FeaturedProjectStory } from "@/components/portfolio/FeaturedProjectStory";
import { TrustLayer } from "@/components/portfolio/TrustLayer";
import { ProjectArchive } from "@/components/portfolio/ProjectArchive";
import { DesignPerspective } from "@/components/portfolio/DesignPerspective";
import { DesignSignatures } from "@/components/portfolio/DesignSignatures";
import { ClientPerspective } from "@/components/portfolio/ClientPerspective";
import PortfolioFinalCTA from "@/components/portfolio/PortfolioFinalCTA";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";

const PortfolioPage = () => {
  const { data: featuredProjects = [] } = useQuery({
    queryKey: ['featuredProjects'],
    queryFn: () => api.getFeaturedProjects()
  });

  // Extract narrative lines for featured stories
  const storiesData = featuredProjects.slice(0, 3).map((project, idx) => {
    const defaultNarratives = [
      "A quiet residential sanctuary crafted to dial down the heavy pace of Jamshedpur into silent, tactile master suite comfort.",
      "Shattering closed-door isolation by dissolving walls and integrating a central social island for seamless culinary flow.",
      "Constructing an open-plan biophilic headquarters that projects command authority without corporate steel coldness."
    ];
    return {
      title: project.title,
      category: project.category,
      location: project.location,
      area: project.area,
      narrative: project.brief || defaultNarratives[idx] || "Transforming spaces with intent.",
      coverImage: project.heroImage,
      slug: project.slug,
    };
  });

  return (
    <>
      <h1 className="sr-only">Portfolio | Cross Angle Interior</h1>
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
        <link rel="preload" as="image" href={portfolioBedroom} />
      </Helmet>


      <ScrollProgress />
      <Navbar />
      <FixedSocialBar />

      <main id="main-content" className="relative bg-background text-foreground overflow-hidden w-full min-h-screen">

        {/* 1. Hero Section */}
        <HubHero />

        {/* 2. Philosophy Section */}
        <Philosophy />

        {/* 3. Featured Project Stories (Alternating Views) */}
        <div className="relative space-y-16 md:space-y-24 bg-background z-10 my-[10vh] md:my-[14vh]">
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

        {/* 7. Design Signatures — 4 full-height editorial quote panels (Light, Materiality, Spatial Flow, Craftsmanship) */}
        <DesignSignatures />

        {/* 8. Client Perspective Testimonial */}
        <ClientPerspective />

        {/* 9. Final CTA */}
        <PortfolioFinalCTA />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default PortfolioPage;
