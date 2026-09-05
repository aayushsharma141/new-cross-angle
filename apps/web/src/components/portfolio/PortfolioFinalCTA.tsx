import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, Calculator, PhoneCall } from "lucide-react";

const PATHS = [
  {
    icon: <Compass className="w-6 h-6" />,
    title: "Discover Your Style",
    description: "Not sure what you want? Answer a few quick questions and we'll match you with a design direction.",
    cta: "Take Style Quiz",
    href: "/discovery",
    gradient: "from-primary/20 to-transparent",
    border: "border-primary/30 hover:border-primary/60",
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    title: "Estimate Your Investment",
    description: "Get an instant ballpark estimate for your project based on room type, size, and finish quality tier.",
    cta: "Calculate Now",
    href: "/price-estimator",
    gradient: "from-primary/20 to-transparent",
    border: "border-primary/30 hover:border-primary/60",
  },
  {
    icon: <PhoneCall className="w-6 h-6" />,
    title: "Book a Discovery Call",
    description: "Talk to our team about your vision, budget, and timeline. No commitment — just a conversation.",
    cta: "Schedule a Call",
    href: "/contact-us",
    gradient: "from-white/5 to-transparent",
    border: "border-white/10 hover:border-white/30",
  },
];

const PortfolioFinalCTA = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-neutral-950 py-[18vh] md:py-[22vh] relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary block mb-4">
            Next Steps
          </span>
          <h2 
            className="text-4xl md:text-6xl font-display font-normal text-white leading-tight mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Ready to Transform Your Space?
          </h2>
          <p className="text-stone-400 text-base font-normal max-w-[44ch] mx-auto leading-relaxed">
            Choose the path that feels right — whether you're browsing, planning, or ready to start.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PATHS.map((path, i) => (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 1.4, delay: shouldReduceMotion ? 0 : i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={path.href}
                className={`group relative flex flex-col h-full p-8 rounded-2xl border ${path.border} bg-white/[0.02] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 transition-all duration-500 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${path.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform duration-500">
                    {path.icon}
                  </div>
                  <h3 
                    className="text-xl md:text-2xl font-display font-normal text-white mb-3 group-hover:text-primary transition-colors duration-300"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {path.title}
                  </h3>
                  <p className="text-sm text-stone-400 font-normal leading-relaxed mb-8 flex-grow max-w-[38ch]">
                    {path.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-primary group-hover:text-white transition-colors duration-300">
                    {path.cta}
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioFinalCTA;
