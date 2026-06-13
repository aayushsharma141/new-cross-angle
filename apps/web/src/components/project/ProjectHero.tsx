import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Image } from "@/components/ui/enhanced/image";

interface ProjectHeroProps {
  heroImage: string;
  title: string;
  category: string;
  style: string;
  location: string;
  area?: string;
  year?: number;
  tagline?: string;
  brief?: string;
  type?: string;
}

const ProfileStrip = ({ location, area, year, type }: {
  location: string;
  area?: string;
  year?: number;
  type?: string;
}) => {
  const isCommercial = type === "commercial";
  const items = [
    { label: "Client Type", value: isCommercial ? "Corporate" : "Young Professional" },
    { label: "Lifestyle", value: isCommercial ? "Fast-paced / Collaborative" : "Modern Urban" },
    { label: "Priority", value: isCommercial ? "Focus + Presence" : "Calm + Storage" },
    { label: "Investment", value: "Premium" },
    ...(area ? [{ label: "Area", value: area }] : []),
    ...(location ? [{ label: "Location", value: location }] : []),
    ...(year ? [{ label: "Year", value: String(year) }] : []),
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/20">
      <div className="backdrop-blur-xl bg-black/60">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-0 overflow-x-auto no-scrollbar">
          {items.map((item, idx) => (
            <div
              key={item.label}
              className="flex-shrink-0 flex flex-col gap-1 px-6 border-r border-white/10 last:border-r-0 first:pl-0"
            >
              <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-stone-500">
                {item.label}
              </span>
              <span className="text-xs font-light text-stone-200 whitespace-nowrap">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectHero = ({ heroImage, title, category, location, area, year, tagline, brief, type }: ProjectHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  const subline = tagline || brief?.split(".")[0]?.trim() || "A space designed for excellence.";

  return (
    <div ref={containerRef} className="relative h-[100dvh] w-full overflow-hidden bg-neutral-950 text-stone-100">
      {/* Parallax image */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src={heroImage}
          alt={title}
          className="h-full w-full"
          imageClassName="object-cover object-center opacity-75"
          width={1920}
          height={1080}
          loading="eager"
        />
      </motion.div>

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-neutral-950/90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Main text block — left-aligned, breathing room from bottom strip */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 h-full flex flex-col items-start justify-center px-6 md:px-20 lg:px-28 pb-32"
      >
        {/* Category tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="mb-8 flex items-center gap-3"
        >
          <span className="inline-block w-8 h-px bg-primary" />
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
            {category}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-[7rem] text-white tracking-tight leading-[0.9] mb-8 font-serif font-normal max-w-3xl drop-shadow-2xl"
        >
          {title}
        </motion.h1>

        {/* Design intent line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="text-lg md:text-xl font-light text-stone-300 max-w-xl leading-relaxed mb-12"
        >
          {subline}
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
        >
          <a
            href="#challenge"
            className="group flex items-center gap-4 border border-white/20 rounded-full px-6 py-3 hover:bg-white/10 transition-colors w-fit"
          >
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-white">
              Explore Journey
            </span>
            <ArrowDown className="w-4 h-4 text-white group-hover:translate-y-1 transition-transform duration-500" />
          </a>
        </motion.div>
      </motion.div>

      {/* Architectural client profile strip at bottom edge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.1 }}
        style={{ opacity: textOpacity }}
      >
        <ProfileStrip location={location} area={area} year={year} type={type} />
      </motion.div>
    </div>
  );
};

export default ProjectHero;
