import { motion } from "framer-motion";
import { Compare } from "@/components/ui/enhanced/compare";
import { type Project } from "@/lib/api";

interface ProjectTransformationProps {
  project: Project;
}

const fallbacks: Record<string, { before: string; after: string }> = {
  "serene-master-suite": {
    before: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop"
  },
  "modern-culinary-space": {
    before: "https://images.unsplash.com/photo-1565538810844-1e119412e707?q=80&w=1200&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop"
  },
  "executive-workspace": {
    before: "https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=1200&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
  }
};

const ProjectTransformation = ({ project }: ProjectTransformationProps) => {
  const hasMultipleImages = project.gallery && project.gallery[0]?.images && project.gallery[0].images.length >= 2;
  
  const beforeImage = hasMultipleImages 
    ? project.gallery[0].images[0] 
    : (fallbacks[project.slug]?.before || "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop");
  
  const afterImage = hasMultipleImages 
    ? project.gallery[0].images[1] 
    : (project.heroImage || fallbacks[project.slug]?.after || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop");

  return (
    <section id="transformation" className="py-24 md:py-32 border-t border-white/5 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">01. Transformation</span>
          <span className="flex-1 h-px bg-white/10 max-w-xs" />
        </motion.div>

        <div className="flex flex-col gap-12 lg:gap-20">
          {/* Compare Slider — Huge, Full-width */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-none md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <Compare
              firstImage={beforeImage}
              secondImage={afterImage}
              className="w-full h-full object-cover"
              slideMode="hover"
            />
            {/* Labels overlay */}
            <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-white">Before</span>
            </div>
            <div className="absolute top-6 right-6 z-20 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-white">After</span>
            </div>
          </motion.div>

          {/* Bottom Text: Challenge & Result */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-5xl mx-auto"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary block mb-4 font-medium">The Challenge</span>
              <ul className="text-xl md:text-2xl font-serif text-white leading-relaxed space-y-3">
                {project.challengeShort?.split('•').filter(Boolean).map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-stone-500">•</span>
                    <span>{item.trim()}</span>
                  </li>
                )) || (
                  <li>{project.challengeShort || "The space failed to support the client's actual lifestyle and operational needs."}</li>
                )}
              </ul>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary block mb-4 font-medium">The Result</span>
              <ul className="text-lg text-stone-300 font-light leading-relaxed space-y-3">
                {project.resultShort?.split('•').filter(Boolean).map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-primary">•</span>
                    <span>{item.trim()}</span>
                  </li>
                )) || (
                  <li>{project.resultShort || "An engineered environment that seamlessly integrates utility with premium aesthetics."}</li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectTransformation;
