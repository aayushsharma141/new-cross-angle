import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";

import { CostEstimator } from "@/addons/calculators/components/CostEstimator";

import { MagicRings, SoftAurora, FallingText, Magnet } from "@/components/ReactBits";
import { loadDiscoveryResult } from "@/addons/discovery/core/persistence";
import { ECOSYSTEM_COPY, ECOSYSTEM_ROUTES } from "@/addons/_shared/ecosystemCopy";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";

const CostEstimatorPage = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const discovery = useMemo(() => loadDiscoveryResult(), []);
  const blueprintName = discovery?.aiIdentity?.identityName || discovery?.displayName || discovery?.archetype;
  const hasBlueprint = Boolean(blueprintName);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };




  if (selectedPath) {
    return (
      <main id="main-content" className="h-screen w-full bg-[#faf8f5] overflow-hidden relative">
        <Helmet>
          <title>Cost Estimator | Cross Angle Interior</title>
          <meta property="og:title" content="Cost Estimator | Cross Angle Interior" />
          <meta property="og:description" content="Estimate your interior design project cost — personalized for your style and scope." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://crossangleinterior.com/estimate" />
          <link rel="canonical" href="https://crossangleinterior.com/estimate" />
        </Helmet>
        <CostEstimator onBack={() => setSelectedPath(null)} />
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cost Estimator | Cross Angle Interior</title>
        <meta
          name="description"
          content="Turn your Discovery Blueprint into a personalized interior estimate, or start with a direct scope-based estimate."
        />
        <meta property="og:title" content="Cost Estimator | Cross Angle Interior" />
        <meta property="og:description" content="Turn your Discovery Blueprint into a personalized interior estimate, or start with a direct scope-based estimate." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crossangleinterior.com/estimate" />
        <link rel="canonical" href="https://crossangleinterior.com/estimate" />
      </Helmet>
      
      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Cost Estimator", url: "/estimate" }
          ]
        }}
      />

      <main id="main-content" className="min-h-screen flex flex-col relative z-10 bg-[#faf8f5] overflow-x-hidden">
        
        {/* Nav Header (Standalone) */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#7a5c30] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
            aria-label="Return to CrossAngle Home"
          >
            <img
              src={logoIcon}
              alt="Cross Angle Interior"
              className="h-11 md:h-16 w-auto transition-all duration-500 shrink-0 animate-in fade-in zoom-in duration-300"
            />
            <AnimatedLogo
              isScrolled={false}
              className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0 [&_span]:text-[#1a1a1a]"
            />
          </a>
        </div>

        {/* SoftAurora Ambient Background Light Rays */}
        <div className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none opacity-[0.35]">
          <SoftAurora
            speed={0.45}
            brightness={1.0}
            color1="#c4a882" // gold
            color2="#5a705e" // sage
            color3="#faf8f5" // cream
            enableMouseInteraction={true}
            mouseInfluence={0.15}
          />
        </div>

        {/* Magic Rings Luxury Background */}
        <div className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none opacity-45">
          <MagicRings
            color="#e2ba6e" // vibrant gold
            colorTwo="#2b4b32" // richer green
            ringCount={8}
            speed={0.4}
            attenuation={14}
            lineThickness={2.2}
            baseRadius={0.25}
            radiusStep={0.08}
            scaleRate={0.05}
            opacity={0.9}
            blur={0}
            noiseAmount={0.03}
            rotation={15}
            ringGap={1.4}
            fadeIn={0.6}
            fadeOut={0.7}
            followMouse={true}
            mouseInfluence={0.12}
            hoverScale={1.1}
            parallax={0.03}
            clickBurst={true}
          />
        </div>

        <div className="container flex-1 flex flex-col justify-center mx-auto px-6 relative z-10 pt-28 pb-16">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <section className="relative flex flex-col items-center justify-center max-w-4xl mx-auto text-center px-6">
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex flex-col items-center w-full"
                >


                  {/* Urgency badge */}
                  <motion.div
                    variants={itemVariants}
                    className="mb-8 flex items-center gap-2.5 px-5 py-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full shadow-[0_8px_32px_rgba(122,92,48,0.06)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_3s_infinite]" />
                    <Sparkles size={14} className="text-[#7a5c30]" />
                    <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#7a5c30] font-bold relative z-10">
                      Free · Smart Calculation · 3 minutes
                    </span>
                  </motion.div>



                  <motion.h1 
                    variants={itemVariants}
                    className="text-4xl md:text-6xl lg:text-[5rem] font-serif italic leading-[1.05] mb-6 text-[#1a1a1a] tracking-tight flex flex-col items-center"
                  >
                    <FallingText text="Know What Your Dream Interior Costs" className="justify-center" delay={20} />
                    <span className="text-[#233526] mt-3 relative">
                      <span className="text-base md:text-lg lg:text-xl font-mono tracking-[0.15em] uppercase font-semibold">Powered by Your Discovery Blueprint</span>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#7a5c30]/40 to-transparent" />
                    </span>
                  </motion.h1>

                  <motion.p 
                    variants={itemVariants}
                    className="text-lg md:text-xl text-[#5a5a5a] font-light max-w-2xl mb-10 leading-relaxed"
                  >
                    Your style meets your budget. Turn your personal Discovery Blueprint into a clear, personalized investment range — no guesswork, just the confidence to bring your vision to life.
                  </motion.p>

                  {/* Connection Status — Compact */}
                  <motion.div variants={itemVariants} className="mb-10">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/60 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                      {hasBlueprint ? (
                        <>
                          <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                          </span>
                          <span className="text-[11px] md:text-xs text-[#1a1a1a] font-medium tracking-tight">
                            Connected to <span className="font-semibold">{blueprintName}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                            <Compass size={12} className="text-[#7a5c30]" />
                          </span>
                          <span className="text-[11px] md:text-xs text-[#1a1a1a] font-medium tracking-tight">
                            No Blueprint yet —{" "}
                            <Link to={ECOSYSTEM_ROUTES.discovery} className="underline underline-offset-2 hover:text-[#7a5c30] transition-colors">
                              Create one first
                            </Link>
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full"
                  >
                    {hasBlueprint ? (
                      <Magnet range={60} className="w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedPath("personalized")}
                          className="group w-full sm:w-auto px-10 py-5 md:px-14 md:py-6 bg-[#233526] text-white text-xs md:text-sm font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-[#1a281c] shadow-[0_12px_32px_rgba(35,53,38,0.25)] hover:shadow-[0_20px_48px_rgba(35,53,38,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7a5c30] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-400 flex items-center justify-center gap-4 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                          <span className="relative z-10">{ECOSYSTEM_COPY.ctas.startPersonalizedEstimator}</span>
                          <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                          </div>
                        </button>
                      </Magnet>
                    ) : (
                      <Magnet range={60} className="w-full sm:w-auto">
                        <Link
                          to={ECOSYSTEM_ROUTES.discovery}
                          className="group w-full sm:w-auto px-10 py-5 md:px-14 md:py-6 bg-[#233526] text-white text-xs md:text-sm font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-[#1a281c] shadow-[0_12px_32px_rgba(35,53,38,0.25)] hover:shadow-[0_20px_48px_rgba(35,53,38,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7a5c30] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-400 flex items-center justify-center gap-4 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                          <span className="relative z-10">{ECOSYSTEM_COPY.ctas.startDiscovery}</span>
                          <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                          </div>
                        </Link>
                      </Magnet>
                    )}
                    
                    <Magnet range={50} className="w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedPath("direct")}
                        className="group w-full sm:w-auto px-8 py-5 md:px-10 md:py-6 border border-[#1a1a1a]/15 bg-white/60 backdrop-blur-xl text-[#1a1a1a] text-xs md:text-sm font-bold tracking-[0.15em] uppercase rounded-full hover:border-[#1a1a1a]/30 hover:bg-white/90 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7a5c30] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-400 flex items-center justify-center gap-2"
                      >
                        {hasBlueprint ? "Estimate Without Blueprint" : "Estimate Directly"}
                      </button>
                    </Magnet>
                  </motion.div>
                </motion.div>
              </section>


            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </>
  );
};

export default CostEstimatorPage;
