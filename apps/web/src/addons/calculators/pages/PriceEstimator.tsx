import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Building2, PaintBucket, PenTool } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EstimatorCard from "@/components/estimator/EstimatorCard";
import { CostEstimator } from "@/addons/calculators/components/CostEstimator";

const PriceEstimator = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const paths = [
    {
      id: "residential",
      title: "Residential",
      description: "Apartments, villas, and personal homes designed for your lifestyle.",
      icon: <LayoutGrid size={32} className="text-[var(--site-crimson)]" />
    },
    {
      id: "commercial",
      title: "Commercial",
      description: "Offices, retail spaces, and studios optimized for productivity & brand.",
      icon: <Building2 size={32} className="text-[var(--site-crimson)]" />
    },
    {
      id: "renovation",
      title: "Renovation",
      description: "Transform existing spaces with full or partial structural upgrades.",
      icon: <PaintBucket size={32} className="text-[var(--site-crimson)]" />
    },
    {
      id: "custom",
      title: "Custom Project",
      description: "Bespoke furniture, single room setups, or unique architectural features.",
      icon: <PenTool size={32} className="text-[var(--site-crimson)]" />
    }
  ];

  if (selectedPath) {
    return (
      <div className="h-screen w-full bg-background overflow-hidden">
        <Helmet>
          <title>Interior Cost Estimator | Cross Angle Interior</title>
        </Helmet>
        <CostEstimator />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Interior Cost Estimator | Cross Angle Interior</title>
        <meta
          name="description"
          content="Get a transparent, instant estimate for your interior design project. Select your path to begin."
        />
      </Helmet>
      
      <Navbar />

      <main className="min-h-screen relative z-10 bg-[var(--site-bg)] pt-32 pb-20 flex flex-col items-center justify-center overflow-x-hidden">
        
        {/* Cinematic Noise & Glow Overlay */}
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none mix-blend-overlay" />
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-[var(--home-glow-crimson)] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-[var(--home-glow-gold)] blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center min-h-[60vh] justify-center">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center"
            >
              <div className="eyebrow justify-center mb-6">Start Your Journey</div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif tracking-tight mb-4">
                Select <span className="text-crimson-italic">Your Path</span>
              </h1>
              <p className="text-[var(--site-text-muted)] max-w-2xl mx-auto mb-16 leading-relaxed">
                Every great space begins with a precise understanding of scope. Choose the category that best aligns with your vision to get a comprehensive cost breakdown.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
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
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default PriceEstimator;
