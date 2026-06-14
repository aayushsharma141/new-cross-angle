import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ProjectCTA = () => {
  return (
    <section className="py-32 md:py-48 bg-stone-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-800/30 via-stone-900 to-stone-900 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-site-gold block mb-8 font-medium">
            Next Steps
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-normal tracking-tight mb-8">
            Planning a <span className="italic text-site-crimson font-light">Similar Home?</span>
          </h2>
          <p className="text-stone-400 text-lg font-light max-w-2xl mx-auto mb-12">
            Every project starts with an honest conversation about your goals, budget, and our Predictable Interior System™.
          </p>
          
          <Link 
            to="/contact"
            className="inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-medium tracking-wide hover:bg-stone-200 hover:scale-105 transition-all group"
          >
            Get Your Interior Investment Blueprint
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectCTA;
