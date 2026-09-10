import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SITE_CONSTANTS } from "@/lib/constants";
import { Link } from "react-router-dom";
import Hero from "@/components/home/Hero";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { useEffect, useState } from "react";
import { useAttentionTelemetry } from "@/hooks/useAttentionTelemetry";

const Index = () => {
  const [revealed, setRevealed] = useState(false);
  
  // Instrument focal points for Attention Purity Index
  const headlineRef = useAttentionTelemetry<HTMLDivElement>("entrance", "hero-headline", 2);
  const ctaRef = useAttentionTelemetry<HTMLDivElement>("entrance", "primary-cta", 3);
  const featuredRef = useAttentionTelemetry<HTMLDivElement>("entrance", "featured-project", 4);

  useEffect(() => {
    // The Reveal (The Entrance): A slow, curtain-like vertical wipe on initial page load
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <h1 className="sr-only">Crossangle Interior | Premium Interior Design Studio in Jamshedpur</h1>
      <Helmet>
        <title>Crossangle Interior | Premium Interior Design Studio</title>
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
        {/* LCP Preload: fetch above-fold hero image with highest browser priority */}
        <link
          rel="preload"
          href="/hero_reality_render_1775299733746.png"
          as="image"
          fetchPriority="high"
        />
      </Helmet>

      {/* The Reveal Curtain Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-[var(--s-canvas-primary)] pointer-events-none transition-transform duration-[1400ms] motion-reduce:transition-none"
        style={{ 
          transform: revealed ? "translateY(-100%)" : "translateY(0)",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)"
        }}
      />

      <Navbar />

      {/* The main canvas for the Entrance. */}
      <main id="main-content" className="home-shell min-h-screen relative w-full pb-[10vh]" data-environment="entrance">
        <div className="absolute inset-0 pointer-events-none home-noise z-0" />

        {/* 0–20% Scroll: Hero photography (Design Silence) */}
        <div className="relative z-10">
          <Hero />
        </div>

        {/* 20–35% Scroll: Philosophy Headline — atmospheric silence treatment */}
        <section className="home-section-frame relative z-10 w-full px-6 md:px-12 lg:px-24 mt-[16vh] mb-[8vh] max-w-[1600px] mx-auto flex justify-end overflow-hidden">
          {/* Atmospheric: subtle ambient multi-stop warm glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: "radial-gradient(ellipse at 70% 50%, rgba(201,168,92,0.04) 0%, rgba(255,255,255,0.008) 45%, transparent 70%)" 
            }}
          />
          <div ref={headlineRef} className="w-full md:w-10/12 lg:w-8/12 pl-0 md:pl-12 relative">
            {/* Subtle horizontal separator */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-8" />
            <span className="home-kicker mb-6 block uppercase text-[10px] tracking-[0.25em] font-bold text-white/50">The Philosophy</span>
            <h2 className="font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[1.05] font-normal text-[var(--s-text-primary)]" style={{ letterSpacing: "-0.03em" }}>
              Homes Designed For Living.<br />
              <span className="text-white/70">Engineered For Predictability.</span>
            </h2>
          </div>
        </section>

        {/* 35–55% Scroll: One primary CTA (Editorial Asymmetry, staggered left) */}
        <section className="home-section-frame relative z-10 w-full px-6 md:px-12 lg:px-24 mb-[18vh] max-w-[1600px] mx-auto flex justify-start">
          <div className="home-panel w-full md:w-6/12 lg:w-5/12 p-8 md:p-12 flex flex-col gap-10 rounded-xl relative">
            <p className="home-body text-base md:text-lg leading-relaxed max-w-[44ch] text-white/72">
              We treat interior design as an engineering challenge, not just decoration. Enjoy beautiful, highly functional spaces for daily living, delivered through our CrossAngle Predictable Interior System™.
            </p>
            <div ref={ctaRef} className="pt-4 flex items-center justify-between group border-t border-[rgba(255,255,255,0.06)]">
              <Link
                to="/aesthetic-discovery-engine"
                className="home-button-sweep inline-flex items-center justify-between w-full uppercase tracking-[0.2em] text-[10px] font-semibold text-[var(--s-text-primary)] py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] rounded-md"
              >
                <span>Take Style Quiz</span>
                <span className="text-[#C9A85C] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 motion-reduce:transition-none flex items-center gap-1.5">
                  Explore <span aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 55–80% Scroll: Featured project — editorial photograph treatment */}
        <section className="home-section-frame relative z-10 w-full mb-[18vh] overflow-visible">
          <div ref={featuredRef} className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto flex flex-col-reverse md:flex-row items-end gap-12 md:gap-16">
            {/* Left: copy block */}
            <div className="w-full md:w-[38%] pb-0 md:pb-12 shrink-0">
              <span className="home-kicker mb-6 block uppercase text-[10px] tracking-[0.25em] font-bold">01 / Featured Project</span>
              <h3 className="font-display text-3xl md:text-5xl mb-6 text-[var(--s-text-primary)] font-normal leading-[1.1]" style={{ letterSpacing: "-0.025em" }}>The Highland Residence</h3>
              <div className="flex gap-2 mb-6">
                 <span className="home-chip text-[10px] uppercase tracking-[0.12em] font-medium px-2.5 py-1 border border-white/10 bg-white/[0.02] rounded-md">Jamshedpur</span>
                 <span className="home-chip text-[10px] uppercase tracking-[0.12em] font-medium px-2.5 py-1 border border-white/10 bg-white/[0.02] rounded-md">Turn-key</span>
              </div>
              <p className="home-body text-sm leading-relaxed max-w-[38ch] mb-10 text-white/70">
                Limestone / Oak / Natural Light. An exercise in material restraint and spatial flow.
              </p>
              <Link 
                to="/portfolio" 
                className="home-button-sweep inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold border-b border-white/20 pb-2 text-[#C9A85C] transition-colors duration-500 hover:border-[#C9A85C] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] motion-reduce:transition-none group"
              >
                <span>View Case Study</span>
                <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </div>
            {/* Right: editorial photograph — bleeds past container, sharp architectural corners */}
            <div className="w-full md:w-[62%] md:-mr-[4vw] lg:-mr-[6vw]">
              <div className="aspect-[4/5] md:aspect-[4/3] lg:aspect-[3/2] overflow-hidden relative group rounded-none">
                <img 
                  src="/hero_reality_render_1775299733746.png"
                  className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100 rounded-none" 
                  alt="The Highland Residence architectural interior — Jamshedpur luxury residential project" 
                  loading="lazy" 
                  decoding="async"
                  width="1600"
                  height="900"
                />
                {/* Thin gold bottom accent line */}
                <div className="absolute bottom-0 left-0 w-16 h-[1px] bg-[#C9A85C]/50" />
              </div>
            </div>
          </div>
        </section>

        <HomeFAQ />

        {/* 80–100% Scroll: Gallery invitation — refined editorial transition */}
        <section className="home-section-frame relative z-10 w-full px-6 md:px-12 lg:px-24 py-[14vh] md:py-[16vh] max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center">
          {/* Vertical gold rule — gentle transition guide */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#C9A85C]/40 to-transparent mb-8" aria-hidden="true" />
          {/* Restrained eyebrow */}
          <span className="mb-4 block uppercase text-[10px] tracking-[0.25em] font-bold text-white/40">The Archive</span>
          {/* Proportionally balanced statement */}
          <h2
            className="font-display text-[clamp(2.25rem,4.5vw,4rem)] mb-8 text-[var(--s-text-primary)] font-normal leading-[1.1]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Explore the Gallery
          </h2>
          {/* Gold thin rule */}
          <div className="w-10 h-px bg-[#C9A85C]/40 mb-8" aria-hidden="true" />
          <Link 
            to="/gallery" 
            className="home-button-sweep inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold border-b border-[#C9A85C]/40 pb-2 text-[#C9A85C] transition-colors duration-500 hover:border-[#C9A85C] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] motion-reduce:transition-none group"
          >
            <span>Enter Gallery</span>
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </Link>
        </section>


      </main>
      <Footer />

      {/* Schema Markups retained */}
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