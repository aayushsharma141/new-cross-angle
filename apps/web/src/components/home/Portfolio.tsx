import { useState, useCallback, useRef } from "react";
import { ArrowUpRight, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/primitives/dialog";
import { cn } from "@/lib/utils";
import { categories, type Project } from "@/data/projects";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Image as BaseImage } from "@/components/ui/enhanced/image";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useGSAP, gsap } from "@/hooks/useGsap";

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
    <div className="group flex flex-col w-[320px] md:w-[480px] shrink-0">
      <div 
        role="button"
        tabIndex={0}
        aria-label={`View ${project.title} project`}
        className="relative overflow-hidden aspect-[4/5] md:aspect-[3/4] w-full cursor-pointer bg-black/5 focus-visible:ring-2 focus-visible:ring-site-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg outline-none"
        onClick={() => openLightbox(index)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); } }}
      >
        <div className="absolute inset-[0] w-[100%] h-[100%] project-img-container">
          <BaseImage
            src={project.heroImage}
            alt={project.title}
            className="h-full w-full"
            imageClassName="transition-transform duration-1000 group-hover:scale-110 object-cover will-change-transform"
            width={720}
            height={960}
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/20">
            <span className="text-white text-xs font-mono uppercase tracking-widest">View</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-2 px-2">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-display font-medium text-site-text-heading group-hover:text-site-crimson transition-colors">
            {project.title}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-site-text-muted group-hover:text-site-crimson transition-colors mt-1" />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-site-text-muted">
          <span>{project.category}</span>
          <span className="w-1 h-1 rounded-full bg-site-text-muted/30" />
          <span>{project.year}</span>
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const { data: projects = [] } = useQuery({
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

  const { scope } = useGSAP(() => {
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
            scrub: 1,
            start: "top top",
            end: () => `+=${totalWidth}`,
            invalidateOnRefresh: true,
          }
        });
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [filteredProjects]);

  return (
    <section ref={scope} className="bg-site-bg relative" id="portfolio">
      <div className="h-screen flex flex-col justify-center py-24 relative z-10 overflow-hidden">
        
        {/* Header Setup */}
        <div className="container mx-auto px-4 md:px-12 mb-12 shrink-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Selected Works</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 className="text-[clamp(2.25rem,8vw,4.5rem)] font-display font-medium text-site-text-heading leading-[1.15] md:leading-[1.1] tracking-tight">
              Curated <br className="hidden md:block" />
              <em className="text-site-text-muted not-italic"> Excellence.</em>
            </h2>
            <div className="flex flex-wrap gap-3 max-w-xl">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all duration-300 border border-white/5",
                    category === activeFilter
                      ? "bg-site-crimson text-white border-site-crimson shadow-[0_0_15px_rgba(196,18,48,0.3)]"
                      : "bg-transparent text-site-text-muted hover:text-site-text hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Track */}
        <div ref={trackRef} className="horizontal-track flex gap-8 md:gap-12 pl-4 md:pl-12 pr-[15vw] w-max items-center mt-8 pb-8 will-change-transform">
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
          <div className="w-[300px] md:w-[400px] shrink-0 flex items-center justify-center pl-12">
             <Link
                to="/gallery"
                className="group flex flex-col items-center gap-6 text-site-text hover:text-site-crimson transition-colors"
              >
                <div className="w-32 h-32 rounded-full border border-site-border flex items-center justify-center group-hover:border-site-crimson transition-all duration-500 bg-black/20 group-hover:bg-site-crimson/5">
                  <ArrowRight className="w-10 h-10 group-hover:scale-110 group-hover:translate-x-2 transition-transform" />
                </div>
                <span className="font-mono text-sm uppercase tracking-[0.2em]">Explore Full Archive</span>
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
