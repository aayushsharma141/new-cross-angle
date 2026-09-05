import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const documentationSteps = [
  { phase: "01. Planning", name: "Site Photos & Measurements", desc: "Detailed digital scans and physical dimensional surveys to register initial tolerances.", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop" },
  { phase: "02. 3D Renders", name: "Material Boards & Visualizations", desc: "Photorealistic spatial rendering combined with sensory finish pairing configurations.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop" },
  { phase: "03. Drawings", name: "Electrical & Plumbing Layouts", desc: "Precise engineering execution blueprints outlining technical systems and terminal grids.", img: "https://images.unsplash.com/photo-1541888081622-1cb66a3e6398?q=80&w=1000&auto=format&fit=crop" },
  { phase: "04. Execution", name: "Site Masonry & Carpentry", desc: "Active structural assembly supervised daily against strict quality assurance guides.", img: "https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=1000&auto=format&fit=crop" },
  { phase: "05. Delivery", name: "Final Turnkey Handover", desc: "Deep cleaning, furniture placement, system testing, and delivery handover.", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop" }
];

const ProjectDocumentation = () => {
  const [activeStep, setActiveStep] = useState(0); 
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // 1. Entrance animations when the section comes into view
    gsap.from(".craft-entrance", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      }
    });

    // 2. Pinned Scroll Scrub Sequence
    const numSteps = documentationSteps.length;
    
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top", // Pin when section reaches top of viewport
      end: `+=${numSteps * 100}%`, // Scroll duration equals 100vh per step
      pin: true,
      scrub: 0.1, // Smooth interpolation
      onUpdate: (self) => {
        // Map scroll progress (0 - 1) to step index
        let index = Math.floor(self.progress * numSteps);
        if (index >= numSteps) index = numSteps - 1;
        if (index < 0) index = 0;
        
        setActiveStep(index);
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center bg-neutral-950 text-white overflow-hidden py-24 md:py-32">
      {/* Cinematic Background Images */}
      {documentationSteps.map((step, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            activeStep === idx ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <img 
            src={step.img} 
            alt={step.name} 
            className="w-full h-full object-cover" 
            loading={idx === 0 ? "eager" : "lazy"} 
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-neutral-950/80 md:bg-neutral-950/60 backdrop-blur-[2px]" />
        </div>
      ))}

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-16 md:gap-12">
        
        {/* Left Column: Title & Dynamic Details */}
        <div className="w-full md:w-5/12 flex flex-col justify-between self-stretch">
          <div>
            <span className="craft-entrance text-[10px] font-semibold tracking-[0.35em] uppercase text-primary block mb-6 drop-shadow-md">04 / THE CRAFT</span>
            <h2 className="craft-entrance text-4xl md:text-5xl lg:text-7xl font-serif font-normal text-white drop-shadow-lg leading-tight">
              Project <br className="hidden md:block" />
              <span className="italic text-primary font-light">Documentation</span>
            </h2>
          </div>

          <div className="craft-entrance mt-12 md:mt-auto relative min-h-[120px] hidden md:block">
            {documentationSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`transition-all duration-700 absolute bottom-0 left-0 max-w-sm w-full ${
                  activeStep === idx 
                    ? "opacity-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                 <div className="w-12 h-[2px] bg-primary mb-6" />
                 <h4 className="text-2xl font-serif mb-4 text-white drop-shadow-md">{step.name}</h4>
                 <p className="text-sm md:text-base text-stone-300 font-light leading-relaxed drop-shadow-md">
                   {step.desc}
                 </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Scroll-Synced Master List */}
        <div className="w-full md:w-6/12 flex flex-col border-t border-white/10 md:border-t-0">
          {documentationSteps.map((step, idx) => (
            <div 
              key={idx}
              className="craft-entrance group py-6 md:py-8 border-b border-white/10 relative overflow-hidden"
            >
              {/* Subtle active background highlight */}
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent transition-opacity duration-500 -z-10 ${
                activeStep === idx ? "opacity-100" : "opacity-0"
              }`} />

              <div className="flex flex-col">
                 <span className={`text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase transition-colors duration-300 mb-2 ${
                   activeStep === idx ? "text-primary" : "text-stone-500"
                 }`}>
                   {step.phase.split('.')[0]}
                 </span>
                 
                 <h3 className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-500 uppercase tracking-wide ${
                   activeStep === idx ? "text-white translate-x-2 md:translate-x-6" : "text-white/30"
                 }`}>
                   {step.phase.split('.')[1].trim()}
                 </h3>
              </div>
              
              {/* Mobile Inline Description */}
              <div className={`md:hidden transition-all duration-500 ease-in-out ${
                activeStep === idx ? "max-h-60 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
              }`}>
                 <div className="w-8 h-[2px] bg-primary mb-4" />
                 <h4 className="text-lg font-serif mb-2 text-white">{step.name}</h4>
                 <p className="text-sm text-stone-400 font-light leading-relaxed">
                   {step.desc}
                 </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProjectDocumentation;
