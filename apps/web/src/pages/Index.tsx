import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SITE_CONSTANTS } from "@/lib/constants";
import Hero from "@/components/home/Hero";
import { PhilosophyChapter } from "@/components/home/PhilosophyChapter";
import { ExpertiseChapter } from "@/components/home/ExpertiseChapter";
import { ProcessChapter } from "@/components/home/ProcessChapter";
import { TransformationChapter } from "@/components/home/TransformationChapter";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { ToolsChapter } from "@/components/home/ToolsChapter";
import { useEffect, useState } from "react";
import { useAttentionTelemetry } from "@/hooks/useAttentionTelemetry";
import { useSiteContent } from "@/content/useSiteContent";
import { ContentLink } from "@/content/ContentLink";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const [revealed, setRevealed] = useState(false);
  const seo = useSiteContent("home.seo");
  const featured = useSiteContent("home.featured");
  const faq = useSiteContent("home.faq");
  const galleryCta = useSiteContent("home.gallery_cta");
  const { settings } = useSiteSettings();
  
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
      <h1 className="sr-only">{seo.ogTitle || seo.title}</h1>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta property="og:title" content={seo.ogTitle || seo.title} />
        <meta property="og:description" content={seo.ogDescription || seo.description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/" />
        {/* LCP Preload: fetch above-fold hero image with highest browser priority */}
        <link
          rel="preload"
          href={featured.imageUrl}
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

        {/* 20–35% Scroll: Chapter 01 — pinned, word-scrubbed philosophy statement */}
        <div ref={headlineRef} className="relative z-10">
          <PhilosophyChapter />
        </div>

        {/* 35–55% Scroll: The two tools, presented as a core attraction */}
        <div ref={ctaRef} className="relative z-10">
          <ToolsChapter />
        </div>

        {/* Chapter 02 — pinned services accordion */}
        <div className="relative z-10 mb-[14vh]">
          <ExpertiseChapter />
        </div>

        {/* 55–80% Scroll: Featured project — editorial photograph treatment */}
        <section className="home-section-frame relative z-10 w-full mb-[18vh] overflow-visible">
          <div ref={featuredRef} className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto flex flex-col-reverse md:flex-row items-end gap-12 md:gap-16">
            {/* Left: copy block */}
            <div className="w-full md:w-[38%] pb-0 md:pb-12 shrink-0">
              <span className="home-kicker mb-6 block uppercase text-[10px] tracking-[0.25em] font-bold">{featured.eyebrow}</span>
              <h3 className="font-display text-3xl md:text-5xl mb-6 text-[var(--s-text-primary)] font-normal leading-[1.1]" style={{ letterSpacing: "-0.025em" }}>{featured.title}</h3>
              {featured.chips.length > 0 && (
                <div className="flex gap-2 mb-6">
                  {featured.chips.map((chip, i) => (
                    <span key={`${chip}-${i}`} className="home-chip text-[10px] uppercase tracking-[0.12em] font-medium px-2.5 py-1 border border-white/10 bg-white/[0.02] rounded-md">{chip}</span>
                  ))}
                </div>
              )}
              <p className="home-body text-sm leading-relaxed max-w-[38ch] mb-10 text-white/70">
                {featured.description}
              </p>
              {featured.linkLabel && (
                <ContentLink
                  href={featured.linkHref}
                  className="home-button-sweep inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold border-b border-white/20 pb-2 text-[#C9A85C] transition-colors duration-500 hover:border-[#C9A85C] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] motion-reduce:transition-none group"
                >
                  <span>{featured.linkLabel}</span>
                  <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">→</span>
                </ContentLink>
              )}
            </div>
            {/* Right: editorial photograph — bleeds past container, sharp architectural corners */}
            <div className="w-full md:w-[62%] md:-mr-[4vw] lg:-mr-[6vw]">
              <div className="aspect-[4/5] md:aspect-[4/3] lg:aspect-[3/2] overflow-hidden relative group rounded-none">
                <img 
                  src={featured.imageUrl}
                  className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100 rounded-none" 
                  alt={featured.imageAlt} 
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

        {/* Chapter 03 — pinned five-stage journey */}
        <div className="relative z-10 mb-[10vh]">
          <ProcessChapter />
        </div>

        {/* Chapter 04 — scroll-scrubbed before/after wipe */}
        <div className="relative z-10 mb-[10vh]">
          <TransformationChapter />
        </div>

        <HomeFAQ />

        {/* 80–100% Scroll: Gallery invitation — refined editorial transition */}
        <section className="home-section-frame relative z-10 w-full px-6 md:px-12 lg:px-24 py-[14vh] md:py-[16vh] max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center">
          {/* Vertical gold rule — gentle transition guide */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#C9A85C]/40 to-transparent mb-8" aria-hidden="true" />
          {/* Restrained eyebrow */}
          <span className="mb-4 block uppercase text-[10px] tracking-[0.25em] font-bold text-white/40">{galleryCta.eyebrow}</span>
          {/* Proportionally balanced statement */}
          <h2
            className="font-display text-[clamp(2.25rem,4.5vw,4rem)] mb-8 text-[var(--s-text-primary)] font-normal leading-[1.1]"
            style={{ letterSpacing: "-0.025em" }}
          >
            {galleryCta.heading}
          </h2>
          {/* Gold thin rule */}
          <div className="w-10 h-px bg-[#C9A85C]/40 mb-8" aria-hidden="true" />
          <ContentLink
            href={galleryCta.linkHref}
            className="home-button-sweep inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold border-b border-[#C9A85C]/40 pb-2 text-[#C9A85C] transition-colors duration-500 hover:border-[#C9A85C] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] motion-reduce:transition-none group"
          >
            <span>{galleryCta.linkLabel}</span>
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </ContentLink>
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
          telephone: settings.phone || SITE_CONSTANTS.defaultPhone,
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
            settings.social_links?.facebook || SITE_CONSTANTS.socials.facebook,
            settings.social_links?.instagram || SITE_CONSTANTS.socials.instagram
          ].filter(Boolean)
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
      {faq.items.length > 0 && <SchemaMarkup
        type="FAQPage"
        data={{
          faqs: faq.items.map(({ question, answer }) => ({ question, answer })),
        }}
      />}
      <ScrollToTop />
    </>
  );
};

export default Index;