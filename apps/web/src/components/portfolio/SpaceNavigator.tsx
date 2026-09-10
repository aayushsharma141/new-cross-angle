import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Local assets under apps/web/public/ — served directly by Vercel, not via
// ImageKit (its /cross-angle endpoint origin is Supabase Storage, which has
// no "images" bucket). See apps/web/src/lib/cdn.ts.
const IMAGE_BASE = "/images/projects/discovery";

const SPACES = [
  {
    id: "bedroom",
    name: "Bedroom Spaces",
    headline: "Designed for restful nights",
    image: `${IMAGE_BASE}/visual-13.jpg`,
    href: "/gallery?category=Bedroom Interior"
  },
  {
    id: "living",
    name: "Living Rooms",
    headline: "Built for functional luxury",
    image: `${IMAGE_BASE}/visual-11.jpg`,
    href: "/gallery?category=Living Room Interior"
  },
  {
    id: "kitchen",
    name: "Modular Kitchens",
    headline: "Heart of the home",
    image: `${IMAGE_BASE}/visual-10.jpg`,
    href: "/gallery?category=Modular Kitchen"
  },
  {
    id: "commercial",
    name: "Commercial Spaces",
    headline: "Productivity redefined",
    image: `${IMAGE_BASE}/visual-17.jpg`,
    href: "/gallery?category=Commercial"
  },
  {
    id: "wardrobe",
    name: "Wardrobes",
    headline: "Organized elegance",
    image: `${IMAGE_BASE}/visual-15.jpg`,
    href: "/gallery?category=Wardrobe"
  }
];

const SpaceNavigator = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="w-full overflow-hidden" ref={containerRef}>
      <div className="container mx-auto px-6 mb-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-px bg-primary" />
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Choose Your World</span>
        </div>
        <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl mb-6">Space-Based Exploration</h2>
        <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-white/50 mb-0">
          Navigate through our portfolio by the spaces that matter to you.
          Each category is a curated journey of spatial storytelling.
        </p>
      </div>

      <motion.div 
        ref={scrollRef}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.2}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        dragMomentum={true}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        style={{ touchAction: "pan-y" }}
        className="flex w-max gap-8 pb-12 px-[10vw] cursor-grab active:cursor-grabbing"
      >
        {SPACES.map((space, index) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group relative w-[300px] md:w-[450px] flex-shrink-0 cursor-pointer overflow-hidden"
          >
            <Link 
              to={space.href} 
              draggable={false} 
              onClick={(e) => { if (isDragging) e.preventDefault(); }} 
              className="block"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* Background Image with Zoom */}
                <motion.img 
                  src={space.image} 
                  alt={space.name}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 pointer-events-none"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Text Content */}
                <div className="absolute inset-x-0 bottom-0 p-10 transform-gpu transition-all duration-500">
                  <span className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
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
      </motion.div>
    </div>
  );
};

export default SpaceNavigator;
