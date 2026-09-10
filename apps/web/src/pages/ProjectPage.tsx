import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectClientExperience from "@/components/project/ProjectClientExperience";
import ProjectExperienceCanvas from "@/components/project/ProjectExperienceCanvas";
import ProjectDocumentation from "@/components/project/ProjectDocumentation";
import ProjectStoryAndTransformation from "@/components/project/ProjectStoryAndTransformation";
import ProjectOutcome from "@/components/project/ProjectOutcome";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SITE_CONSTANTS } from "@/lib/constants";
import { getOptimizedUrl } from "@/lib/cdn";

// Register GSAP plugins once at module level
gsap.registerPlugin(ScrollTrigger);

const ProjectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp || SITE_CONSTANTS.defaultWhatsApp;

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => (slug ? api.getProjectBySlug(slug) : null),
    enabled: !!slug,
  });

  const { data: projects = [], isLoading: isListLoading } = useQuery({
    queryKey: ["minimalProjects"],
    queryFn: api.getMinimalProjects,
  });

  const isLoading = isProjectLoading || isListLoading;
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMicroBar, setShowMicroBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowMicroBar(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── GSAP Master Scroll Timeline ───────────────────────────────────────────
  useGSAP(
    () => {
      if (!project) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) return;

      // Chapter: Design canvas section fades in from slight offset
      ScrollTrigger.create({
        trigger: '[data-chapter="design"]',
        start: "top 85%",
        end: "top 40%",
        scrub: 1,
        onUpdate: (self) => {
          gsap.set('[data-chapter="design"]', {
            opacity: 0.4 + self.progress * 0.6,
            y: 30 - self.progress * 30,
          });
        },
      });

      // Chapter: Transformation section — slide text from left as it enters
      ScrollTrigger.create({
        trigger: '[data-chapter="transformation"]',
        start: "top 90%",
        end: "top 50%",
        scrub: 1,
        onUpdate: (self) => {
          gsap.set('[data-chapter="transformation"] [data-reveal="quote"]', {
            opacity: self.progress,
            x: -20 + self.progress * 20,
          });
        },
      });

      // Chapter: Process Documentation — stagger reveal the timeline cards
      ScrollTrigger.create({
        trigger: '[data-chapter="process"]',
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            '[data-chapter="process"] [data-reveal="card"]',
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
            },
          );
        },
      });

      // Chapter: Outcome — number counters get a subtle scale pop
      ScrollTrigger.create({
        trigger: '[data-chapter="outcome"]',
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            '[data-chapter="outcome"] [data-reveal="stat"]',
            { scale: 0.85, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: "back.out(1.4)",
            },
          );
        },
      });

      // CTA: gold glow pulse
      ScrollTrigger.create({
        trigger: '[data-chapter="cta"]',
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            '[data-chapter="cta"] [data-reveal="glow"]',
            { opacity: 0, scale: 0.7 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: "power2.out",
            },
          );
        },
      });
    },
    { scope: containerRef, dependencies: [project] },
  );

  // ── View tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (project?.id) {
      const key = `viewed_project_${project.id}`;
      if (!sessionStorage.getItem(key)) {
        supabase
          .rpc("increment_project_view", { project_id: project.id })
          .then(({ error }: { error: unknown }) => {
            if (!error) sessionStorage.setItem(key, "true");
          });
      }
    }
  }, [project?.id]);

  // ── Loading / 404 states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--s-canvas-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-[var(--s-border-subtle)] relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-[var(--s-text-primary)]/60"
              animate={{ y: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--s-text-tertiary)] font-light">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--s-canvas-primary)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-serif mb-4 text-[var(--s-text-primary)]">
            Project not found
          </h1>
          <Link to="/portfolio">
            <button className="inline-flex items-center justify-center border border-[var(--s-border-subtle)] text-[var(--s-text-secondary)] hover:bg-[var(--s-text-primary)] hover:text-[var(--s-canvas-primary)] px-6 py-2 rounded-none transition-colors text-sm uppercase tracking-widest font-medium">
              Back to Portfolio
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const prevProject =
    currentIndex > 0
      ? projects[currentIndex - 1]
      : projects.length > 1
        ? projects[projects.length - 1]
        : null;

  const nextProject =
    currentIndex >= 0 && currentIndex < projects.length - 1
      ? projects[currentIndex + 1]
      : projects.length > 1
        ? projects[0]
        : null;

  const relatedProjects = projects
    .filter((p) => p.id !== project.id && p.type === project.type)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{project.title} | Crossangle Interior</title>
        <meta name="description" content={project.brief} />
        <meta
          property="og:title"
          content={`${project.title} | Crossangle Interior`}
        />
        <meta property="og:description" content={project.brief} />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://crossangleinterior.com/portfolio/${slug}`}
        />
      </Helmet>

      <Navbar />

      {/* ── Floating Micro-bar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showMicroBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[84px] left-0 right-0 bg-[var(--s-canvas-primary)]/95 backdrop-blur-xl border-b border-[var(--s-border-subtle)] z-40 py-3.5 hidden md:block shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center text-xs">
              <div className="flex items-center gap-6">
                <Link to="/portfolio" className="text-[11px] font-semibold uppercase tracking-widest text-[var(--s-text-secondary)] hover:text-[var(--s-text-primary)] transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-1 -ml-1">
                  <span>← Back</span>
                </Link>
                <div className="w-px h-4 bg-[var(--s-border-subtle)]" aria-hidden="true" />
                <span className="font-display text-[var(--s-text-primary)] text-sm tracking-wide font-semibold">
                  {project.title}
                </span>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden lg:flex gap-8 text-[12px] tracking-widest text-[var(--s-text-secondary)] uppercase font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--s-text-tertiary)] font-normal">Area:</span>
                    <span className="text-[var(--s-text-primary)]">{project.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--s-text-tertiary)] font-normal">Timeline:</span>
                    <span className="text-[var(--s-text-primary)]">{project.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--s-text-tertiary)] font-normal">Location:</span>
                    <span className="text-[var(--s-text-primary)]">{project.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-[var(--s-border-subtle)] pl-4">
                  {prevProject && (
                    <Link
                      to={`/portfolio/${prevProject.slug}`}
                      className="text-[11px] font-semibold uppercase tracking-wider text-[var(--s-text-secondary)] hover:text-[var(--s-text-primary)] transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-2 py-1"
                      aria-label={`Previous project: ${prevProject.title}`}
                      title={`Previous: ${prevProject.title}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Prev</span>
                    </Link>
                  )}
                  {nextProject && (
                    <Link
                      to={`/portfolio/${nextProject.slug}`}
                      className="text-[11px] font-semibold uppercase tracking-wider text-[var(--s-text-secondary)] hover:text-[var(--s-text-primary)] transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-2 py-1"
                      aria-label={`Next project: ${nextProject.title}`}
                      title={`Next: ${nextProject.title}`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN PAGE JOURNEY ───────────────────────────────────────────── */}
      <main
        ref={containerRef}
        className="bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)] relative overflow-x-hidden"
        id="main-content"
        data-environment="gallery"
      >
        {/* 1. ARRIVAL */}
        <div data-chapter="arrival">
          <ProjectHero
            heroImage={project.heroImage || ""}
            title={project.title || "Project Detail"}
            category={project.category || ""}
            style={project.style || ""}
            location={project.location || ""}
            area={project.area !== "-" ? project.area : undefined}
            year={project.year}
            brief={project.brief}
            type={project.type}
          />
        </div>

        {/* 2 & 3. CONTEXT & CONSTRAINTS */}
        <div id="context-section" className="py-20 md:py-32 bg-[var(--s-surface-raised)] relative border-b border-[var(--s-border-subtle)] scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 relative z-10">
            {/* Context - Asymmetric left emphasis */}
            <div data-chapter="context" className="md:col-span-8 flex flex-col justify-center pb-8 md:pb-0">
              <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[var(--s-text-secondary)] mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-primary" aria-hidden="true" />
                The Context
              </h2>
              <p className="text-2xl md:text-3xl lg:text-4xl font-display text-[var(--s-text-primary)] leading-[1.35] tracking-tight font-light">
                {project.brief ||
                  "Every space begins with a distinct reality. The client needed a complete paradigm shift—moving from a fragmented layout to a cohesive, breathable environment."}
              </p>
            </div>
            {/* Constraints - Asymmetric right detail */}
            <div data-chapter="constraints" className="md:col-span-4 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[var(--s-border-subtle)] pt-8 md:pt-0 md:pl-12">
              <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[var(--s-text-secondary)] mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-primary" aria-hidden="true" />
                The Constraints
              </h2>
              <div className="font-sans font-normal text-[var(--s-text-secondary)] leading-relaxed text-sm md:text-base">
                <p>
                  {project.approach ||
                    "Strict structural limitations, unmovable load-bearing elements, and an aggressive timeline forced us to rely on inventive zoning rather than simple demolition."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DESIGN THINKING */}
        <div data-chapter="design" className="py-20 md:py-32">
          <ErrorBoundary>
            <ProjectExperienceCanvas whatsapp={whatsapp} />
          </ErrorBoundary>
        </div>

        {/* 5. MATERIAL DECISIONS */}
        <div data-chapter="materials" className="py-20 md:py-32 relative px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto border-t border-[var(--s-border-subtle)]">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-5/12">
              <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[var(--s-text-secondary)] mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-primary" aria-hidden="true" />
                Material Decisions
              </h2>
              <p className="text-2xl lg:text-3xl font-display text-[var(--s-text-primary)] leading-[1.35] mb-6 font-light">
                Tactile choices that define the atmosphere. We selected raw, authentic finishes that age gracefully over time.
              </p>
              <p className="text-sm text-[var(--s-text-secondary)] font-sans max-w-sm leading-relaxed">
                Focusing on texture rather than ornament, each surface is intentional and resilient.
              </p>
            </div>
            <div className="w-full md:w-7/12">
              <div className="relative aspect-[16/10] md:aspect-[3/2] w-full overflow-hidden bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)] rounded-xl group shadow-xl">
                <img
                  src={
                    project.gallery && project.gallery.length > 0
                      ? typeof project.gallery[0] === 'string'
                        ? project.gallery[0]
                        : (project.gallery[0]?.images?.[0] || project.heroImage)
                      : project.heroImage
                  }
                  alt={`${project.title} material detail`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. CONSTRUCTION / PROCESS */}
        <div data-chapter="process">
          <ProjectDocumentation />
        </div>

        {/* 7. TRANSFORMATION */}
        <div data-chapter="transformation" className="relative z-10">
          <ProjectStoryAndTransformation project={project} />
        </div>

        {/* 8. OUTCOME */}
        <div data-chapter="outcome">
          <ProjectOutcome
            location={project.location || ""}
            area={project.area || ""}
            duration={project.duration || ""}
            style={project.style || ""}
            year={project.year || 2024}
            type={project.type}
          />
        </div>

        {/* 9. REFLECTION */}
        {project.testimonial && (
          <div data-chapter="reflection">
            <ProjectClientExperience
              quote={project.testimonial.quote}
              clientName={project.testimonial.author}
              clientRole={project.testimonial.role}
            />
          </div>
        )}

        {/* 10. NEXT PROJECT & RETURN TO GALLERY */}
        <div data-chapter="next" className="border-t border-[var(--s-border-subtle)] flex flex-col">
          {nextProject && (
            <Link 
              to={`/portfolio/${nextProject.slug}`}
              className="relative block w-full h-[55vh] min-h-[380px] overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary" 
              aria-label={`View next project: ${nextProject.title}`}
            >
              {/* Background image */}
              <div className="absolute inset-0 z-0 bg-[var(--s-canvas-primary)]">
                <img 
                  src={getOptimizedUrl(nextProject.heroImage, { width: 800, quality: 80 })} 
                  alt={nextProject.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-all duration-[1.2s] ease-out" 
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <span className="w-6 h-px bg-primary" aria-hidden="true" />
                  Continue the Journey
                  <span className="w-6 h-px bg-primary" aria-hidden="true" />
                </p>
                <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight font-light">{nextProject.title}</h3>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/40 px-6 py-3 rounded-full group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-xl">
                  <span className="text-[11px] uppercase tracking-[0.25em] font-bold">View Project</span>
                  <ChevronRight className="w-4 h-4 -mr-1" aria-hidden="true" />
                </div>
              </div>
            </Link>
          )}

          <div className="max-w-6xl mx-auto px-6 py-16 flex justify-center w-full bg-[var(--s-surface-raised)] border-b border-[var(--s-border-subtle)]">
            <Link
              to="/portfolio"
              className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[var(--s-text-primary)] hover:bg-[var(--s-text-primary)] hover:text-[var(--s-canvas-primary)] transition-colors cursor-pointer px-8 py-4 border-2 border-[var(--s-text-primary)] rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Return to Gallery
            </Link>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-20 md:py-32 border-t border-[var(--s-border-subtle)] px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[var(--s-text-secondary)] mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-primary" aria-hidden="true" />
                Continue Exploring
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-[var(--s-text-primary)] tracking-tight font-light">
                Related Projects
              </h2>
            </motion.div>
            <div
              className={`grid gap-8 md:gap-12 ${
                relatedProjects.length === 1
                  ? "md:grid-cols-1 max-w-2xl"
                  : relatedProjects.length === 2
                    ? "md:grid-cols-2 max-w-5xl"
                    : "md:grid-cols-3"
              }`}
            >
              {relatedProjects.map((rp, index) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Link to={`/portfolio/${rp.slug}`} className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
                    <div className="aspect-[4/5] overflow-hidden mb-5 relative bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)] rounded-xl shadow-md">
                      <div className="w-full h-full">
                        <img
                          src={getOptimizedUrl(rp.heroImage, { width: 800, quality: 80 })}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <h3 className="font-display text-xl text-[var(--s-text-primary)] group-hover:text-primary transition-colors mb-1.5 font-normal">
                      {rp.title}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[var(--s-text-secondary)]">
                      {rp.location}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ProjectPage;
