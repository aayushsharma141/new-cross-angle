import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Flag } from "lucide-react";
import { useRef, useState } from "react";

const documentationSteps = [
  { phase: "01. Planning", name: "Site Photos & Measurements", desc: "Detailed digital scans and physical dimensional surveys to register initial tolerances.", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop" },
  { phase: "02. 3D Renders", name: "Material Boards & Visualizations", desc: "Photorealistic spatial rendering combined with sensory finish pairing configurations.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop" },
  { phase: "03. Drawings", name: "Electrical & Plumbing Layouts", desc: "Precise engineering execution blueprints outlining technical systems and terminal grids.", img: "https://images.unsplash.com/photo-1541888081622-1cb66a3e6398?q=80&w=1000&auto=format&fit=crop" },
  { phase: "04. Execution", name: "Site Masonry & Carpentry", desc: "Active structural assembly supervised daily against strict quality assurance guides.", img: "https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=1000&auto=format&fit=crop" },
  { phase: "05. Delivery", name: "Final Turnkey Handover", desc: "Deep cleaning, furniture placement, system testing, and delivery handover.", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop" }
];

const ProjectDocumentation = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const getCardWidth = () => {
    if (window.innerWidth >= 768) return 600;
    if (window.innerWidth >= 640) return 400;
    return 300;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = getCardWidth();
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToStep = (idx: number) => {
    if (scrollRef.current) {
      const cardWidth = getCardWidth();
      scrollRef.current.scrollTo({ left: idx * (cardWidth + getGap()), behavior: 'smooth' });
    }
  };

  const getGap = () => window.innerWidth >= 768 ? 48 : 24;

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPos = scrollRef.current.scrollLeft;
      const cardWidth = getCardWidth();
      const gap = getGap();
      const newStep = Math.round(scrollPos / (cardWidth + gap));
      if (newStep >= 0 && newStep < documentationSteps.length) {
        setActiveStep(newStep);
      }
    }
  };

  return (
    <section className="py-24 md:py-32 bg-neutral-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.35em] uppercase text-site-gold block mb-4">04 / THE CRAFT</span>
          <h2 className="text-3xl md:text-5xl font-serif font-normal text-white">
            Project <span className="italic text-site-crimson font-light">Documentation</span>
          </h2>
        </div>

        {/* Process Mini Timeline progress indicator */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar w-full md:w-auto bg-neutral-900 border border-white/5 px-6 py-3.5 rounded-full backdrop-blur-md">
          {documentationSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => scrollToStep(idx)}
                className={`text-[10px] font-mono tracking-wider transition-colors duration-500 hover:text-site-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-site-gold rounded ${
                activeStep === idx ? "text-site-gold font-bold" : "text-stone-500"
              }`}>
                {step.phase.split('.')[1].trim()}
              </button>
              {idx < documentationSteps.length - 1 && (
                <span className="w-4 h-px bg-white/10 shrink-0" />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => scroll('left')} 
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-stone-300" aria-hidden="true" />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-stone-300" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-6 md:gap-12 px-6 md:px-12 pb-12 no-scrollbar snap-x snap-mandatory"
      >
        {documentationSteps.map((step, idx) => (
          <div
            key={idx}
            data-reveal="card"
            className="flex-shrink-0 w-[300px] sm:w-[400px] md:w-[600px] snap-center"
          >
            {/* Visual Swatch Image */}
            <div className="aspect-[16/9] overflow-hidden bg-neutral-900 mb-6 relative border border-white/5 rounded-lg group shadow-lg">
              <img src={step.img} alt={step.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700" loading="lazy" />
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-site-gold border border-white/10 flex items-center gap-1.5 shadow-md">
                <Flag className="w-3 h-3" />
                {step.phase}
              </div>
            </div>
            
            {/* Details */}
            <h3 className="font-serif text-xl text-stone-200 mb-2">{step.name}</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-lg">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectDocumentation;
