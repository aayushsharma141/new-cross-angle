import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Sparkles } from "lucide-react";

const ARCHETYPES = [
  {
    name: "Modern Minimal",
    description: "Clean lines, neutral palettes, functional simplicity",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Luxury Classic",
    description: "Rich textures, warm tones, timeless elegance",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Warm Contemporary",
    description: "Natural materials, organic shapes, layered comfort",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop",
  },
];

const StyleDiscoveryTeaser = () => {
  return (
    <section className="bg-neutral-950 py-24 md:py-32 relative overflow-hidden border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3 h-3" />
            Find Your Style
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight mb-4">
            Not sure what you want?
          </h2>
          <p className="text-stone-400 text-lg font-light max-w-2xl mx-auto">
            Answer a few quick questions and we&apos;ll match you with a design direction that fits your lifestyle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {ARCHETYPES.map((archetype, i) => (
            <motion.div
              key={archetype.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative h-64 md:h-72 rounded-2xl overflow-hidden border border-white/[0.06] bg-neutral-900/50"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${archetype.image})` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-lg font-serif text-white mb-1">{archetype.name}</h3>
                <p className="text-sm text-stone-400 font-light">{archetype.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            to="/aesthetic-discovery-engine"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-sans text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold group"
          >
            <Compass className="w-4 h-4" />
            <span>Take the Style Quiz</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StyleDiscoveryTeaser;