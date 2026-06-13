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
import { SITE_CONSTANTS } from "@/lib/constants";

// ── Above-fold: eager (loaded with initial bundle) ──────────────────────────
import Hero from "@/components/home/Hero";

// ── Below-fold: code-split + IntersectionObserver-triggered ─────────────────
const ClientProblems = lazy(() => import("@/components/home/ClientProblems"));
const Services         = lazy(() => import("@/components/home/Services"));
const Portfolio        = lazy(() => import("@/components/home/Portfolio"));
const BeforeAfterShowcase = lazy(() => import("@/components/home/BeforeAfterShowcase").then(m => ({ default: m.BeforeAfterShowcase })));
const ProjectFailurePrevention = lazy(() => import("@/components/home/ProjectFailurePrevention"));
const Testimonials     = lazy(() => import("@/components/home/Testimonials"));
const TrustSection     = lazy(() => import("@/components/home/TrustSection"));
const Process          = lazy(() => import("@/components/home/Process"));
const EstimatorPromo   = lazy(() => import("@/components/home/EstimatorPromo"));
const About            = lazy(() => import("@/components/home/About"));
const ServiceLocations = lazy(() => import("@/components/home/ServiceLocations"));

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
        <div className="h-screen">
          <Hero />
        </div>

        {/* Content slides OVER the hero as you scroll (curtain effect) */}
        <div className="relative z-10">

          {/* 2. Client Problems / Reality Check (Empathy Layer) */}
          <LazySection
            id="reality-check"
            className="bg-[#050505] border-t border-white/[0.05]"
            minHeight={700}
            rootMargin="400px 0px"
          >
            <ClientProblems />
          </LazySection>

          {/* 3. Services Offered */}
          <LazySection
            id="services"
            className="bg-black border-t border-white/[0.05]"
            minHeight={900}
            rootMargin="300px 0px"
          >
            <Services />
          </LazySection>

          {/* 4. Portfolio Showcase */}
          <LazySection
            id="portfolio"
            className="bg-neutral-950 border-t border-white/[0.05]"
            minHeight={1000}
            rootMargin="300px 0px"
          >
            <Portfolio />
          </LazySection>

          {/* 5. Before & After Slides */}
          <LazySection
            id="before-after"
            className="bg-[#060504] border-t border-white/[0.05]"
            minHeight={750}
            rootMargin="300px 0px"
          >
            <BeforeAfterShowcase />
          </LazySection>

          {/* 6. Project Failure Prevention (Differentiation) */}
          <LazySection
            id="prevention"
            className="bg-[#060504] border-t border-white/[0.05]"
            minHeight={800}
            rootMargin="300px 0px"
          >
            <ProjectFailurePrevention />
          </LazySection>

          {/* 7. Testimonials */}
          <LazySection
            id="testimonials"
            className="bg-[#080807] border-t border-white/[0.05]"
            minHeight={700}
            rootMargin="300px 0px"
          >
            <Testimonials />
          </LazySection>

          {/* 8. Trust & Guarantees */}
          <LazySection
            id="trust"
            className="bg-[#0c0a09] border-t border-white/[0.05]"
            minHeight={600}
            rootMargin="300px 0px"
          >
            <TrustSection />
          </LazySection>

          {/* 9. Methodology Process */}
          <LazySection
            id="process"
            className="bg-site-bg border-t border-white/[0.05]"
            minHeight={800}
            rootMargin="300px 0px"
          >
            <Process />
          </LazySection>

          {/* 10. Cost Estimator Teaser */}
          <LazySection
            id="estimator"
            className="bg-black border-t border-white/[0.05]"
            minHeight={600}
            rootMargin="300px 0px"
          >
            <EstimatorPromo />
          </LazySection>

          {/* 11. Founder Note + Studio Stats */}
          <LazySection
            id="about"
            className="bg-site-bg-section border-t border-white/[0.05]"
            minHeight={800}
            rootMargin="300px 0px"
          >
            <About />
          </LazySection>

          {/* 12. Service Locations */}
          <LazySection
            id="locations"
            className="bg-[#020202] border-t border-white/[0.05]"
            minHeight={600}
            rootMargin="300px 0px"
          >
            <ServiceLocations />
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
    </>
  );
};

export default Index;
