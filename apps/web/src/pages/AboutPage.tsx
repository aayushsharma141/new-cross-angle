import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import FloatingParticles from "@/components/FloatingParticles";
import ScrollToTop from "@/components/ScrollToTop";
import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutStats from "@/components/about/AboutStats";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutCTA from "@/components/about/AboutCTA";
import AboutVideoModal from "@/components/about/AboutVideoModal";
import AboutTeam from "@/components/about/AboutTeam";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";

const AboutPage = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>About Us | Cross Angle Interior - Premier Interior Design Studio</title>
        <meta
          name="description"
          content="Learn about Cross Angle Interior - Jamshedpur's premier interior design studio. Over a decade of expertise transforming spaces into stunning, functional environments."
        />
        <meta property="og:title" content="About Cross Angle Interior" />
        <meta property="og:description" content="Over a decade of expertise transforming spaces into stunning, functional environments." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/about-us" />
      </Helmet>

      <FloatingParticles count={25} />

      <main className="min-h-screen relative z-10">
        <FixedSocialBar />
        <Navbar />

        {/* Immersive Hero with Video */}
        <AboutHero onPlayVideo={() => setIsVideoOpen(true)} />

        <AppBreadcrumb />

        {/* Core Values with 3D Cards */}
        <AboutValues />

        {/* Stats Section with Count-up */}
        <AboutStats />

        {/* Timeline with Scroll Animation */}
        <AboutTimeline />

        {/* The Visionaries - Team Section */}
        <AboutTeam />

        {/* CTA Section */}
        <AboutCTA />

        <Footer />
        <ScrollToTop />
      </main>

      {/* Video Modal */}
      <AboutVideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </>
  );
};

export default AboutPage;
