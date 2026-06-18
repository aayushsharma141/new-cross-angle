import { motion } from "framer-motion";
import { Search, PenTool, CheckCircle } from "lucide-react";

const STEPS = [
  {
    icon: <Search className="w-6 h-6 text-site-gold" />,
    number: "01",
    title: "Consult",
    description: "We understand your vision, lifestyle, and spatial requirements through an in-depth discovery session.",
  },
  {
    icon: <PenTool className="w-6 h-6 text-site-gold" />,
    number: "02",
    title: "Design",
    description: "Our architects and designers craft a bespoke plan with cinematic 3D visualizations and precise material curation.",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-site-gold" />,
    number: "03",
    title: "Deliver",
    description: "We execute the turnkey project with uncompromising quality control, delivering your dream space on time.",
  },
];

const HowWeWork = () => {
  return (
    <section className="bg-[#050505] py-24 border-t border-white/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-site-gold/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-site-crimson" />
              <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">The Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-light mb-4 italic">
              How We Work
            </h2>
            <p className="text-sm text-stone-400 font-light max-w-md mx-auto">
              A transparent, end-to-end journey from the first sketch to the final handover.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-5xl mx-auto">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-site-gold/30 hover:bg-white/[0.04] transition-all duration-500 group"
            >
              <div className="text-6xl font-extralight text-white/5 absolute right-6 top-6 group-hover:text-site-gold/10 transition-colors duration-500 pointer-events-none select-none">
                {step.number}
              </div>
              <div className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-8 group-hover:border-site-gold/50 group-hover:bg-site-gold/10 transition-all duration-500">
                {step.icon}
              </div>
              <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-site-gold transition-colors duration-500">
                {step.title}
              </h3>
              <p className="text-stone-400 font-light text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
