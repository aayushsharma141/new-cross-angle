import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SITE_CONSTANTS } from "@/lib/constants";
import { Link } from "react-router-dom";
import Hero from "@/components/home/Hero";
import { useEffect, useState } from "react";

const Index = () => {
  const [revealed, setRevealed] = useState(false);

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
        className="fixed inset-0 z-50 bg-[var(--s-canvas-primary)] pointer-events-none transition-transform duration-[1500ms]"
        style={{ 
          transform: revealed ? "translateY(-100%)" : "translateY(0)",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)"
        }}
      />

      <Navbar />

      {/* The main canvas for the Entrance. Entrance environment maximizes whitespace and structural photography. */}
      <main id="main-content" className="min-h-screen relative w-full bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)] pb-[10vh]" data-environment="entrance">

        {/* 0–20% Scroll: Hero photography (Design Silence) */}
        <Hero />

        {/* 20–35% Scroll: Headline (Editorial Asymmetry, staggered right) */}
        <section className="relative w-full px-6 md:px-12 lg:px-24 mt-[25vh] mb-[25vh] max-w-[1600px] mx-auto flex justify-end">
          <div className="w-full md:w-10/12 lg:w-8/12 pl-0 md:pl-12">
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[var(--s-text-tertiary)] mb-8 block">
              The Philosophy
            </span>
            <h2 className="font-display text-[clamp(2.5rem,5vw,5.5rem)] leading-[1.05] font-medium tracking-tight text-[var(--s-text-primary)]" style={{ letterSpacing: "-0.03em" }}>
              Homes Designed For Living.<br />
              <span className="text-[var(--s-text-secondary)]">Engineered For Predictability.</span>
            </h2>
          </div>
        </section>

        {/* 35–55% Scroll: One primary CTA (Asymmetric left, with structural explanation) */}
        <section className="relative w-full px-6 md:px-12 lg:px-24 mb-[30vh] max-w-[1600px] mx-auto flex justify-start">
          <div className="w-full md:w-6/12 lg:w-5/12 pr-0 md:pr-12 flex flex-col gap-10">
            <p className="font-sans text-[var(--s-text-secondary)] text-lg md:text-xl leading-relaxed max-w-md">
              We treat interior design as an engineering challenge, not just decoration. Enjoy beautiful, highly functional spaces for daily living, delivered through our CrossAngle Predictable Interior System™.
            </p>
            <div className="pt-4 border-t border-[var(--s-border-subtle)] flex items-center justify-between group">
              <Link
                to="/aesthetic-discovery-engine"
                className="inline-flex items-center justify-between w-full uppercase tracking-[0.2em] text-[10px] font-bold text-[var(--s-text-primary)] transition-colors duration-[850ms] hover:text-[var(--s-text-secondary)]"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <span>Take Style Quiz</span>
                <span className="text-[var(--s-text-tertiary)] transition-transform duration-[850ms] group-hover:translate-x-2">Explore</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 55–80% Scroll: Featured project (Asymmetric split: Text left bottom, Image right top) */}
        <section className="relative w-full mb-[30vh]">
          <div className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto flex flex-col-reverse md:flex-row items-end gap-16 md:gap-24">
            <div className="w-full md:w-1/3 pb-0 md:pb-12">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[var(--s-text-tertiary)] mb-6 block">01 / Featured</span>
              <h3 className="font-display text-4xl md:text-5xl mb-6 text-[var(--s-text-primary)] tracking-tight">The Highland Residence</h3>
              <p className="font-sans text-[var(--s-text-secondary)] text-sm mb-10 max-w-[280px] leading-relaxed">
                Limestone / Oak / Natural Light. An exercise in material restraint and spatial flow.
              </p>
              <Link to="/portfolio" className="inline-block text-[10px] uppercase tracking-[0.2em] font-bold border-b border-[var(--s-border-subtle)] pb-2 text-[var(--s-text-secondary)] transition-colors duration-[850ms] hover:text-[var(--s-text-primary)]" style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
                View Case Study
              </Link>
            </div>
            <div className="w-full md:w-2/3">
              <div className="aspect-[4/5] md:aspect-[4/3] lg:aspect-[16/9] overflow-hidden bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)] relative group">
                <img 
                  src="/hero_reality_render_1775299733746.png" 
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.02]" 
                  style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                  alt="The Highland Residence" 
                  loading="lazy" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* 80–100% Scroll: Transition into portfolio */}
        <section className="relative w-full px-6 md:px-12 lg:px-24 pb-[20vh] max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[var(--s-text-tertiary)] mb-8 block">Archive</span>
          <h2 className="font-display text-5xl md:text-7xl mb-12 text-[var(--s-text-primary)] tracking-tight" style={{ letterSpacing: "-0.02em" }}>Explore the Gallery</h2>
          <Link to="/portfolio" className="inline-block text-[10px] uppercase tracking-[0.2em] font-bold border-b border-[var(--s-border-subtle)] pb-2 text-[var(--s-text-primary)] transition-opacity duration-[850ms] hover:opacity-70" style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
            Enter Portfolio
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