import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Palette } from "lucide-react";
import { Image } from "@/components/ui/image";

interface MaterialItem {
  name: string;
  details: string;
}

interface ProjectPaletteProps {
  materials: MaterialItem[];
  palette?: Array<{ name: string; hex: string }>;
}

const defaultPalette = [
  { name: "Smoked Oak", hex: "#5C3A21" },
  { name: "Bouclé Cream", hex: "#E8E6E1" },
  { name: "Aged Brass", hex: "#C4A05A" },
];

const ProjectPalette = ({ materials, palette = defaultPalette }: ProjectPaletteProps) => {
  const displayPalette = palette.length > 0 ? palette : defaultPalette;
  const [activeMaterial, setActiveMaterial] = useState<number | null>(null);

  // Fallback images for the visualizer if no specific images exist
  const materialImages = [
    "/images/projects/discovery/lifestyle-4.jpg", // Default
    "/images/projects/discovery/lifestyle-7.jpg", // Mat 1
    "/images/projects/discovery/visual-13.jpg", // Mat 2
    "/images/projects/discovery/visual-10.jpg"  // Mat 3
  ];

  const currentImage = activeMaterial !== null && activeMaterial < materialImages.length - 1 
    ? materialImages[activeMaterial + 1] 
    : materialImages[0];

  return (
    <section className="px-6 max-w-7xl mx-auto w-full py-24 md:py-32">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Left: Interactive Visualizer */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full lg:w-3/5 relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image
                src={currentImage}
                alt="Material Visualization"
                className="h-full w-full"
                width={1100}
                height={825}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-neutral-950/60 border border-white/10 rounded-xl p-4 flex justify-between items-center z-10">
            <span className="text-xs font-medium tracking-widest text-stone-300 uppercase">Material Palette</span>
            <Palette className="w-5 h-5 text-stone-400" />
          </div>
        </motion.div>

        {/* Right: Chips */}
        <div className="w-full lg:w-2/5 flex flex-col justify-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary flex items-center gap-4 mb-6">
              <span className="w-8 h-px bg-primary/50" /> The Concept
            </span>
            <h3 className="text-3xl text-white tracking-tight font-serif font-normal mb-4">Curated Textures</h3>
            <p className="text-sm text-stone-400 font-light leading-relaxed mb-8">
              Hover or tap to explore how foundational materials shape the ambient warmth of the room.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {displayPalette.slice(0, 3).map((item, idx) => (
              <motion.button 
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                onMouseEnter={() => setActiveMaterial(idx)}
                onMouseLeave={() => setActiveMaterial(null)}
                className="group flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative"
                    style={{ backgroundColor: item.hex }}
                  >
                    <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white tracking-wide">{item.name}</h4>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                      {materials[idx]?.details || "Curated finish"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-primary transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProjectPalette;
