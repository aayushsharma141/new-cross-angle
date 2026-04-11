import { motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import portfolioBedroom from "@/assets/portfolio-bedroom.jpg";
import portfolioKitchen from "@/assets/portfolio-kitchen.jpg";
import portfolioOffice from "@/assets/portfolio-office.jpg";

const SPACES = [
  {
    id: "bedroom",
    name: "Bedroom Spaces",
    headline: "Designed for restful nights",
    image: portfolioBedroom,
    href: "/gallery?category=Bedroom Interior"
  },
  {
    id: "living",
    name: "Living Rooms",
    headline: "Built for functional luxury",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    href: "/gallery?category=Living Room Interior"
  },
  {
    id: "kitchen",
    name: "Modular Kitchens",
    headline: "Heart of the home",
    image: portfolioKitchen,
    href: "/gallery?category=Modular Kitchen"
  },
  {
    id: "commercial",
    name: "Commercial Spaces",
    headline: "Productivity redefined",
    image: portfolioOffice,
    href: "/gallery?category=Commercial"
  },
  {
    id: "wardrobe",
    name: "Wardrobes",
    headline: "Organized elegance",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200&auto=format&fit=crop",
    href: "/gallery?category=Wardrobe"
  }
];

const SpaceNavigator = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;
    const card = containerRef.current.querySelector(".snap-card") as HTMLElement;
    const offset = card ? card.offsetWidth + 32 : 480;
    containerRef.current.scrollBy({ left: dir === "right" ? offset : -offset, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-6 mb-16 text-center">
        <span className="mb-4 block text-[10px] uppercase tracking-[0.4em] text-site-gold">Choose Your World</span>
        <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl mb-6">Space-Based Exploration</h2>
        <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-white/50 mb-8">
          Navigate through our portfolio by the spaces that matter to you.
          Each category is a curated journey of spatial storytelling.
        </p>
        
        {/* Arrow Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex w-full gap-8 overflow-x-hidden pb-12 no-scrollbar px-[10vw]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {SPACES.map((space, index) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="snap-card group relative w-[300px] md:w-[450px] flex-shrink-0 cursor-pointer overflow-hidden"
            style={{ scrollSnapAlign: "center" }}
          >
            <Link to={space.href}>
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* Background Image with Zoom */}
                <motion.img 
                  src={space.image} 
                  alt={space.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Text Content */}
                <div className="absolute inset-x-0 bottom-0 p-10 transform-gpu transition-all duration-500">
                  <span className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-site-gold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    Explore This Space
                  </span>
                  <p className="mb-1 text-sm font-light text-white/60 group-hover:text-white transition-colors duration-300">
                    {space.headline}
                  </p>
                  <h3 className="text-2xl font-light tracking-wide text-white md:text-3xl">
                    {space.name}
                  </h3>
                </div>

                {/* Border Effect */}
                <div className="absolute inset-0 border border-white/0 transition-all duration-700 group-hover:border-white/10 group-hover:inset-4" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SpaceNavigator;
