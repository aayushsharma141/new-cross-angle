import { motion } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";

interface Hotspot {
  x: number; // Percentage from left
  y: number; // Percentage from top
  title: string;
  description: string;
}

interface ProjectHotspotsProps {
  image: string;
  title?: string;
  subtitle?: string;
  hotspots?: Hotspot[];
}

const ProjectHotspots = ({ 
  image, 
  title = "Spatial Details", 
  subtitle = "Explore the design reasoning",
  hotspots = []
}: ProjectHotspotsProps) => {

  const defaultHotspots: Hotspot[] = [
    {
      x: 25,
      y: 35,
      title: "Ambient Concealed Light",
      description: "Eliminates harsh overhead glare, replacing it with a soft glow that accentuates the wall's texture."
    },
    {
      x: 70,
      y: 60,
      title: "Low-Profile Base",
      description: "Grounds the bed visually, increasing the perceived ceiling height and fostering a grounded emotional state."
    }
  ];

  const activeHotspots = hotspots.length > 0 ? hotspots : defaultHotspots;

  return (
    <section className="px-6 max-w-[90rem] mx-auto w-full py-24 md:py-32">
      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/5">
        <Image
          src={image} 
          alt="Room Detail" 
          className="h-full w-full"
          imageClassName="opacity-80"
          width={1440}
          height={810}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute bottom-10 left-10 pointer-events-none">
          <h3 className="text-2xl font-serif text-white mb-2">{title}</h3>
          <p className="text-xs text-stone-400 uppercase tracking-widest">{subtitle}</p>
        </div>

        {activeHotspots.map((hotspot, idx) => (
          <div 
            key={idx}
            className="absolute group z-10"
            style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%` }}
          >
            <button 
              className="relative w-8 h-8 flex items-center justify-center cursor-pointer"
              aria-label={`View detail: ${hotspot.title}`}
              title={hotspot.title}
            >
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDelay: `${idx * 0.5}s` }} />
              <span className="relative w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </button>
            {/* Floating Card */}
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-neutral-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl pointer-events-none shadow-2xl">
              <h4 className="text-sm text-white font-medium mb-1.5 tracking-tight">{hotspot.title}</h4>
              <p className="text-[10px] text-stone-400 leading-relaxed font-light">{hotspot.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectHotspots;
