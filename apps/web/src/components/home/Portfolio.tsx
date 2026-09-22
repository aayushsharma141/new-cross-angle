import { useState, useCallback, useRef } from "react";
import { ArrowUpRight, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/primitives/dialog";
import { cn } from "@/lib/utils";
import { type Project } from "@/lib/api";

const categories = ["All", "Residential", "Commercial"];
import { Image as BaseImage } from "@/components/ui/enhanced/image";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useGSAP } from "@/hooks/useGsap";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ProjectCard = ({
  project,
  index,
  openLightbox
}: {
  project: Project;
  index: number;
  openLightbox: (index: number) => void
}) => {
  return (
    <div className="group flex flex-col shrink-0">
      <div 
        role="button"
        tabIndex={0}
        aria-label={`View ${project.title} project`}
        className="relative overflow-hidden h-[50vh] md:h-[60vh] max-h-[600px] min-h-[320px] aspect-[4/5] md:aspect-[3/4] cursor-pointer bg-neutral-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 outline-none shadow-2xl shadow-black/50 ring-1 ring-white/5"
        onClick={() => openLightbox(index)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); } }}
      >
        <div className="absolute inset-[0] w-[100%] h-[100%] project-img-container">
          <BaseImage
            src={project.heroImage}
            alt={project.title}
            className="h-full w-full"
            imageClassName="transition-transform duration-[1.5s] ease-out group-hover:scale-105 object-cover will-change-transform"
            width={720}
            height={960}
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-white/20">
            <span className="text-white text-[10px] font-medium uppercase tracking-[0.2em]">View</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col space-y-4 px-2">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-serif text-white group-hover:text-stone-300 transition-colors">
            {project.title}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-stone-500 group-hover:text-white transition-colors mt-1" />
        </div>
        
        {/* Micro-storytelling */}
        {(project.challengeShort || project.resultShort) && (
          <div className="space-y-3 pt-2 pb-1 border-y border-white/[0.05] my-2">
            {project.challengeShort && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary block mb-1">Challenge</span>
                <p className="text-sm text-white/60 leading-relaxed font-light">{project.challengeShort}</p>
              </div>
            )}
            {project.resultShort && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 block mb-1">Result</span>
                <p className="text-sm text-white/90 leading-relaxed">{project.resultShort}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-[10px] font-medium tracking-[0.2em] uppercase text-stone-500">
          <span>{project.category}</span>
          <span className="w-1 h-1 rounded-full bg-stone-700" />
          <span>{project.year}</span>
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const { data: projects = [] as Project[] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
    staleTime: 5 * 60 * 1000,
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects.filter(
    (project) => activeFilter === "All" || project.category === activeFilter
  );

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = useCallback(
    (direction: "next" | "prev") => {
      if (direction === "next") {
        setCurrentImageIndex((prev) => (prev + 1) % filteredProjects.length);
      } else {
        setCurrentImageIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
      }
    },
    [filteredProjects.length]
  );

  const { scope } = useGSAP((ctx, gsap) => {
    const track = trackRef.current;
    const container = scope.current;
    
    if (!track || !container || filteredProjects.length === 0) return;

    // Small delay to ensure layout is calculated
    const timeout = setTimeout(() => {
      const scrollWidth = track.scrollWidth;
      const windowWidth = window.innerWidth;
      const totalWidth = scrollWidth - windowWidth;

      if (totalWidth > 0) {
        gsap.to(track, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            pin: true,
            scrub: 0.5,
            start: "top top",
            end: () => `+=${totalWidth * 1.5}`, // Extend scroll distance for smoother, less rushed scrolling
            invalidateOnRefresh: true,
          }
        });
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [filteredProjects]);

  return (
    <section ref={scope} className="bg-neutral-950 relative border-t border-white/5" id="portfolio">
      <div className="h-[100svh] flex flex-col justify-center pt-28 pb-12 relative z-10 overflow-hidden">
        
        {/* Header Setup */}
        <div className="container mx-auto mb-6 shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-primary/50" />
            <span className="text-primary font-medium uppercase tracking-[0.3em] text-[10px]">Selected Works</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.1]">
              Curated <br className="hidden md:block" />
              <em className="text-stone-400 not-italic"> Excellence.</em>
            </h2>
            <div className="flex flex-wrap gap-3 max-w-xl justify-start lg:justify-end pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 border",
                    category === activeFilter
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-transparent text-stone-400 border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Track */}
        <div ref={trackRef} className="horizontal-track flex gap-8 md:gap-12 w-max items-center pb-8 will-change-transform">
          {/* Spacer to perfectly align the start of the scroll track with the container left edge */}
          <div className="w-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))] lg:w-[max(3rem,calc((100vw-1400px)/2+3rem))] shrink-0" />
          
          {filteredProjects.map((project) => {
            const originalIndex = filteredProjects.findIndex(p => p.id === project.id);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                index={originalIndex}
                openLightbox={openLightbox}
              />
            );
          })}
          
          {/* View All CTA inside the track */}
          <div className="w-[300px] md:w-[400px] shrink-0 flex items-center justify-center pl-8 md:pl-16 pr-[15vw]">
             <Link
                to="/portfolio"
                className="group flex flex-col items-center gap-8 text-stone-400 hover:text-white transition-colors"
              >
                <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-500 bg-neutral-900 shadow-2xl">
                  <ArrowRight className="w-8 h-8 text-stone-500 group-hover:text-primary group-hover:scale-110 group-hover:translate-x-2 transition-all duration-500" />
                </div>
                <span className="font-medium text-[11px] uppercase tracking-[0.2em]">Explore Full Archive</span>
              </Link>
          </div>
        </div>

      </div>

      {/* Lightbox Dialog - Intact */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent hideCloseButton className="max-w-7xl bg-black/95 backdrop-blur-2xl border-none p-0 overflow-hidden h-[100dvh] w-screen max-h-none flex flex-col justify-center rounded-none shadow-2xl">
          <VisuallyHidden>
            <DialogTitle>Project Preview: {filteredProjects[currentImageIndex]?.title}</DialogTitle>
          </VisuallyHidden>
          
          <button
            title="Close preview"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-50 p-4 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <motion.div 
            key={currentImageIndex}
            className="w-full h-full flex flex-col items-center justify-center p-8 md:p-24 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x + velocity.x * 0.2;
              if (swipe < -100) {
                navigateLightbox("next");
              } else if (swipe > 100) {
                navigateLightbox("prev");
              }
            }}
          >
            <div className="w-full h-[65vh] flex items-center justify-center relative pointer-events-none">
              <BaseImage
                src={filteredProjects[currentImageIndex]?.heroImage}
                alt={filteredProjects[currentImageIndex]?.title}
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
            <div className="mt-8 text-center pointer-events-auto flex flex-col items-center justify-center space-y-4">
              <div>
                <h3 className="text-3xl font-display text-white mb-2">{filteredProjects[currentImageIndex]?.title}</h3>
                <p className="text-sm font-mono tracking-widest uppercase text-white/50">{filteredProjects[currentImageIndex]?.category}</p>
              </div>

              {/* Problem / Solution / Outcome Storytelling */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left border-t border-white/10 pt-8 px-4">
                <div>
                  <h4 className="text-primary font-mono text-[10px] uppercase tracking-[0.2em] mb-3">The Problem</h4>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-4">{filteredProjects[currentImageIndex]?.brief}</p>
                </div>
                <div>
                  <h4 className="text-primary font-mono text-[10px] uppercase tracking-[0.2em] mb-3">The Solution</h4>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-4">{filteredProjects[currentImageIndex]?.approach}</p>
                </div>
                <div>
                  <h4 className="text-primary font-mono text-[10px] uppercase tracking-[0.2em] mb-3">The Outcome</h4>
                  <p className="text-white/70 text-xs leading-relaxed italic border-l-2 border-white/20 pl-3">"{filteredProjects[currentImageIndex]?.testimonial?.quote || 'A flawlessly executed space delivered on time and within budget.'}"</p>
                </div>
              </div>
              
              <Link
                to={`/portfolio/${filteredProjects[currentImageIndex]?.slug}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(false);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="mt-6 inline-flex items-center space-x-2 border border-white/20 bg-white/5 backdrop-blur-md px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105"
              >
                <span>View Full Project</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Portfolio;
