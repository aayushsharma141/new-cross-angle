import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingParticles from "./FloatingParticles";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { categories } from "@/data/projects";
import { useProjects } from "@/context/ProjectContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Image } from "@repo/ui";

const Portfolio = () => {
  const { projects } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter(p => p.category === activeFilter);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = useCallback((direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex(prev => (prev === 0 ? filteredProjects.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex(prev => (prev === filteredProjects.length - 1 ? 0 : prev + 1));
    }
  }, [filteredProjects.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === "ArrowLeft") {
        navigateLightbox("prev");
      } else if (e.key === "ArrowRight") {
        navigateLightbox("next");
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, navigateLightbox]);

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden">
      {/* Dark overlay matching hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground/85 to-foreground/95 z-0" />

      {/* Interactive Floating Particles */}
      <FloatingParticles count={15} />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full z-[1]" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-primary/20 rounded-full z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 border-b-2 border-primary pb-2">
              Our Work
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mt-4 mb-6">
              Featured <span className="text-primary">Projects</span>
            </h2>
            <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed">
              Explore our portfolio of stunning interior transformations that
              showcase our commitment to excellence and attention to detail.
            </p>
          </div>
          <Link
            to="/gallery"
            className="group flex items-center gap-3 text-primary font-medium hover:gap-4 transition-all duration-300"
          >
            View All Projects
            <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-12" role="group" aria-label="Project category filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeFilter === category
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
              )}
              aria-pressed={activeFilter === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <article
              key={project.id}
              className="group cursor-pointer animate-fade-in"
              role="button"
              tabIndex={0}
              onClick={() => openLightbox(index)}
              onKeyDown={(e) => e.key === "Enter" && openLightbox(index)}
              aria-label={`View ${project.title} project`}
            >
              <div className="relative overflow-hidden rounded-2xl mb-6">
                <div className="aspect-[4/5] overflow-hidden">
                  <Image
                    src={project.heroImage}
                    alt={project.title}
                    imageClassName="transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                    <Eye className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>

                {/* Year Badge */}
                <div className="absolute top-4 right-4 bg-foreground/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {project.year}
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <span className="bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-px bg-primary" />
                  <span className="text-primary text-sm font-medium uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-primary-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-primary-foreground/60 leading-relaxed mb-4">
                  {project.brief.substring(0, 100)}...
                </p>
                <Link
                  to={`/portfolio/${project.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  View Full Project
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-primary-foreground/60 mb-6">Want to see more of our work?</p>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
          >
            Explore Full Portfolio
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-foreground/95 backdrop-blur-xl border-primary-foreground/10 p-2 md:p-4">
          <VisuallyHidden>
            <DialogTitle>Project Preview: {filteredProjects[currentImageIndex]?.title}</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-foreground/80 hover:bg-foreground transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={() => navigateLightbox("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-foreground/80 hover:bg-primary transition-colors group"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-6 h-6 text-primary-foreground group-hover:text-primary-foreground" />
            </button>
            <button
              onClick={() => navigateLightbox("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-foreground/80 hover:bg-primary transition-colors group"
              aria-label="Next project"
            >
              <ChevronRight className="w-6 h-6 text-primary-foreground group-hover:text-primary-foreground" />
            </button>

            {/* Image */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={filteredProjects[currentImageIndex]?.heroImage}
                alt={filteredProjects[currentImageIndex]?.title}
              />
            </div>

            {/* Info */}
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary/20 text-primary text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full">
                  {filteredProjects[currentImageIndex]?.category}
                </span>
                <span className="text-primary-foreground/50 text-sm">
                  {filteredProjects[currentImageIndex]?.year}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-primary-foreground mb-2">
                {filteredProjects[currentImageIndex]?.title}
              </h3>
              <p className="text-primary-foreground/60 mb-4">
                {filteredProjects[currentImageIndex]?.brief}
              </p>
              <Link
                to={`/portfolio/${filteredProjects[currentImageIndex]?.slug}`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                onClick={() => setLightboxOpen(false)}
              >
                View Full Project
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
              {filteredProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300",
                    currentImageIndex === index ? "ring-2 ring-primary scale-105" : "opacity-50 hover:opacity-100"
                  )}
                  aria-label={`View ${project.title}`}
                >
                  <Image src={project.heroImage} alt={project.title} />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Portfolio;
