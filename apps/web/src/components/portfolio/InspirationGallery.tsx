import { motion } from "framer-motion";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MOODS = [
  {
    image: "https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?q=80&w=1200&auto=format&fit=crop",
    word: "Calm"
  },
  {
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop",
    word: "Warmth"
  },
  {
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
    word: "Silence"
  },
  {
    image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=1200&auto=format&fit=crop",
    word: "Luxury"
  }
];

const InspirationGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;
    const card = containerRef.current.querySelector(".mood-card") as HTMLElement;
    const offset = card ? card.offsetWidth + 16 : window.innerWidth * 0.8;
    containerRef.current.scrollBy({ left: dir === "right" ? offset : -offset, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="container mx-auto mb-16 px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="mb-4 block text-[10px] uppercase tracking-[0.4em] text-white/40">Inspiration Gallery</span>
          <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl italic">
            Feel The Mood
          </h2>
        </div>
        {/* Arrow controls */}
        <div className="flex items-center gap-3">
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
        className="flex w-full gap-4 overflow-x-hidden px-4 pb-12 no-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {MOODS.map((mood, index) => (
          <motion.div
            key={mood.word}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="mood-card group relative h-[60vh] min-w-[80vw] flex-shrink-0 cursor-pointer overflow-hidden md:min-w-[40vw]"
            style={{ scrollSnapAlign: "center" }}
          >
            {/* Background Image */}
            <motion.img 
              src={mood.image} 
              alt={mood.word}
              className="h-full w-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/20" />
            
            {/* Mood Word */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-6xl font-extralight tracking-[0.2em] text-white/80 transition-all duration-700 group-hover:scale-125 group-hover:tracking-[0.4em] group-hover:text-white md:text-8xl">
                {mood.word}
              </h3>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto mt-12 flex items-center justify-center gap-10 overflow-hidden px-6">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 italic">Not sure what you like? Start here.</p>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
};

export default InspirationGallery;
