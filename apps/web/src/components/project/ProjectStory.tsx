import { motion } from "framer-motion";

interface ProjectStoryProps {
  brief: string;
  approach: string;
  title: string;
  image?: string;
}

const ProjectStory = ({ brief, approach }: ProjectStoryProps) => {
  return (
    <section id="challenge" className="py-28 md:py-40 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-28 md:mb-36"
        >
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Project Narrative</span>
          <span className="flex-1 h-px bg-white/10 max-w-xs" />
        </motion.div>

        {/* Three-column editorial layout */}
        <div className="grid md:grid-cols-3 gap-16 md:gap-20 lg:gap-24">

          {/* 01 Reality */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col"
          >
            <div className="mb-10">
              <span className="block text-[6rem] md:text-[8rem] font-serif font-light leading-none tracking-tight select-none mb-4 bg-gradient-to-b from-white/[0.15] to-transparent bg-clip-text text-transparent">
                01
              </span>
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary block">
                Reality
              </span>
            </div>
            <div className="w-12 h-px bg-primary/30 mb-10" />
            <p className="text-stone-500 font-light mb-6 text-xs uppercase tracking-[0.15em]">The client came to us with:</p>
            <ul className="flex flex-col gap-5">
              {[
                "Visual clutter with no breathing room",
                "Inadequate concealed storage for Indian lifestyle needs",
                "No acoustic separation between shared zones",
                "Generic builder-grade finishes",
              ].map((item, i) => (
                <li key={i} className="group flex items-start gap-4 text-stone-300 font-light text-base leading-relaxed hover:text-white transition-colors duration-300">
                  <span className="mt-2 w-1 h-1 rounded-full bg-stone-600 flex-shrink-0 group-hover:bg-primary transition-colors duration-300" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 02 Insight */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.12 }}
            className="flex flex-col"
          >
            <div className="mb-10">
              <span className="block text-[6rem] md:text-[8rem] font-serif font-light leading-none tracking-tight select-none mb-4 bg-gradient-to-b from-white/[0.15] to-transparent bg-clip-text text-transparent">
                02
              </span>
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary block">
                Insight
              </span>
            </div>
            <div className="w-12 h-px bg-primary/30 mb-10" />
            <p className="text-stone-500 font-light mb-6 text-xs uppercase tracking-[0.15em]">Discovery phase revealed:</p>
            <ul className="flex flex-col gap-5">
              {[
                "Calm environments measurably improve executive performance",
                "Warm wood tones consistently preferred over cool tones in Indian climates",
                "Minimal visual noise is non-negotiable for focus work",
                "Layered lighting critical for 12+ hour occupancy patterns",
              ].map((point, i) => (
                <li key={i} className="group flex items-start gap-4 text-stone-300 font-light text-base leading-relaxed hover:text-white transition-colors duration-300">
                  <span className="text-primary/60 group-hover:text-primary transition-colors duration-300 text-[10px] mt-1.5 flex-shrink-0">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 03 Response */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.24 }}
            className="flex flex-col"
          >
            <div className="mb-10">
              <span className="block text-[6rem] md:text-[8rem] font-serif font-light leading-none tracking-tight select-none mb-4 bg-gradient-to-b from-white/[0.15] to-transparent bg-clip-text text-transparent">
                03
              </span>
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary block">
                Response
              </span>
            </div>
            <div className="w-12 h-px bg-primary/30 mb-10" />
            <p className="text-stone-500 font-light mb-6 text-xs uppercase tracking-[0.15em]">What we built:</p>
            <ul className="flex flex-col gap-5">
              {[
                "Full-height integrated storage wall — seasonal + daily rotation",
                "Warm smoked oak palette for tactile warmth",
                "3-layer ambient + task + accent lighting scheme",
                "Zoned spatial flow for collaboration and focus",
              ].map((item, i) => (
                <li key={i} className="group flex items-start gap-4 text-stone-300 font-light text-base leading-relaxed hover:text-white transition-colors duration-300">
                  <span className="text-primary/60 group-hover:text-primary transition-colors duration-300 text-[10px] mt-1.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ProjectStory;
