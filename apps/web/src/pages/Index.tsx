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
const HomeBlog         = lazy(() => import("@/components/home/HomeBlog"));
const AboutTimeline    = lazy(() => import("@/components/about/AboutTimeline"));

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
        {/* ✦ LCP Preload: fetch above-fold hero image with highest browser priority */}
        <link
          rel="preload"
          href="/hero_reality_render_1775299733746.png"
          as="image"
          fetchPriority="high"
        />
      </Helmet>

      <ScrollProgress />
      <WelcomePrompt />
      <Navbar />
      <div className="min-h-screen relative w-full">
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
            className="bg-background border-t border-site-border"
            minHeight={800}
            rootMargin="300px 0px"
          >
            <AboutTimeline />
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

          <LazySection
            id="blog"
            className="bg-[#090807] border-t border-site-border"
            minHeight={600}
            rootMargin="300px 0px"
          >
            <HomeBlog />
          </LazySection>

        </div>
      </div>
      <Footer />

      <SchemaMarkup
        type="LocalBusiness"
        data={{
          name: "Cross Angle Interior",
          image: "https://crossangleinterior.com/reality_render.jpg",
          "@id": "https://crossangleinterior.com/#localbusiness",
          url: "https://crossangleinterior.com",
          telephone: SITE_CONSTANTS.defaultPhone,
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango",
            addressLocality: "Jamshedpur",
            addressRegion: "Jharkhand",
            postalCode: "831012",
            addressCountry: "IN"
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: SITE_CONSTANTS.defaultLat,
            longitude: SITE_CONSTANTS.defaultLng
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "20:00"
          },
          sameAs: [
            SITE_CONSTANTS.socials.facebook,
            SITE_CONSTANTS.socials.instagram
          ]
        }}
      />
      <SchemaMarkup
        type="Organization"
        data={{
          name: "Cross Angle Interior",
          url: "https://crossangleinterior.com",
          logo: "https://crossangleinterior.com/logo-icon.png",
          description: "Premium interior design studio specializing in turn-key residential and commercial spaces."
        }}
      />
      <SchemaMarkup
        type="WebSite"
        data={{
          name: "Cross Angle Interior",
          url: "https://crossangleinterior.com"
        }}
      />
      <SchemaMarkup
        type="Service"
        data={{
          serviceType: "Premium Interior Design",
          provider: {
            "@type": "InteriorDesigner",
            name: "Cross Angle Interior"
          },
          areaServed: ["Jamshedpur", "Mango", "Sakchi", "Bistupur", "Kadma", "Sonari", "Telco", "Golmuri", "Baridih", "Dimna", "Adityapur"],
          description: "End-to-end luxury residential and commercial interior design services with modern materials and premium execution."
        }}
      />
      <SchemaMarkup
        type="FAQPage"
        data={{
          faqs: [
            {
              question: "What interior design services does Cross Angle Interior provide in Jamshedpur?",
              answer: "We offer comprehensive, turn-key interior design services for luxury residential homes, apartments, custom modular kitchens, premium false ceilings, and bespoke commercial spaces/offices across Jamshedpur and surrounding regions."
            },
            {
              question: "How long does a typical home interior project take?",
              answer: "Most premium residential projects take between 45 to 75 days from concept design approval to material execution and final handover. Timeline details are provided transparently during our 3D visualization phase."
            },
            {
              question: "Do you offer custom modular kitchens and modern finishes?",
              answer: "Yes, we specialize in high-end modular kitchens with soft-close mechanisms, custom acrylic or PU finishes, premium quartz countertops, and sleek space-saving accessories designed to last a lifetime."
            },
            {
              question: "What is the process of getting an interior design estimate?",
              answer: "You can use our interactive digital cost estimator page online or contact us directly. We provide a detailed spatial planning consult, followed by exact line-item material estimations and 3D design iterations."
            }
          ]
        }}
      />
    </>
  );
};

export default Index;
