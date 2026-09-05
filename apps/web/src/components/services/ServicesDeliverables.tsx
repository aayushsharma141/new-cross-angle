import { motion } from "framer-motion";
import {
  Layout,
  Box,
  Palette,
  Sofa,
  Lightbulb,
  Hammer,
  Zap,
  Grid3X3,
  Star,
  Layers,
  Package,
} from "lucide-react";

const deliverables = [
  { icon: Layout,   label: "Space Planning",        desc: "Optimised layouts for how you actually live" },
  { icon: Box,      label: "3D Visualization",      desc: "Photorealistic renders before any work begins" },
  { icon: Palette,  label: "Material Selection",    desc: "Curated finishes, textures & surfaces" },
  { icon: Sofa,     label: "Custom Furniture",      desc: "Designed and fabricated in-house" },
  { icon: Hammer,   label: "Civil & Structural",    desc: "Walls, flooring, tiling, waterproofing" },
  { icon: Zap,      label: "Electrical Planning",   desc: "Load scheduling, concealed wiring" },
  { icon: Grid3X3,  label: "False Ceiling",         desc: "Gypsum, POP and custom ceiling systems" },
  { icon: Lightbulb,label: "Lighting Design",       desc: "Layered ambient, task & accent lighting" },
  { icon: Star,     label: "Turnkey Execution",     desc: "Full project management to handover" },
  { icon: Layers,   label: "Site Supervision",      desc: "Daily oversight by dedicated supervisor" },
  { icon: Package,  label: "Final Styling & Decor", desc: "Styling, accessories, plant dressing" },
];

const ServicesDeliverables = () => (
  <section className="relative bg-[var(--s-canvas-secondary)] py-24 lg:py-36 px-6 overflow-hidden border-b border-[var(--s-border-subtle)]">
    {/* Faint diagonal accent */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.018]"
      style={{
        backgroundImage:
          "linear-gradient(135deg,#fff 1px,transparent 1px),linear-gradient(45deg,#fff 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}
    />

    <div className="max-w-[1400px] mx-auto relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-7"
      >
        <div className="w-10 h-px bg-primary" />
        <span className="font-bold text-[9px] uppercase tracking-[0.45em] text-primary">
          Everything Included
        </span>
      </motion.div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif font-normal text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.1] tracking-tight text-white"
        >
          What You're{" "}
          <em className="italic text-primary font-light underline underline-offset-[10px] decoration-white/10 decoration-[3px]">
            Actually Paying For
          </em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="text-[0.95rem] text-white/45 max-w-[44ch] font-light leading-relaxed lg:text-right"
        >
          Every engagement includes these deliverables — no hidden extras, no
          vendor coordination on your part.
        </motion.p>
      </div>

      {/* Deliverables grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/[0.05] border border-[var(--s-border-subtle)] overflow-hidden">
        {deliverables.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group bg-[var(--s-canvas-secondary)] hover:bg-[var(--s-canvas-primary)] transition-colors duration-400 p-8 lg:p-10 flex flex-col gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center border border-white/[0.07] group-hover:border-primary/30 transition-colors duration-400">
                <Icon className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors duration-400" strokeWidth={1.25} />
              </div>
              <div>
                <div className="text-[0.9rem] text-white font-medium mb-1.5 group-hover:text-primary transition-colors duration-300">
                  {item.label}
                </div>
                <div className="text-[0.82rem] text-white/40 font-light leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Closing statement cell */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: deliverables.length * 0.04 }}
          className="bg-primary/[0.07] hover:bg-primary/[0.11] transition-colors duration-400 p-8 lg:p-10 flex flex-col justify-center gap-3 border-l border-primary/10"
        >
          <div className="text-[0.82rem] text-white/40 font-light uppercase tracking-[0.2em] mb-1">Scope guarantee</div>
          <div className="font-serif text-[1.25rem] text-white font-light leading-snug">
            Every line item is{" "}
            <em className="italic text-primary">locked in your BOQ</em>{" "}
            before work starts.
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ServicesDeliverables;
