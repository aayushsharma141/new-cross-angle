import { lazy } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import SectionNavDots from "@/components/layout/SectionNavDots";
import ScrollProgress from "@/components/layout/ScrollProgress";
import WelcomePrompt from "@/components/shared/WelcomePrompt";
import { LazySection } from "@/components/performance/LazySection";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SITE_CONSTANTS } from "@/lib/constants";

// ── Above-fold: eager (loaded with initial bundle) ──────────────────────────
import Hero from "@/components/home/Hero";

// ── Below-fold: code-split + IntersectionObserver-triggered ─────────────────
const StyleDiscoveryTeaser = lazy(() => import("@/components/home/StyleDiscoveryTeaser"));
const Portfolio            = lazy(() => import("@/components/home/Portfolio"));
const BeforeAfterShowcase  = lazy(() => import("@/components/home/BeforeAfterShowcase").then(m => ({ default: m.BeforeAfterShowcase })));
const Process              = lazy(() => import("@/components/home/Process"));
const Testimonials         = lazy(() => import("@/components/home/Testimonials"));
const EstimatorPromo       = lazy(() => import("@/components/home/EstimatorPromo"));
const HomeFinalCTA         = lazy(() => import("@/components/home/HomeFinalCTA"));

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Crossangle Interior | Premium Interior Design Studio in Jamshedpur</title>
        <meta
          name="description"
          content="Transform your vision into exquisite living spaces with Crossangle Interior. Innovative and personalized interior design solutions for homes and commercial spaces in Jamshedpur."
        />
        <meta
          name="keywords"
          content="interior design, residential design, commercial design, luxury interiors, home design, space planning, Jamshedpur, modular kitchen, false ceiling"
        />
        <meta property="og:title" content="Crossangle Interior | Premium Interior Design Studio in Jamshedpur" />
        <meta property="og:description" content="Transform your vision into exquisite living spaces with Crossangle Interior. Innovative and personalized interior design solutions." />
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
      <FixedSocialBar />
      <Navbar />
      <main id="main-content" className="min-h-screen relative w-full">
        <SectionNavDots />

        {/* Hero — eager, sticky behind everything, curtain scroll effect */}
        <div id="home" className="h-screen">
          <Hero />
        </div>

        {/* Content slides OVER the hero as you scroll (curtain effect) */}
        <div className="relative z-10">

          {/* 1. Style Discovery Teaser */}
          <LazySection key="discovery" id="discovery" className="bg-neutral-950" minHeight={600} rootMargin="300px 0px">
            <StyleDiscoveryTeaser />
          </LazySection>

          {/* 2. Portfolio Showcase */}
          <LazySection key="portfolio" id="portfolio" className="bg-neutral-950 border-t border-white/[0.05]" minHeight={1000} rootMargin="300px 0px">
            <Portfolio />
          </LazySection>

          {/* 3. Before & After Slides (Transformation) */}
          <LazySection key="before-after" id="before-after" className="bg-[#060504] border-t border-white/[0.05]" minHeight={750} rootMargin="300px 0px">
            <BeforeAfterShowcase />
          </LazySection>

          {/* 4. Methodology Process (Predictable Interior System) */}
          <LazySection key="process" id="process" className="bg-site-bg border-t border-white/[0.05]" minHeight={800} rootMargin="300px 0px">
            <Process />
          </LazySection>

          {/* 5. Testimonials */}
          <LazySection key="testimonials" id="testimonials" className="bg-[#080807] border-t border-white/[0.05]" minHeight={700} rootMargin="300px 0px">
            <Testimonials />
          </LazySection>

          {/* 6. Cost Estimator Teaser */}
          <LazySection key="estimator" id="estimator" className="bg-black border-t border-white/[0.05]" minHeight={600} rootMargin="300px 0px">
            <EstimatorPromo />
          </LazySection>

          {/* 7. Final CTA */}
          <LazySection key="final-cta" id="final-cta" className="bg-neutral-950 border-t border-white/[0.05]" minHeight={600} rootMargin="300px 0px">
            <HomeFinalCTA />
          </LazySection>

        </div>
      </main>
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
      <ScrollToTop />
    </>
  );
};

export default Index;