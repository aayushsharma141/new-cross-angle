import { motion } from "framer-motion";

interface MaterialItem {
  name: string;
  details: string;
}

interface ProjectPaletteProps {
  materials: MaterialItem[];
}

// Outcome-mapped rationale for common material types
const getRationale = (name: string, details: string, idx: number): { why: string; outcome: string } => {
  const nameLower = name.toLowerCase();
  const detailsLower = details.toLowerCase();

  if (nameLower.includes("floor") || detailsLower.includes("marble") || detailsLower.includes("wood")) {
    return {
      why: "Grounds the space with permanence and warmth",
      outcome: "A material that ages beautifully and signals quality immediately underfoot",
    };
  }
  if (nameLower.includes("wall") || detailsLower.includes("paint") || detailsLower.includes("acoustic")) {
    return {
      why: "Controls acoustics and sets the visual temperature of the room",
      outcome: "Background that makes every other material look more refined",
    };
  }
  if (nameLower.includes("light") || detailsLower.includes("led") || detailsLower.includes("hue")) {
    return {
      why: "Light is designed in three layers — ambient, task, accent",
      outcome: "Dynamic atmosphere that shifts from productive focus to relaxed presence",
    };
  }
  if (nameLower.includes("furniture") || detailsLower.includes("ergonomic") || detailsLower.includes("desk")) {
    return {
      why: "Scaled precisely to human movement, not arbitrary room dimensions",
      outcome: "Spaces that feel spacious even at full occupancy",
    };
  }

  // Generic fallback based on index
  const fallbacks = [
    { why: "Creates executive warmth and visual authority", outcome: "Sets the foundational tone of the space" },
    { why: "Adds sophistication and a point of intentionality", outcome: "Elevates surrounding materials through contrast" },
    { why: "Reduces distraction and improves focus quality", outcome: "A detail noticed only by those who know what to look for" },
    { why: "Balances hard and soft surfaces across the room", outcome: "A tactile richness that photographs well and lives better" },
  ];
  return fallbacks[idx % fallbacks.length];
};

const ProjectPalette = ({ materials }: ProjectPaletteProps) => {
  if (!materials || materials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 md:gap-24 items-start">
          
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32"
          >
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary flex items-center gap-4 mb-6">
              <span className="w-8 h-px bg-primary/50" /> Materials & Finishes
            </span>
            <h2 className="text-3xl md:text-4xl text-white tracking-tight font-serif font-normal leading-[1.2] mb-6">
              Why these materials?
            </h2>
            <p className="text-stone-400 font-light leading-relaxed text-sm">
              Every finish was selected for a functional reason, then refined for beauty. None were chosen randomly.
            </p>
          </motion.div>

          {/* Right: material list with rationale */}
          <div className="flex flex-col gap-0">
            {materials.map((material, idx) => {
              const { why, outcome } = getRationale(material.name, material.details, idx);
              return (
                <motion.div
                  key={material.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.08 }}
                  className="group border-b border-white/5 py-8 first:pt-0 last:border-b-0"
                >
                  <div className="flex items-start gap-6">
                    {/* Index */}
                    <span className="text-xs text-stone-700 font-light tracking-widest pt-1 min-w-[24px]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    
                    <div className="flex-1">
                      {/* Name + details */}
                      <div className="flex items-baseline justify-between gap-4 mb-3">
                        <h3 className="text-white font-serif text-lg group-hover:text-primary transition-colors duration-300">
                          {material.name}
                        </h3>
                        <span className="text-xs text-stone-500 font-light text-right max-w-[200px]">
                          {material.details}
                        </span>
                      </div>

                      {/* Why + outcome */}
                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600 block mb-1.5">Why</span>
                          <p className="text-stone-400 font-light text-sm leading-relaxed">{why}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60 block mb-1.5">Outcome</span>
                          <p className="text-stone-300 font-light text-sm leading-relaxed">{outcome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProjectPalette;
