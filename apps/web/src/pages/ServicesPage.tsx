import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import ScrollToTop from "@/components/ScrollToTop";
import { LogoAnimation } from "@/components/LogoAnimation";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesMarquee from "@/components/services/ServicesMarquee";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesWhyUs from "@/components/services/ServicesWhyUs";
import ServicesCTA from "@/components/services/ServicesCTA";
import OurApproach from "@/components/services/OurApproach";
import ServicesEngines from "@/components/services/ServicesEngines";
import { ArrowRight, Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed, LucideIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Icon mapping helper
const IconMap: Record<string, LucideIcon> = {
  Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed
};


const ServicesPage = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });



  const residentialRaw = (services || []).filter(s => s.category_id === 'residential');
  const commercialRaw = (services || []).filter(s => s.category_id === 'commercial');
  const specializedRaw = (services || []).filter(s => s.category_id === 'specialized');

  // Fallback data when database is empty
  const fallbackResidential = [
    { id: 'r1', title: 'Living Room Design', description: 'Curated living spaces that balance aesthetics with everyday functionality.', slug: 'living-room', category_id: 'residential', hero_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=75', icon: 'Sofa' },
    { id: 'r2', title: 'Bedroom & Wardrobe', description: 'Personalized bedrooms with custom wardrobes and premium finishes.', slug: 'bedroom', category_id: 'residential', hero_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=75', icon: 'Bed' },
    { id: 'r3', title: 'Kitchen & Dining', description: 'Modular kitchens with intelligent storage and hospitality-grade finishes.', slug: 'kitchen', category_id: 'residential', hero_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=75', icon: 'UtensilsCrossed' },
  ];
  const fallbackCommercial = [
    { id: 'c1', title: 'Office Design', description: 'Productive work environments engineered for performance and brand identity.', slug: 'office', category_id: 'commercial', icon: 'Building2' },
    { id: 'c2', title: 'Retail Spaces', description: 'Engaging customer experiences through strategic spatial design.', slug: 'retail', category_id: 'commercial', icon: 'Palette' },
    { id: 'c3', title: 'Restaurant & Cafe', description: 'Memorable dining atmospheres with hospitality-grade detailing.', slug: 'restaurant', category_id: 'commercial', icon: 'UtensilsCrossed' },
  ];
  const fallbackSpecialized = [
    { id: 's1', title: 'Modular Kitchens', description: 'In-house manufactured modular solutions with precision engineering.', slug: 'modular-kitchen', category_id: 'specialized', icon: 'Lamp' },
    { id: 's2', title: 'Custom Furniture', description: 'Bespoke furniture crafted to your exact specifications.', slug: 'custom-furniture', category_id: 'specialized', icon: 'Sofa' },
    { id: 's3', title: 'Lighting Design', description: 'Architectural lighting that transforms ambience and elevates experience.', slug: 'lighting', category_id: 'specialized', icon: 'Lightbulb' },
  ];

  const residentialServices = residentialRaw.length > 0 ? residentialRaw : fallbackResidential;
  const commercialServices = commercialRaw.length > 0 ? commercialRaw : fallbackCommercial;
  const specializedServices = specializedRaw.length > 0 ? specializedRaw : fallbackSpecialized;

  return (
    <>
      <Helmet>
        <title>Services | CrossAngle Interior</title>
        <meta
          name="description"
          content="Ultra-luxury turnkey interior solutions. Design intelligence paired with hospitality-grade precision."
        />
      </Helmet>

      <Navbar />
      <main className="min-h-screen relative z-10 bg-[#000000] overflow-hidden text-[#EDEDED] font-sans">
        <FixedSocialBar />

        <ServicesHero />
        <ServicesMarquee />
        <OurApproach />

        {/* RESIDENTIAL */}
          <section id="residential" className="overflow-hidden" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
            <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-wrap justify-between items-end gap-5 mb-14">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3.5 mb-4 font-label text-[9px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A]"
                  >
                    Domain I
                    <div className="w-10 h-[1px] bg-[#FF2A2A]" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display font-normal text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[#EDEDED]"
                  >
                    Residential<br />
                    <em className="italic text-[#FF2A2A]">Design</em>
                  </motion.h2>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[0.92rem] text-[#EDEDED]/55 max-w-[34ch] font-light leading-[1.7] text-left md:text-right"
                >
                  Personalized turnkey interiors crafted for lifestyle, comfort, and long-term capital value.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                {residentialServices.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.85, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link to={`/services/${service.category_id}/${service.slug}`} className="block bg-[#0A0A0A] border border-white/10 overflow-hidden transition-colors duration-350 hover:border-[#FF2A2A]/50 cursor-pointer group/card filter-none">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={service.hero_image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=75"}
                          alt={service.title}
                          className="w-full h-full object-cover scale-[1.04] grayscale-[0.75] brightness-[0.72] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:grayscale-0 group-hover/card:brightness-[0.85] group-hover/card:scale-100"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/86 to-transparent to-[52%] pointer-events-none" />
                      </div>
                      <div className="p-[18px_22px_26px] border-t border-white/10">
                        <div className="font-display italic text-[1.45rem] font-normal mb-2 tracking-[-0.01em] text-[#EDEDED]">
                          {service.title}
                        </div>
                        <p className="text-[0.82rem] text-[#EDEDED]/55 leading-[1.65] font-light mb-3.5 line-clamp-2">
                          {service.description}
                        </p>
                        <span className="font-label text-[9px] font-bold tracking-[0.18em] uppercase text-[#FF2A2A] flex items-center gap-2 transition-all duration-250 group-hover/card:gap-3.5">
                          Explore Service <span className="text-[12px] leading-none mb-[2px]">→</span>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        {/* COMMERCIAL */}
          <section id="commercial" className="bg-[#0A0A0A] border-t border-white/10 overflow-hidden" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
            <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-wrap justify-between items-end gap-5 mb-14">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3.5 mb-4 font-label text-[9px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A]"
                  >
                    Domain II
                    <div className="w-10 h-[1px] bg-[#FF2A2A]" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display font-normal text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[#EDEDED]"
                  >
                    Commercial<br />
                    <em className="italic text-[#FF2A2A]">&amp; Office</em>
                  </motion.h2>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[0.92rem] text-[#EDEDED]/55 max-w-[34ch] font-light leading-[1.7] text-left md:text-right"
                >
                  Strategic interior solutions that amplify productivity, brand value, and customer experience.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 mt-14"
              >
                {commercialServices.map((service) => {
                  const Icon = IconMap[service.icon] || Building2;
                  return (
                    <Link to={`/services/${service.category_id}/${service.slug}`} key={service.id} className="block group bg-[#000000] overflow-hidden transition-colors duration-300 hover:bg-[#0D0D0D] relative" style={{ padding: "clamp(28px,3vw,52px)" }}>
                      {/* Red line reveal */}
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF2A2A] scale-y-0 origin-bottom transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                      
                      <div className="mb-6 text-[#EDEDED] grayscale-[1] brightness-[0.55] transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-100">
                        <Icon className="w-10 h-10 stroke-[1.5px]" />
                      </div>
                      <div className="font-display italic text-[2rem] font-normal mb-3.5 text-[#EDEDED]">
                        {service.title}
                      </div>
                      <p className="text-[0.88rem] text-[#EDEDED]/55 leading-[1.75] font-light line-clamp-3">
                        {service.description}
                      </p>
                    </Link>
                  );
                })}
              </motion.div>
            </div>
          </section>

        {/* SPECIALIZED */}
          <section id="specialized" className="bg-[#0A0A0A] border-y border-white/10 overflow-hidden" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
            <div className="max-w-[1400px] mx-auto">
              <div className="text-center mb-14 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-center items-center gap-3.5 mb-4 font-label text-[9px] font-bold tracking-[0.3em] uppercase text-[#FF2A2A]"
                >
                  <div className="w-10 h-[1px] bg-[#FF2A2A]" />
                  Specialized Execution
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-normal text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[1.04] tracking-[-0.02em] text-[#EDEDED]"
                >
                  Expert Solutions<br />
                  for Specific <em className="italic text-[#FF2A2A]">Requirements</em>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[0.95rem] text-[#EDEDED]/55 font-light max-w-[46ch] mx-auto mt-4 leading-[1.8]"
                >
                  Precision-crafted services requiring in-house manufacturing capability, specialist knowledge, and technical mastery at every stage.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] mt-12">
                {specializedServices.map((service, i) => {
                  const Icon = IconMap[service.icon] || Lamp;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 36 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.85, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link to={`/services/${service.category_id}/${service.slug}`} className="block border border-white/10 bg-[#000000] relative overflow-hidden transition-all duration-300 hover:border-[#FF2A2A]/35 hover:bg-[#050505] group" style={{ padding: "clamp(28px,3.5vw,50px)" }}>
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: "radial-gradient(circle, rgba(255,42,42,0.07) 0%, transparent 70%)" }} />
                        <div className="mb-[22px] text-[#EDEDED]">
                          <Icon className="w-10 h-10 stroke-[1.5px]" />
                        </div>
                        <div className="font-display italic text-[1.75rem] font-normal mb-3 text-[#EDEDED]">
                          {service.title}
                        </div>
                        <p className="text-[0.87rem] text-[#EDEDED]/55 leading-[1.7] font-light line-clamp-3">
                          {service.description}
                        </p>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

        <ServicesEngines />

        <ServicesWhyUs />
        <ServicesProcess />
        <ServicesCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ServicesPage;
