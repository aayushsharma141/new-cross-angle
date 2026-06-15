import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const IK = "https://ik.imagekit.io/wdrs8y61o/cross-angle/tr:q-85,f-auto,w-1200";

const MOODS = [
  {
    image: `${IK}/images/projects/discovery/visual-11.jpg`,
    word: "Calm"
  },
  {
    image: `${IK}/images/projects/discovery/lifestyle-2.jpg`,
    word: "Warmth"
  },
  {
    image: `${IK}/images/projects/discovery/lifestyle-5.jpg`,
    word: "Silence"
  },
  {
    image: `${IK}/images/projects/discovery/visual-2.jpg`,
    word: "Luxury"
  }
];

const InspirationGallery = () => {
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
    <div className="w-full overflow-hidden" ref={containerRef}>
      <div className="container mx-auto mb-16 px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Inspiration Gallery</span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl italic">
            Feel The Mood
          </h2>
        </div>
      </div>

      <motion.div 
        ref={scrollRef}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.2}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        dragMomentum={true}
        className="flex gap-4 w-max px-4 pb-12 cursor-grab active:cursor-grabbing"
      >
        {MOODS.map((mood, index) => (
          <motion.div
            key={mood.word}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="group relative h-[60vh] w-[80vw] flex-shrink-0 cursor-pointer overflow-hidden md:w-[40vw] bg-neutral-900"
          >
            {/* Background Image */}
            <motion.img 
              src={mood.image} 
              alt={mood.word}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="h-full w-full object-cover transition-transform group-hover:scale-110 pointer-events-none"
              style={{ transitionDuration: "3000ms" }}
              loading="lazy"
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
            <div className="absolute inset-0 z-10 bg-[url(/noise.svg)] opacity-20 pointer-events-none mix-blend-overlay" />
          </motion.div>
        ))}
      </motion.div>

      <div className="container mx-auto mt-12 flex items-center justify-center gap-10 overflow-hidden px-6">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 italic">Not sure what you like? Start here.</p>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
};

export default InspirationGallery;
