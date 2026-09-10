import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { getOptimizedUrl } from "@/lib/cdn";

interface ProjectStoryProps {
  brief: string;
  approach: string;
  title: string;
}

// Curated emotional human-focused narratives for each project type
const humanNarratives: Record<string, {
  quote: string;
  conflict: string;
  resolution: string;
  thesis: string;
  img: string;
}> = {
  "serene-master-suite": {
    thesis: "Noise filter.",
    quote: "A refuge designed to dial Jamshedpur's heavy industrial pace down to absolute quiet.",
    conflict: "Our clients live in high-stakes environments. They returned home daily to an outdated bedroom where storage was overflowing, wardrobes generated visual noise, and builder-grade lighting prevented twilight unwinding.",
    resolution: "We stripped the room back to its raw perimeter, designing flush handleless wardrobes that sit flat against the walls. By recessing warm indirect light channels and layering Belgian flax linens, we engineered a sensory noise-filter where rest is immediate.",
    img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1000&auto=format&fit=crop"
  },
  "modern-culinary-space": {
    thesis: "Dissolving barriers.",
    quote: "Shattering the boundary between cooking and entertaining.",
    conflict: "The family loved to host, but the original kitchen layout isolated the cook inside a closed-door utility box. Preparing a meal was treated as a chore behind walls, leaving guests separated in the lounge.",
    resolution: "We dissolved the walls, transforming the space into a social culinary theatre. A central 3-meter white quartz island was inserted, integrating the cooktop and prep surfaces directly into the lounge conversation stream.",
    img: "https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/IMG-20250703-WA0027.jpg"
  },
  "executive-workspace": {
    thesis: "Warm authority.",
    quote: "A biophilic hub that projects corporate command without the cold steel clinic.",
    conflict: "The tech startup needed to impress visiting investors with absolute operational authority, but the team felt isolated inside typical builder-grade cubicles that drained visual energy and broke collaboration.",
    resolution: "We built an open-plan matrix structured around acoustic focus zones. Smoked timber slats and living biophilic moss walls were introduced to control echo, maintaining workspace health and natural sound dampening.",
    img: "https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/projects/discovery/reflect-workspace-dynamic.jpg"
  }
};

const ProjectStory = ({ brief, approach }: ProjectStoryProps) => {
  const { slug } = useParams<{ slug: string }>();
  
  const activeSlug = slug || "serene-master-suite";
  const story = humanNarratives[activeSlug] || humanNarratives["serene-master-suite"];

  return (
    <section className="py-24 md:py-36 bg-neutral-950 text-white border-t border-white/5 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] from-neutral-900/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Chapter Header */}
        <div className="mb-20">
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-primary block mb-4">— CHAPTER 02</span>
          <h2 className="text-3xl md:text-5xl font-serif font-normal text-white">
            The <span className="italic text-primary font-light">Challenge & Narrative</span>
          </h2>
        </div>

        {/* Editorial Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left: Dramatic quote/thesis (BIG) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-primary block">
              {story.thesis}
            </span>
            <motion.blockquote 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-serif font-light leading-[1.15] text-white tracking-tight"
            >
              &ldquo;{story.quote}&rdquo;
            </motion.blockquote>
          </div>

          {/* Right: Detailed Conflict & Resolution Prose (SMALL columns) */}
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-8 text-stone-300 font-light text-sm md:text-base leading-relaxed">
            
            {/* Conflict Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase block">
                The Friction
              </span>
              <p className="text-stone-300">
                {story.conflict || brief}
              </p>
            </motion.div>

            {/* Resolution Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase block">
                The Breakthrough
              </span>
              <p className="text-stone-300">
                {story.resolution || approach}
              </p>
            </motion.div>

          </div>

        </div>

        {/* Offset Layered Image showcasing the original constraint */}
        <div className="mt-20 relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-white/10 group shadow-2xl">
          <img src={getOptimizedUrl(story.img, { width: 1200, quality: 80 })} alt="Structural challenge detail" className="w-full h-full object-cover filter grayscale opacity-40 group-hover:opacity-65 transition-opacity duration-[2s] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
            <span className="text-[9px] font-mono text-stone-400 tracking-widest uppercase">Visual survey log</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProjectStory;
