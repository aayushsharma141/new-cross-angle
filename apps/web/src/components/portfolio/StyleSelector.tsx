import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

const STYLES = [
  { id: "Modern", label: "Modern Minimal", description: "Clean lines, neutral tones, and functional elegance." },
  { id: "Luxury", label: "Luxury Classic", description: "Rich textures, gold accents, and timeless grandeur." },
  { id: "Contemporary", label: "Warm Contemporary", description: "Modern comfort with organic materials and soft lighting." },
  { id: "Industrial", label: "Modular Smart", description: "Highly functional, industrial-inspired efficiency." }
];

const StyleSelector = () => {
  const [activeStyle, setActiveStyle] = useState(STYLES[0].id);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects
  });

  const filteredProjects = projects.filter(p => 
    p.style.toLowerCase().includes(activeStyle.toLowerCase()) || 
    (activeStyle === "Modern" && p.style.toLowerCase().includes("contemporary"))
  ).slice(0, 3);

  return (
    <div className="container mx-auto px-6 flex flex-col items-center">
      <div className="mb-20 text-center w-full max-w-2xl">
        <span className="mb-4 block text-[10px] uppercase tracking-[0.4em] text-site-gold">Style Selector</span>
        <h2 className="mb-6 text-3xl font-light tracking-tight text-white md:text-5xl">Find Your Taste</h2>
        <p className="mx-auto max-w-xl text-sm font-light text-white/50">
          Not sure what you like? Choose a style and see how it feels in a real-world space.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 w-full max-w-6xl">
        {/* Style Selection Menu */}
        <div className="flex flex-col gap-4">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={`group flex flex-col text-left p-8 transition-all duration-500 border border-white/5 relative overflow-hidden ${
                activeStyle === style.id ? "bg-white/5 border-white/20" : "hover:bg-white/[0.02]"
              }`}
            >
              {activeStyle === style.id && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-site-gold"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <h3 className={`text-xl font-light transition-colors duration-300 ${
                activeStyle === style.id ? "text-white" : "text-white/40 group-hover:text-white/60"
              }`}>
                {style.label}
              </h3>
              <p className={`mt-2 text-sm font-light transition-opacity duration-300 ${
                activeStyle === style.id ? "opacity-100" : "opacity-0"
              }`}>
                {style.description}
              </p>
            </button>
          ))}
        </div>

        {/* Dynamic Project Preview */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStyle}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="grid gap-4"
            >
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <Link 
                    to={`/portfolio/${project.slug}`} 
                    key={project.id}
                    className="group relative flex items-center gap-6 overflow-hidden bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05]"
                  >
                    <div className="h-24 w-32 flex-shrink-0 overflow-hidden">
                      <Image
                        src={project.heroImage} 
                        alt={project.title} 
                        className="h-full w-full"
                        imageClassName="transition-transform duration-700 group-hover:scale-110"
                        width={320}
                        height={240}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-light text-white">{project.title}</h4>
                      <p className="text-xs text-white/40 uppercase tracking-widest">{project.location}</p>
                    </div>
                    <div className="pr-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="text-site-gold uppercase tracking-[0.2em] text-[10px]">
                        View
                      </Button>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center border border-dashed border-white/10 p-20 text-center">
                  <p className="text-xs text-white/30 uppercase tracking-[0.3em]">No projects in this style yet</p>
                  <p className="mt-4 text-sm font-light text-white/40 italic">We are currently crafting new spaces in this category.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;
