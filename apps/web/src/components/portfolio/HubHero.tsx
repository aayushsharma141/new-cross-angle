import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

const HERO_IMAGES = [
  {
    url: portfolioBedroom,
    title: "Serene Sanctuaries",
    subtitle: "Designed for restful nights and peaceful mornings."
  },
  {
    url: portfolioKitchen,
    title: "Culinary Excellence",
    subtitle: "The heart of your home, reimagined for efficiency."
  },
  {
    url: portfolioOffice,
    title: "Productive Environments",
    subtitle: "Spaces that inspire creativity and professional growth."
  }
];

const HubHero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Cinematic Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 2, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_IMAGES[index].url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl"
        >
          <motion.span 
            className="mb-4 inline-block text-[10px] uppercase tracking-[0.4em] text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            The Experience Hub
          </motion.span>
          <h1 className="mb-6 text-4xl font-extralight tracking-tight text-white md:text-6xl lg:text-7xl">
            Not Just Interiors…<br />
            <span className="italic text-white/90">Spaces That Reflect Who You Are</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-white/70 md:text-xl">
            Explore designs crafted for real lifestyles, real homes, and real emotions. 
            Every corner tells a story of identity and purpose.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="group h-14 rounded-none bg-white px-10 text-[11px] uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90"
              onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Projects
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 rounded-none border-white/20 bg-transparent px-10 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
              onClick={() => window.location.href = '/style-quiz'}
            >
              Find Your Style
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">Scroll to Explore</span>
          <ArrowDown className="h-4 w-4 text-white/40" />
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute right-10 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-4">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 w-8 transition-all duration-500 ${
              i === index ? "bg-white" : "bg-white/20"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HubHero;
