import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ProjectMoodboardProps {
  archetype?: string;
}

const archetypeTraits = [
  "Calm Over Complexity",
  "Warm Natural Materials",
  "Soft Layered Lighting",
  "Intentional Storage",
];

const ProjectMoodboard = ({ archetype = "The Warm Minimalist" }: ProjectMoodboardProps) => {
  return (
    <section className="py-32 md:py-44 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-stone-600 mb-8 block">
            Archetype
          </span>

          <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-serif tracking-tight leading-none uppercase mb-16 md:mb-20 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent drop-shadow-lg">
            {archetype}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-20 md:mb-28">
            {archetypeTraits.map((trait, idx) => (
              <motion.div
                key={trait}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + idx * 0.08 }}
                className="flex items-center gap-3"
              >
                {idx > 0 && <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />}
                <span className="text-sm md:text-base font-light text-stone-400 tracking-wide">
                  {trait}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Single unified CTA — Discovery + Estimator combined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="border-t border-white/8 pt-20 md:pt-28"
        >
          <h3 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-4">
            Start Your Design Journey
          </h3>
          <p className="text-stone-500 font-light text-base mb-14 max-w-md mx-auto leading-relaxed">
            Find your archetype, estimate your investment, or explore design possibilities — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/tools/archetypes">
              <button className="group flex items-center gap-4 bg-primary text-white hover:bg-red-800 px-8 py-4 rounded-full text-[11px] font-medium tracking-[0.2em] transition-all uppercase">
                Discover Your Archetype
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link to="/tools/estimator">
              <button className="group flex items-center gap-4 border border-white/20 text-stone-300 hover:bg-white/5 hover:border-white/30 px-8 py-4 rounded-full text-[11px] font-medium tracking-[0.2em] transition-all uppercase">
                Estimate Investment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProjectMoodboard;
