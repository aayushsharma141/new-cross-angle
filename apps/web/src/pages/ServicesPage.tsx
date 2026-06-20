import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import ScrollToTop from "@/components/layout/ScrollToTop";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesMarquee from "@/components/services/ServicesMarquee";
import ServicesWhyUs from "@/components/services/ServicesWhyUs";
import ServicesCTA from "@/components/services/ServicesCTA";
import ServicesEngines from "@/components/services/ServicesEngines";
import ProcessTeaser from "@/components/services/ProcessTeaser";
import ServiceArchetypes from "@/components/services/ServiceArchetypes";
import ServicesDeliverables from "@/components/services/ServicesDeliverables";
import ServicesInvestmentTiers from "@/components/services/ServicesInvestmentTiers";
import ServicesTransformations from "@/components/services/ServicesTransformations";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesFAQ from "@/components/services/ServicesFAQ";
import { Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image } from "@/components/ui/enhanced/image";
import { Button } from "@/components/ui/primitives/button";

// Icon mapping helper
const IconMap: Record<string, LucideIcon> = {
  Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed
};

const EmptyCategoryState = ({ label }: { label: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-[#EDEDED]/55">
    No {label.toLowerCase()} services are currently listed. Check back soon for updates.
  </div>
);


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
        <main id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-[#EDEDED] p-6">
          <div className="max-w-md text-center space-y-6">
            <h2 className="font-serif text-3xl text-site-crimson">Failed to load services</h2>
            <p className="text-white/60 font-light">There was a network error loading our design domains. Please check your connection and try again.</p>
            <Button onClick={() => refetch()} className="bg-site-crimson text-white hover:bg-site-crimson/90 px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold">
              Retry Connection
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }



  const residentialRaw = (services || []).filter(s => s.category_id === 'residential');
  const commercialRaw = (services || []).filter(s => s.category_id === 'commercial');
  const specializedRaw = (services || []).filter(s => s.category_id === 'specialized');

  const residentialServices = residentialRaw;
  const commercialServices = commercialRaw;
  const specializedServices = specializedRaw;

  return (
    <>
      <h1 className="sr-only">Our Services | Cross Angle Interior</h1>
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
      <main id="main-content" className="min-h-screen relative z-10 bg-[#000000] overflow-hidden text-[#EDEDED] font-sans">

        <ServicesHero />
        <ServicesMarquee />
        <ServiceArchetypes />

        {/* RESIDENTIAL */}
        <section id="residential" className="relative overflow-hidden py-24 lg:py-40 px-6">
          <div className="absolute top-0 right-1/4 w-px h-full bg-white/[0.03]" />
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 border-b border-white/5 pb-12">
              <div className="max-w-[600px]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="w-12 h-px bg-site-crimson" />
                  <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">Domain I</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-serif font-bold text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-white"
                >
                  Residential<br />
                  <em className="italic font-light text-site-crimson underline underline-offset-[12px] decoration-white/10 decoration-[4px]">Design</em>
                </motion.h2>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[1.1rem] text-white/60 max-w-[36ch] font-light leading-relaxed md:text-right"
              >
                Custom interiors built for your lifestyle, comfort, and lasting value.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {residentialServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/services/${service.category_id}/${service.slug}`} className="group block relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/[0.08] transition-all duration-500 hover:border-[#D1AF6E]/50 hover:shadow-2xl hover:shadow-[rgba(209,175,110,0.08)]">
                    <Image
                      src={service.hero_image}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full"
                      imageClassName="scale-105 grayscale-[0.5] brightness-[0.7] transition-all duration-700 group-hover:scale-100 group-hover:grayscale-0 group-hover:brightness-[0.85]"
                      width={720}
                      height={960}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <div className="font-display italic text-[1.75rem] text-white mb-3 group-hover:translate-x-2 transition-transform">
                        {service.title}
                      </div>
                      <p className="text-[0.9rem] text-white/50 leading-relaxed font-light mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-3 text-[#D1AF6E] font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-0 translate-y-2">
                        Detailed Briefing
                        <div className="w-8 h-px bg-[#D1AF6E]" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            {!isLoading && residentialServices.length === 0 && (
              <EmptyCategoryState label="Residential" />
            )}
          </div>
        </section>

        {/* COMMERCIAL */}
        <section id="commercial" className="relative bg-[#050505] border-y border-white/[0.05] overflow-hidden py-24 lg:py-48 px-6">
          <div className="absolute left-1/4 w-px h-full bg-white/[0.03] pointer-events-none" />
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 border-b border-white/5 pb-12">
              <div className="max-w-[600px]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="w-12 h-px bg-site-crimson" />
                  <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">Domain II</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-serif font-bold text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-white"
                >
                  <span className="whitespace-nowrap">Office &amp; Commercial</span><br />
                  <em className="italic font-light text-site-crimson underline underline-offset-[12px] decoration-white/10 decoration-[4px]">Interiors</em>
                </motion.h2>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[1.1rem] text-white/60 max-w-[36ch] font-light leading-relaxed md:text-right"
              >
                Functional workspaces designed for productivity and brand impact.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05] overflow-hidden rounded-2xl">
              {commercialServices.map((service) => {
                const Icon = (service.icon ? IconMap[service.icon as keyof typeof IconMap] : undefined) || Building2;
                return (
                  <Link to={`/services/${service.category_id}/${service.slug}`} key={service.id} className="group relative bg-black p-10 lg:p-16 overflow-hidden transition-all duration-500 hover:bg-[#080808]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D1AF6E]/[0.03] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="mb-10 text-white/20 group-hover:text-[#D1AF6E] transition-colors duration-500">
                        <Icon className="w-12 h-12 stroke-[1px]" />
                      </div>
                      <div className="font-display italic text-[2.25rem] text-white mb-6 group-hover:translate-x-2 transition-transform duration-500">
                        {service.title}
                      </div>
                      <p className="text-[1rem] text-white/60 leading-relaxed font-light mb-10 group-hover:text-white/50 transition-colors line-clamp-3">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-3 text-[#D1AF6E] font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        Capability Profile
                        <div className="w-10 h-px bg-[#D1AF6E]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {!isLoading && commercialServices.length === 0 && (
              <div className="mt-14">
                <EmptyCategoryState label="Commercial" />
              </div>
            )}
          </div>
        </section>

        {/* SPECIALIZED */}
        <section id="specialized" className="relative bg-black overflow-hidden py-24 lg:py-48 px-6">
          <div className="max-w-[1400px] mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center items-center gap-4 mb-8"
            >
              <div className="w-12 h-px bg-site-crimson" />
              <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">Domain III</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif font-bold text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.1] tracking-tight text-white mb-16"
            >
              Specialized Services &<br />
              <em className="italic text-site-crimson font-light">Custom Building.</em>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {specializedServices.map((service, i) => {
                const Icon = (service.icon ? IconMap[service.icon as keyof typeof IconMap] : undefined) || Lamp;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/services/${service.category_id}/${service.slug}`} className="group block relative bg-[#050505] border border-white/[0.05] p-10 lg:p-14 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#D1AF6E]/40 hover:shadow-2xl hover:shadow-[rgba(209,175,110,0.06)]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1AF6E]/4 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="mb-8 p-3 w-fit rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/20 group-hover:text-[#D1AF6E] group-hover:border-[#D1AF6E]/30 transition-all">
                          <Icon className="w-10 h-10 stroke-[1.2px]" />
                        </div>
                        <div className="font-display italic text-[1.85rem] text-white mb-4">
                          {service.title}
                        </div>
                        <p className="text-[1rem] text-white/60 leading-relaxed font-light line-clamp-3">
                          {service.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            {!isLoading && specializedServices.length === 0 && (
              <div className="mt-12">
                <EmptyCategoryState label="Specialized" />
              </div>
            )}
          </div>
        </section>

        <ServicesDeliverables />
        <ServicesTransformations />
        <ServicesInvestmentTiers />
        <ServicesProcess />

        <ServicesEngines />
        <ServicesWhyUs />
        <ProcessTeaser />
        <ServicesFAQ />
        <ServicesCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ServicesPage;
