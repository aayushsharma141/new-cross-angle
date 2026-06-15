import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  LayoutGrid,
  MessageSquareText,
  PaintBucket,
  PenTool,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";
import EstimatorCard from "@/components/estimator/EstimatorCard";
import { CostEstimator } from "@/addons/calculators/components/CostEstimator";
import { EstimatorBackground } from "@/addons/_shared/components/backgrounds/EstimatorBackground";
import { loadDiscoveryResult } from "@/addons/discovery/core/persistence";
import { ECOSYSTEM_COPY, ECOSYSTEM_ROUTES } from "@/addons/_shared/ecosystemCopy";
import { SiteBreadcrumb } from "@/components/shared/SiteBreadcrumb";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";

const CostEstimatorPage = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const discovery = useMemo(() => loadDiscoveryResult(), []);
  const blueprintName = discovery?.aiIdentity?.identityName || discovery?.displayName || discovery?.archetype;
  const hasBlueprint = Boolean(blueprintName);

  const paths = [
    {
      id: "residential",
      title: "Residential",
      description: "Homes, apartments, and villas planned around lifestyle, rooms, and finish level.",
      icon: <LayoutGrid size={32} className="text-[#8b6f47]" />
    },
    {
      id: "commercial",
      title: "Commercial",
      description: "Offices, studios, and retail spaces shaped around brand and operational needs.",
      icon: <Building2 size={32} className="text-[#8b6f47]" />
    },
    {
      id: "renovation",
      title: "Renovation",
      description: "Upgrade an existing space with practical scope, phasing, and cost clarity.",
      icon: <PaintBucket size={32} className="text-[#8b6f47]" />
    },
    {
      id: "custom",
      title: "Custom Project",
      description: "Single rooms, bespoke furniture, and special requirements that need a custom brief.",
      icon: <PenTool size={32} className="text-[#8b6f47]" />
    }
  ];

  const ecosystemSteps = [
    {
      icon: <Compass className="w-5 h-5 text-[#233526]" />,
      ...ECOSYSTEM_COPY.discoveryRole,
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#8b6f47]" />,
      ...ECOSYSTEM_COPY.estimatorRole,
    },
    {
      icon: <MessageSquareText className="w-5 h-5 text-[#233526]" />,
      ...ECOSYSTEM_COPY.consultationRole,
    },
  ];

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
            className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
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

        {/* Premium Light Travertine Background */}
        <EstimatorBackground />

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
                
                <SiteBreadcrumb items={[{ label: "Cost Estimator" }]} className="mb-4" />

                {/* Urgency badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md border border-[#233526]/20 rounded-full shadow-sm"
                >
                  <Sparkles size={14} className="text-[#8b6f47]" />
                  <span className="text-xs font-mono tracking-widest uppercase text-[#1a1a1a] font-bold">
                    Free · Smart Calculation · 3 minutes
                  </span>
                </motion.div>

                <h2 className="text-xs font-mono tracking-[0.35em] uppercase text-[#70593a] font-semibold mb-5">
                  Interior Personalization Ecosystem
                </h2>

                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif italic leading-[1.05] mb-5 text-[#1a1a1a] tracking-tight">
                  Estimate with your<br />
                  <span className="text-[#233526]">Discovery Blueprint.</span>
                </h1>

                <p className="text-lg md:text-xl text-[#5a5a5a] font-light max-w-2xl mb-8 leading-relaxed">
                  The Estimator is the practical execution layer of the Discovery Engine. Start with Discovery for a richer, more personal report, then turn that blueprint into an accurate investment range.
                </p>

                {/* Connection Status */}
                <div className="mb-10 flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl border border-[#e8e4dd] rounded-full shadow-sm">
                  {hasBlueprint ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8b6f47]" />
                  ) : (
                    <Compass className="w-4 h-4 text-[#8b6f47]" />
                  )}
                  <span className="text-sm font-medium text-[#1a1a1a]">
                    {hasBlueprint ? `Connected to ${blueprintName}` : "Create a Discovery Blueprint first for best results"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  {hasBlueprint ? (
                    <button
                      type="button"
                      onClick={() => setSelectedPath("personalized")}
                      className="group w-full sm:w-auto px-10 py-4 md:px-14 md:py-5 bg-gradient-to-r from-[#233526] to-[#2c3d2f] text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase rounded-full hover:shadow-[0_12px_30px_rgba(35,53,38,0.25)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b6f47]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      {ECOSYSTEM_COPY.ctas.startPersonalizedEstimator}
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </button>
                  ) : (
                    <Link
                      to={ECOSYSTEM_ROUTES.discovery}
                      className="group w-full sm:w-auto px-10 py-4 md:px-14 md:py-5 bg-gradient-to-r from-[#233526] to-[#2c3d2f] text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase rounded-full hover:shadow-[0_12px_30px_rgba(35,53,38,0.25)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b6f47]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      {ECOSYSTEM_COPY.ctas.startDiscovery}
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setSelectedPath("direct")}
                    className="group w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 border border-[#1a1a1a]/20 bg-white/95 backdrop-blur-md text-[#1a1a1a] text-xs md:text-sm font-bold tracking-[0.15em] uppercase rounded-full hover:border-[#1a1a1a]/60 hover:bg-white hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {hasBlueprint ? "Adjust Scope Manually" : ECOSYSTEM_COPY.ctas.startEstimator}
                  </button>
                </div>
              </section>

              <section className="max-w-6xl mx-auto pt-16">
                <div className="text-center mb-10">
                  <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#8b6f47] mb-3">
                    Scope Selection
                  </p>
                  <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] mb-3">
                    Choose the practical estimate path
                  </h2>
                  <p className="text-sm md:text-base text-[#5a5a5a] max-w-2xl mx-auto leading-relaxed">
                    These paths define the execution context. Your Discovery Blueprint, when available, continues to personalize service level and add-on suggestions inside the estimator.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {paths.map((path) => (
                  <EstimatorCard
                    key={path.id}
                    title={path.title}
                    description={path.description}
                    icon={path.icon}
                    onClick={() => setSelectedPath(path.id)}
                  />
                ))}
                </div>
              </section>
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </>
  );
};

export default CostEstimatorPage;
