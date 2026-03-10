import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingParticles from "./FloatingParticles";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { categories } from "@/data/projects";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Image } from "@/components/ui/image";
import { motion } from "framer-motion";
import Magnetic from "./ui/magnetic";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useImageParallax } from "@/hooks/useImageParallax";

import { type Project } from "@/data/projects";

const ProjectCard = ({
  project,
  index,
  openLightbox
}: {
  project: Project;
  index: number;
  openLightbox: (index: number) => void
}) => {
  const { containerRef, imageRef } = useImageParallax({ speed: 0.15, scale: 1.15 });

  return (
    <div
      className="group relative animate-fade-in"
      ref={containerRef}
    >
      <div
        className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4 cursor-pointer"
        onClick={() => openLightbox(index)}
        onKeyDown={(e) => e.key === "Enter" && openLightbox(index)}
        role="button"
        tabIndex={0}
        aria-label={`View ${project.title} project`}
      >
        <div className="aspect-[4/5] overflow-hidden">
          <Image
            ref={imageRef}
            src={project.heroImage}
            alt={project.title}
            loading="lazy"
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">{project.category}</span>
        </div>
        <h3 className="text-xl font-display font-bold">{project.title}</h3>
        <p className="text-primary-foreground/60 leading-relaxed mb-4">
          {project.brief.substring(0, 100)}...
        </p>
        <Link
          to={`/portfolio/${project.slug}`}
          className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          View Full Project
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, navigateLightbox]);

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="portfolio">
      <FloatingParticles />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6 block"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground">
                Curated Excellence
              </h2>
            </motion.div>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Explore our portfolio of ultra-luxury residences and high-value commercial environments
              that redefine the boundaries of spatial anticipation.
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
        <div className="flex flex-wrap gap-4 mb-12" aria-label="Project category filters">
          {categories.map((category) => {
            const isSelected = activeFilter === category;
            return (
              <Magnetic key={category} strength={0.2}>
                {isSelected ? (
                  <button
                    onClick={() => setActiveFilter(category)}
                    aria-pressed="true"
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    )}
                  >
                    {category}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveFilter(category)}
                    aria-pressed="false"
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {category}
                  </button>
                )}
              </Magnetic>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              openLightbox={openLightbox}
            />
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
        <DialogContent className="max-w-5xl bg-background/95 backdrop-blur-xl border-primary/20 p-2 md:p-4 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
          <VisuallyHidden>
            <DialogTitle>Project Preview: {filteredProjects[currentImageIndex]?.title}</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
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
                loading="lazy"
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
            <div
              className="flex gap-2 px-4 pb-4 overflow-x-auto focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
              role="region"
              aria-label="Project thumbnails"
              tabIndex={0}
            >
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
                  <Image src={project.heroImage} alt={project.title} loading="lazy" />
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
