import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Image } from "@/components/ui/image";

interface ProjectHeroProps {
  heroImage: string;
  title: string;
  category: string;
  style: string;
  location: string;
  tagline?: string;
}

const ProjectHero = ({ heroImage, title, tagline }: ProjectHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden bg-neutral-950 text-stone-100">
      {/* Cinematic Image with Slow Scale and Pulse */}
      <motion.div className="absolute inset-0 bg-neutral-900" style={{ y, opacity }}>
        <Image
          src={heroImage}
          alt={title}
          className="h-full w-full"
          imageClassName="object-center opacity-70 mix-blend-luminosity animate-[pulse_20000ms_ease-in-out_infinite_alternate] scale-105"
          width={1920}
          height={1080}
          loading="eager"
        />
      </motion.div>
      
      {/* Luxury Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/20 to-neutral-950/95" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight leading-none mb-8 font-serif font-normal drop-shadow-2xl"
        >
          {title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="text-xs md:text-sm font-light tracking-[0.25em] uppercase text-stone-300 mb-16 flex items-center justify-center gap-4"
        >
          {tagline || "Designed for stillness. Built for escape."}
        </motion.p>

        <motion.a 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          href="#experience" 
          className="group flex flex-col items-center gap-4"
        >
          <button className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/30 text-white px-8 py-4 rounded-full text-xs font-medium tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-3">
            Explore This Space
            <ArrowDown className="text-sm w-4 h-4 group-hover:translate-y-1 transition-transform duration-500" />
          </button>
        </motion.a>
      </div>
    </div>
  );
};

export default ProjectHero;
