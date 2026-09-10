import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { getOptimizedUrl } from "@/lib/cdn";

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  tag: string;
  img: string;
}

const mockHotspotsData: Record<string, {
  image: string;
  spots: Hotspot[];
}> = {
  "serene-master-suite": {
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1600&auto=format&fit=crop",
    spots: [
      { id: "1", x: 50, y: 55, tag: "Headboard", title: "Bespoke Upholstered Headboard", description: "Custom suede-paneled headboard with built-in walnut ledges, integrated charging stations, and soft cushioning for ultimate comfort.", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop" },
      { id: "2", x: 48, y: 28, tag: "Lighting", title: "Concealed LED Cove", description: "Warm 2700K indirect lighting recessed within the ceiling margins. Delivers a soft, anti-glare reading halo that mimics organic twilight.", img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&auto=format&fit=crop" },
      { id: "3", x: 20, y: 40, tag: "Storage", title: "Handleless Wardrobes", description: "Floor-to-ceiling closets finished in anti-fingerprint matte lacquer. Doors feature push-to-open latch arrays and internal motion sensors.", img: "https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/projects/discovery/reflect-bedroom-design.jpg" }
    ]
  },
  "modern-culinary-space": {
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop",
    spots: [
      { id: "1", x: 50, y: 65, tag: "Island", title: "Calacatta Quartz Island", description: "A 3-meter long seamless Italian quartz slab. Serves as a dual-purpose prep counter and social dining hub with under-base LED lighting.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" },
      { id: "2", x: 82, y: 45, tag: "Cabinetry", title: "Concealed Pocket Pantry", description: "Flush timber cabinets featuring high-performance pivot hinges that slide inside side pocket grooves to expose appliances without cluttering paths.", img: "https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/IMG-20250703-WA0028.jpg" },
      { id: "3", x: 35, y: 25, tag: "Focus Light", title: "Integrated Counter Spots", description: "Anti-glare ceiling-embedded task spotlights focused precisely on primary prep stations and mixing boards.", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  "executive-workspace": {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    spots: [
      { id: "1", x: 45, y: 60, tag: "Desk", title: "Cantilevered Oak Desk", description: "Bespoke executive work slab made of solid white oak, cantilevered from custom cabinetry with integrated cabling ducts.", img: "https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/projects/discovery/reflect-workspace-structured.jpg" },
      { id: "2", x: 25, y: 40, tag: "Acoustics", title: "Grooved Felt paneling", description: "Wall-cladding grooved acoustic panel sheets designed to isolate room frequencies and prevent reverberation during conference streams.", img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=600&auto=format&fit=crop" },
      { id: "3", x: 50, y: 20, tag: "Fixture", title: "Ring Chandelier", description: "A minimalist direct/indirect ceiling circular light ring that provides standard architectural diffuse lux levels.", img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=600&auto=format&fit=crop" }
    ]
  }
};

const ProjectHotspots = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeSpot, setActiveSpot] = useState<Hotspot | null>(null);

  const activeSlug = slug || "serene-master-suite";
  const data = mockHotspotsData[activeSlug] || mockHotspotsData["serene-master-suite"];

  return (
    <section className="py-24 md:py-32 bg-neutral-950 text-stone-100 border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-neutral-900/30 via-neutral-950 to-neutral-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title */}
        <div className="mb-16">
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-primary block mb-4">— INTERACTION</span>
          <h2 className="text-3xl md:text-5xl font-serif font-normal text-white">
            Design <span className="italic text-primary font-light">Canvas Details</span>
          </h2>
        </div>

        {/* Hotspots Interactive Canvas */}
        <div className="relative aspect-[16/10] md:aspect-video w-full bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl group">
          <img 
            src={getOptimizedUrl(data.image, { width: 1600, quality: 80 })} 
            alt="Interactive Design Canvas" 
            className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" 
            loading="lazy" 
          />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />

          {/* Render pulse buttons */}
          {data.spots.map((spot, idx) => (
            <button
              key={spot.id}
              onClick={() => setActiveSpot(activeSpot?.id === spot.id ? null : spot)}
              className="absolute z-10 transition-transform duration-300 hover:scale-110"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
              aria-label={`Show detail for ${spot.tag}`}
              title={`View ${spot.tag}`}
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                {/* Outer ring */}
                <div className={`absolute inset-0 rounded-full animate-ping transition-colors duration-500 ${
                  activeSpot?.id === spot.id ? "bg-primary/40" : "bg-white/20"
                }`} />
                {/* Center dot */}
                <div className={`absolute inset-1.5 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${
                  activeSpot?.id === spot.id ? "bg-primary text-black" : "bg-white text-black"
                }`}>
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                </div>
              </div>
            </button>
          ))}

          {/* Interactive Slide-over details pane */}
          <AnimatePresence>
            {activeSpot && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 150 }}
                className="absolute right-0 top-0 bottom-0 w-full md:w-[420px] bg-neutral-950/95 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-between z-20 shadow-2xl"
              >
                {/* Header */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono tracking-widest text-primary uppercase">
                      <Sparkles className="w-3 h-3" />
                      Detail {activeSpot.id}
                    </span>
                    <button 
                      onClick={() => setActiveSpot(null)}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                      aria-label="Close details panel"
                      title="Close"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Swatch detail image zoom */}
                  <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-white/10 mb-6 bg-neutral-900">
                    <img src={getOptimizedUrl(activeSpot.img, { width: 900, quality: 80 })} alt={activeSpot.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Tag */}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">{activeSpot.tag}</span>
                  <h4 className="text-xl font-serif text-white mb-4 leading-snug">{activeSpot.title}</h4>
                  
                  {/* Detailed Description */}
                  <p className="text-stone-300 font-light text-sm leading-relaxed">
                    {activeSpot.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-light">
                    <span>Explore details of the materials board below</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Swipe Instructions */}
        <div className="md:hidden mt-6 flex justify-center text-stone-400 text-xs gap-2">
          <span>Tap on numbers above to review architectural details</span>
        </div>

      </div>
    </section>
  );
};

export default ProjectHotspots;
