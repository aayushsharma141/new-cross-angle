import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/primitives/dialog";
import { cn } from "@/lib/utils";
import { categories, type Project } from "@/data/projects";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Image as BaseImage } from "@/components/ui/enhanced/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ProjectCard = ({
  project,
  index,
  openLightbox
}: {
  project: Project;
  index: number;
  openLightbox: (index: number) => void
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Tie image parallax directly to the scroll position of this matching card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // The image moves from -15% to 15% vertically within its container as user scrolls
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div className="group flex flex-col mb-16 md:mb-32">
      <div 
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`View ${project.title} project`}
        className="relative overflow-hidden aspect-[4/5] md:aspect-[3/4] w-full cursor-pointer bg-black/5 focus-visible:ring-2 focus-visible:ring-site-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg outline-none"
        onClick={() => openLightbox(index)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); } }}
      >
        <motion.div 
          className="absolute inset-[-20%] w-[140%] h-[140%]"
          style={{ y }}
        >
          <BaseImage
            src={project.heroImage}
            alt={project.title}
            className="h-full w-full"
            imageClassName="transition-transform duration-700 group-hover:scale-105"
            width={720}
            height={960}
          />
        </motion.div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <span className="text-white text-xs font-mono uppercase tracking-widest">View</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-2">
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

  // Split projects into 2 columns for masonry effect
  const leftColumn = filteredProjects.filter((_, i) => i % 2 === 0);
  const rightColumn = filteredProjects.filter((_, i) => i % 2 !== 0);

  return (
    <section className="py-24 md:py-32 bg-site-bg relative overflow-hidden" id="portfolio">
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        
        {/* Header Setup */}
        <div className="flex flex-col mb-16 md:mb-32">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Selected Works</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 md:gap-12">
            <h2 className="text-[clamp(2.25rem,8vw,4.5rem)] font-display font-medium leading-[1.15] md:leading-[1.1] tracking-tight">
              <span className="text-site-gold block mb-2">Curated</span>
              <em className="text-white not-italic"> Excellence.</em>
            </h2>
            <div className="flex flex-wrap gap-3 md:max-w-md relative z-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all duration-300 border border-white/5",
                    category === activeFilter
                      ? "bg-site-crimson text-white border-site-crimson"
                      : "bg-transparent text-site-text-muted hover:text-site-text hover:border-white/20"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Masonry Grid */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-24">
          <div className="w-full md:w-1/2 flex flex-col">
            {leftColumn.map((project, idx) => {
              // The original index in the filtered array for lightbox
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
          </div>
          
          {/* Right column has a top margin to create a staggered masonry effect */}
          <div className="w-full md:w-1/2 flex flex-col md:mt-40">
            {rightColumn.map((project, idx) => {
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
          </div>
        </div>

        {/* View All CTA */}
        <div className="mt-12 md:mt-20 flex justify-center">
          <Link
            to="/gallery"
            className="group flex flex-col items-center gap-4 text-site-text hover:text-site-crimson transition-colors"
          >
            <div className="w-24 h-24 rounded-full border border-site-border flex items-center justify-center group-hover:border-site-crimson transition-colors">
              <ArrowUpRight className="w-8 h-8 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest">Explore Full Archive</span>
          </Link>
        </div>
      </div>

      {/* Lightbox Dialog - Kept mostly intact */}
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
