import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { Compare } from "@/components/ui/enhanced/compare";
import { type Project } from "@/data/projects";

// Curated 1-sentence narrative sets mapped by slug
const storyTransformationData: Record<string, {
  thesis: string;
  quote: string;
  challenge: string;
  decision: string;
  outcome: string;
  beforeImg: string;
  afterImg: string;
}> = {
  "serene-master-suite": {
    thesis: "Noise filter.",
    quote: "A refuge designed to dial Jamshedpur's heavy industrial pace down to absolute quiet.",
    challenge: "Industrial noise and visual clutter prevented twilight unwinding and deep rest.",
    decision: "Stripped the footprint back to insert recessed 2700K indirect coves and handleless wardrobes.",
    outcome: "Created a sensory noise-filter where master suite rest is immediate and silent.",
    beforeImg: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
    afterImg: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop"
  },
  "modern-culinary-space": {
    thesis: "Dissolving barriers.",
    quote: "Shattering the boundary between cooking and entertaining.",
    challenge: "Cooking isolated the host inside a closed-door utility box separated from guests.",
    decision: "Opened sightlines by dissolving walls and integrating a central social seating island.",
    outcome: "Kitchen became the vibrant center of daily interaction and entertaining flow.",
    beforeImg: "https://images.unsplash.com/photo-1565538810844-1e119412e707?q=80&w=1200&auto=format&fit=crop",
    afterImg: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop"
  },
  "executive-workspace": {
    thesis: "Warm authority.",
    quote: "A biophilic hub that projects corporate command without the cold steel clinic.",
    challenge: "Builder-grade modular cubicles drained visual energy and blocked natural collaboration flow.",
    decision: "Constructed an open-plan layout with grooved felt acoustics and living moss panels.",
    outcome: "Workspace noise drops by 40% while active team engagement rises significantly.",
    beforeImg: "https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=1200&auto=format&fit=crop",
    afterImg: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
  }
};

interface ProjectStoryAndTransformationProps {
  project: Project;
}

export const ProjectStoryAndTransformation = ({ project }: ProjectStoryAndTransformationProps) => {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug as keyof typeof storyTransformationData | undefined;
  const data = activeSlug ? storyTransformationData[activeSlug] : undefined;

  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Track scroll details relative to this container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Calculate slide and fade properties
  const quoteX = useTransform(scrollYProgress, [0, 0.45], [0, 180]);
  const quoteOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const sliderScale = useTransform(scrollYProgress, [0.15, 0.55], [0.93, 1]);
  const textFadeIn = useTransform(scrollYProgress, [0.35, 0.6], [0, 1]);

  return (
    <section 
      ref={sectionRef} 
      className="bg-neutral-950 text-white relative pt-20 pb-28 overflow-hidden"
    >
      {/* Decorative separator — barely visible, not a section header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-16">
        
        {/* Top Section: Scrolling Quote and Slide trigger */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Sliding Quote — GSAP-targeted */}
          <div className="lg:col-span-5 relative">
            <div 
              data-reveal="quote"
              className="space-y-4"
            >
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-site-gold block">
                03 / TRANSFORM
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-normal text-white">
                The <span className="italic text-stone-400 font-light">Narrative</span>
              </h2>
              <blockquote className="text-2xl md:text-3xl lg:text-4xl font-serif font-light leading-[1.25] text-white tracking-tight">
                &ldquo;{data.quote}&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Right Column: Pre-transformation context */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-[21/9] rounded-xl overflow-hidden border border-white/5 bg-neutral-900 group shadow-lg"
            >
              <img 
                src={data.beforeImg} 
                alt="Original space constraint state" 
                className="w-full h-full object-cover filter grayscale opacity-45 group-hover:opacity-60 transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5">
                <span className="text-[8px] font-mono text-stone-400 tracking-widest uppercase">Initial Site Scan Survey</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Middle Section: Comparison Slider Canvas */}
        <motion.div 
          style={{ scale: sliderScale }}
          className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
        >
          <Compare
            firstImage={data.beforeImg}
            secondImage={data.afterImg}
            className="w-full h-full object-cover"
            slideMode="drag"
          />
          {/* Slider tags */}
          <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-white">Before</span>
          </div>
          <div className="absolute top-6 right-6 z-20 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-white">After</span>
          </div>
        </motion.div>

        {/* Bottom Section: Pruned 1-Sentence Copy Details */}
        <motion.div 
          style={{ opacity: textFadeIn }}
          className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto pt-8 border-t border-white/5"
        >
          {/* Challenge Box */}
          <div className="space-y-2.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-site-crimson font-semibold block">Challenge</span>
            <p className="text-sm font-light text-stone-200 leading-relaxed font-serif">
              {data.challenge}
            </p>
          </div>

          {/* Decision Box */}
          <div className="space-y-2.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-site-gold font-semibold block">Decision</span>
            <p className="text-sm font-light text-stone-200 leading-relaxed font-serif">
              {data.decision}
            </p>
          </div>

          {/* Outcome Box */}
          <div className="space-y-2.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-semibold block">Outcome</span>
            <p className="text-sm font-light text-stone-200 leading-relaxed font-serif">
              {data.outcome}
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProjectStoryAndTransformation;
