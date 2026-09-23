import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { PageHero } from "@/components/motion/PageHero";
import { ServicesHeroTagline } from "@/components/services/ServicesHeroTagline";
import ServiceDomain from "@/components/services/ServiceDomain";
import ServicesDeliverables from "@/components/services/ServicesDeliverables";
import ServicesInvestmentTiers from "@/components/services/ServicesInvestmentTiers";
import ServicesFAQ from "@/components/services/ServicesFAQ";
import { Em, textLinkClass } from "@/components/editorial";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/primitives/button";

/**
 * Services — three domains on one editorial system.
 *
 * Hero → residential / commercial / specialized (identical card treatment)
 * → what's included → investment tiers → FAQ. The footer carries the
 * page-aware closing CTA.
 */
const ServicesPage = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setTimeout(() => {
        const element = document.getElementById(category.toLowerCase());
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500); // Wait for content to render
    }
  }, [searchParams]);

  const { data: services, isLoading, isError, refetch } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  if (isError) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)] p-6">
          <div className="max-w-md text-center space-y-6">
            <h2 className="font-display text-3xl text-primary">Failed to load services</h2>
            <p className="text-white/60 font-light">There was a network error loading our design domains. Please check your connection and try again.</p>
            <Button onClick={() => refetch()} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold focus-visible:ring-2 focus-visible:ring-primary">
              Retry Connection
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const byCategory = (id: string) => (services || []).filter((s) => s.category_id === id);

  return (
    <>
      <Helmet>
        <title>Services | CrossAngle Interior</title>
        <meta
          name="description"
          content="Ultra-luxury turnkey interior solutions. Design intelligence paired with hospitality-grade precision."
        />
        <meta property="og:title" content="Services | CrossAngle Interior" />
        <meta property="og:description" content="Ultra-luxury turnkey interior solutions. Design intelligence paired with hospitality-grade precision." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crossangleinterior.com/services" />
        <link rel="canonical" href="https://crossangleinterior.com/services" />
      </Helmet>

      <Navbar />
      <main id="main-content" className="relative z-10 min-h-screen overflow-x-clip bg-[var(--s-canvas-primary)] font-sans text-white">
        <PageHero
          size="md"
          kicker="Our services"
          lines={["From empty shell to", <span key="l2">move-in ready <span className="italic font-light text-[#C9A85C]">home.</span></span>]}
          lede={<ServicesHeroTagline />}
          image={{ entity: "services", fallback: "/reality_render.jpg", alt: "" }}
          actions={
            <>
              <Link to="/estimate" className={textLinkClass}>
                Get an estimate <span aria-hidden="true">→</span>
              </Link>
              <a href="#residential" className={textLinkClass}>
                Browse services <span aria-hidden="true">↓</span>
              </a>
            </>
          }
        />

        <ServiceDomain
          id="residential"
          rule={false}
          eyebrow="Domain I"
          heading={<>Residential <Em>design.</Em></>}
          body="Custom interiors built for your lifestyle, comfort, and lasting value — planned around how you actually live."
          services={byCategory("residential")}
          isLoading={isLoading}
        />

        <ServiceDomain
          id="commercial"
          eyebrow="Domain II"
          heading={<>Office & commercial <Em>interiors.</Em></>}
          body="Functional workspaces designed for productivity and brand impact, delivered without disrupting your operation."
          services={byCategory("commercial")}
          isLoading={isLoading}
        />

        <ServiceDomain
          id="specialized"
          eyebrow="Domain III"
          heading={<>Specialized services & <Em>custom building.</Em></>}
          body="Modular kitchens, ceilings and bespoke joinery — engineered in-house and installed by our own team."
          services={byCategory("specialized")}
          isLoading={isLoading}
        />

        <ServicesDeliverables />
        <ServicesInvestmentTiers />
        <ServicesFAQ />

      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ServicesPage;
