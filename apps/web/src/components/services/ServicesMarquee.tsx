import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const items = [
  "TURNKEY CONTRACTING",
  "LUXURY RESIDENTIAL",
  "COMMERCIAL ARCHITECTURE",
  "HOSPITALITY STYLING",
  "STRATEGIC PLANNING",
  "DATA-DRIVEN DESIGN",
  "FURNITURE CURATION",
  "LIGHTING ARCHITECTURE",
];

const ServicesMarquee = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a scroll-based velocity effect (subtle)
  const { scrollY } = useScroll();
  const rawX = useTransform(scrollY, [0, 2000], [0, -200]);
  const x = useSpring(rawX, { stiffness: 50, damping: 20 });

  return (
    <div 
      ref={containerRef}
      className="py-12 bg-black border-y border-white/5 overflow-hidden relative"
    >
      <motion.div 
        style={{ x }}
        className="flex whitespace-nowrap gap-12 items-center"
      >
        {/* Render twice for seamless loop if using CSS animation, 
            but here we're using scroll-linked motion for elite feel */}
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-12">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-white/60 uppercase font-label">
              {item}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF2A2A]/40" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ServicesMarquee;
