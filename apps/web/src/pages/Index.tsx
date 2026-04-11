import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import SectionNavDots from "@/components/SectionNavDots";
import ScrollProgress from "@/components/ScrollProgress";
import WelcomePrompt from "@/components/WelcomePrompt";
import { LazySection } from "@/components/performance/LazySection";

// ── Above-fold: eager (loaded with initial bundle) ──────────────────────────
import Hero from "@/components/Hero";

// ── Below-fold: code-split + IntersectionObserver-triggered ─────────────────
const About            = lazy(() => import("@/components/About"));
const Services         = lazy(() => import("@/components/Services"));
const Process          = lazy(() => import("@/components/Process"));
const Portfolio        = lazy(() => import("@/components/Portfolio"));
const TactileJourney   = lazy(() => import("@/components/TactileJourney").then(m => ({ default: m.TactileJourney })));
const BeforeAfterShowcase = lazy(() => import("@/components/BeforeAfterShowcase").then(m => ({ default: m.BeforeAfterShowcase })));
const TrustSection     = lazy(() => import("@/components/TrustSection"));
const Testimonials     = lazy(() => import("@/components/Testimonials"));
const MarqueeStrip     = lazy(() => import("@/components/MarqueeStrip").then(m => ({ default: m.MarqueeStrip })));

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Crossangle Interior | Premium Interior Design Studio in Jamshedpur &amp; Kolkata</title>
        <meta
          name="description"
          content="Transform your vision into exquisite living spaces with Crossangle Interior. Award-winning interior design for homes and commercial spaces in Jamshedpur and Kolkata. 500+ projects completed."
        />
        <meta
          name="keywords"
          content="interior design, residential design, commercial design, luxury interiors, home design, space planning, Jamshedpur, Kolkata, modular kitchen, false ceiling"
        />
        <meta property="og:title" content="Crossangle Interior | Premium Interior Design Studio" />
        <meta property="og:description" content="Transform your vision into exquisite living spaces. Award-winning interior design in Jamshedpur &amp; Kolkata." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/" />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <ScrollProgress />
      <WelcomePrompt />
      <Navbar />
      <main id="main-content" className="min-h-screen relative w-full">
        <FixedSocialBar />
        <SectionNavDots />

        {/* Hero — eager, sticky behind everything, curtain scroll effect */}
        <div className="h-screen">
          <Hero />
        </div>

        {/* Content slides OVER the hero as you scroll (curtain effect) */}
        <div className="relative z-10">

          <LazySection
            id="about"
            className="bg-site-bg-section border-t border-site-border"
            minHeight={800}
            rootMargin="400px 0px"
          >
            <About />
          </LazySection>

          <LazySection
            id="services"
            className="bg-site-bg border-t border-site-border"
            minHeight={900}
            rootMargin="300px 0px"
          >
            <Services />
          </LazySection>

          <LazySection
            id="process"
            className="bg-site-bg-section border-t border-site-border"
            minHeight={700}
            rootMargin="300px 0px"
          >
            <Process />
          </LazySection>

          {/* MarqueeStrip is lightweight but still below fold */}
          <LazySection
            className="bg-site-bg-section border-t border-site-border"
            minHeight={80}
            rootMargin="200px 0px"
          >
            <MarqueeStrip />
          </LazySection>

          <LazySection
            id="portfolio"
            className="bg-site-bg border-t border-site-border"
            minHeight={1000}
            rootMargin="300px 0px"
          >
            <Portfolio />
          </LazySection>

          <LazySection
            className="bg-site-bg-section border-t border-site-border"
            minHeight={800}
            rootMargin="300px 0px"
          >
            <TactileJourney />
          </LazySection>

          <LazySection
            className="bg-site-bg border-t border-site-border"
            minHeight={700}
            rootMargin="300px 0px"
          >
            <BeforeAfterShowcase />
          </LazySection>

          <LazySection
            className="bg-site-bg-section border-t border-site-border"
            minHeight={600}
            rootMargin="300px 0px"
          >
            <TrustSection />
          </LazySection>

          <LazySection
            id="testimonials"
            className="bg-site-bg-section border-t border-site-border"
            minHeight={700}
            rootMargin="300px 0px"
          >
            <Testimonials />
          </LazySection>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Index;
