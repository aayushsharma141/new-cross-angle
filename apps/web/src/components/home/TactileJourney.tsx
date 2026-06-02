import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";
import { cn } from "@/lib/utils";
import { TactileMaterial } from "@/components/ui/enhanced/TactileMaterial";
import { Image } from "@/components/ui/enhanced/image";

const moods = [
  {
    id: "modern-wardrobe",
    title: "The Modern Wardrobe",
    description: (<>Fluted <TactileMaterial name="glass" texture="glass" />, back-lit shelving, and seamless matte finishes designed for quiet mornings.</>),
    image: portfolioBedroom,
  },
  {
    id: "minimalist-kitchen",
    title: "The Minimalist Kitchen",
    description: (<>Handleless cabinetry, striking <TactileMaterial name="stone countertops" texture="stone" />, and hidden appliances for a clutter-free mind.</>),
    image: portfolioKitchen,
  },
  {
    id: "executive-lounge",
    title: "The Executive Lounge",
    description: (<>Deep <TactileMaterial name="wood grains" texture="wood" />, acoustic paneling, and warm ambient lighting for deep, uninterrupted focus.</>),
    image: portfolioOffice,
  },
  {
    id: "serene-bath",
    title: "The Serene Bath",
    description: (<>Textured <TactileMaterial name="stone" texture="stone" />, <TactileMaterial name="brushed brass" texture="brass" /> fixtures, and natural light creating a spa-like daily ritual.</>),
    image: portfolioBedroom,
  }
];

export const TactileJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && scrollRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scrollWidth = scrollRef.current.scrollWidth;
        setDragConstraints({
          right: 0,
          left: Math.min(0, -(scrollWidth - containerWidth)),
        });
      }
    };

    updateConstraints();
    setTimeout(updateConstraints, 300);
    const imgs = scrollRef.current?.querySelectorAll("img");
    imgs?.forEach((img) => img.addEventListener("load", updateConstraints));
    window.addEventListener("resize", updateConstraints);
    return () => {
      imgs?.forEach((img) => img.removeEventListener("load", updateConstraints));
      window.removeEventListener("resize", updateConstraints);
    };
  }, []);

  return (
    <section className="py-24 md:py-32 relative bg-[#050505] overflow-hidden" ref={containerRef}>
      <div className="container mx-auto px-6 lg:px-12 mb-12 md:mb-20">
        <span className="home-kicker mb-6 block">
          <span>The Tactile Journey</span>
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2 className="font-display text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.05] tracking-[-0.02em] max-w-2xl">
            <span className="text-site-gold block mb-2">Spaces Designed Around</span>
            <span className="text-white italic">Feeling, not just function.</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-sm leading-relaxed mb-2">
            Swipe through our curated moods. Hover to reveal the textures and lighting that define each atmosphere.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <motion.div 
        ref={scrollRef}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.2}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        dragMomentum={true}
        style={{ touchAction: "pan-y" }}
        className="flex w-max pb-12 px-6 lg:px-12 gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
      >
        {moods.map((mood, i) => (
          <div 
            key={mood.id}
            className="shrink-0 w-[85vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] max-w-[480px] group cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
              <Image
                src={mood.image} 
                alt={mood.title}
                loading="lazy"
                className="h-full w-full pointer-events-none"
                imageClassName="transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                width={720}
                height={900}
                draggable={false}
              />
              
              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="overflow-hidden mb-2">
                  <span className="block text-site-gold text-xs tracking-[0.2em] uppercase font-medium transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    Mood 0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
                  {mood.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-[90%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {mood.description}
                </p>
                
                <div className="mt-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 translate-y-4 group-hover:translate-y-0">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-site-gold group-hover:border-site-gold group-hover:text-black transition-colors duration-300">
                    <ArrowRight size={16} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                    Explore Style
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};
