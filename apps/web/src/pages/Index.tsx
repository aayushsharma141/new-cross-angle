import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import SectionNavDots from "@/components/layout/SectionNavDots";
import ScrollProgress from "@/components/layout/ScrollProgress";
import WelcomePrompt from "@/components/shared/WelcomePrompt";
import { LazySection } from "@/components/performance/LazySection";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import { SITE_CONSTANTS } from "@/lib/constants";

// ── Above-fold: eager (loaded with initial bundle) ──────────────────────────
import Hero from "@/components/home/Hero";

// ── Below-fold: code-split + IntersectionObserver-triggered ─────────────────
const About            = lazy(() => import("@/components/home/About"));
const Services         = lazy(() => import("@/components/home/Services"));
const Process          = lazy(() => import("@/components/home/Process"));
const Portfolio        = lazy(() => import("@/components/home/Portfolio"));
const TactileJourney   = lazy(() => import("@/components/home/TactileJourney").then(m => ({ default: m.TactileJourney })));
const BeforeAfterShowcase = lazy(() => import("@/components/home/BeforeAfterShowcase").then(m => ({ default: m.BeforeAfterShowcase })));
const TrustSection     = lazy(() => import("@/components/home/TrustSection"));
const Testimonials     = lazy(() => import("@/components/home/Testimonials"));
const MarqueeStrip     = lazy(() => import("@/components/home/MarqueeStrip").then(m => ({ default: m.MarqueeStrip })));

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Crossangle Interior | Premium Interior Design Studio in Jamshedpur</title>
        <meta
          name="description"
          content="Transform your vision into exquisite living spaces with Crossangle Interior. Award-winning interior design for homes and commercial spaces in Jamshedpur. 500+ projects completed."
        />
        <meta
          name="keywords"
          content="interior design, residential design, commercial design, luxury interiors, home design, space planning, Jamshedpur, modular kitchen, false ceiling"
        />
        <meta property="og:title" content="Crossangle Interior | Premium Interior Design Studio" />
        <meta property="og:description" content="Transform your vision into exquisite living spaces. Award-winning interior design in Jamshedpur and nearby neighborhoods." />
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

      <SchemaMarkup
        type="LocalBusiness"
        data={{
          name: "Crossangle Interior",
          image: "https://crossangleinterior.com/reality_render.jpg",
          "@id": "https://crossangleinterior.com",
          url: "https://crossangleinterior.com",
          telephone: `+${SITE_CONSTANTS.defaultWhatsApp}`, // Update with actual if available
          address: [
            {
              "@type": "PostalAddress",
              "streetAddress": "Jamshedpur Center",
              "addressLocality": "Jamshedpur",
              "addressRegion": "Jharkhand",
              "postalCode": "831001",
              "addressCountry": "IN"
            }
          ],
          geo: {
            "@type": "GeoCoordinates",
            "latitude": "22.8046",
            "longitude": "86.2029"
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "10:00",
            "closes": "19:00"
          },
          sameAs: [
            "https://www.facebook.com/crossangle",
            "https://www.instagram.com/crossangle"
          ]
        }}
      />
      <SchemaMarkup
        type="Service"
        data={{
          serviceType: "Interior Design",
          provider: {
            "@type": "LocalBusiness",
            "name": "Crossangle Interior"
          },
          areaServed: ["Jamshedpur", "Mango", "Sakchi", "Bistupur", "Kadma", "Sonari", "Telco", "Golmuri", "Baridih", "Dimna", "Adityapur"],
          description: "Premium interior design services for residential and commercial spaces."
        }}
      />
    </>
  );
};

export default Index;
