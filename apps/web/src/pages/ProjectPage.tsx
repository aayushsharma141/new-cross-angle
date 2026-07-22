import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectClientExperience from "@/components/project/ProjectClientExperience";
import ProjectNarrativeSpine from "@/components/project/ProjectNarrativeSpine";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SITE_CONSTANTS } from "@/lib/constants";

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

  // ── Scroll state ──────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeStage, setActiveStage] = useState(0);
  const [showMicroBar, setShowMicroBar] = useState(false);

  // Smooth spring for spine draw
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
  });
  const journeyHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Stage detection via IntersectionObserver to respect actual section heights
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.chapter;
            if (id === "arrival") setActiveStage(0);
            else if (id === "context") setActiveStage(1);
            else if (id === "constraints") setActiveStage(2);
            else if (id === "design") setActiveStage(3);
            else if (id === "materials") setActiveStage(4);
            else if (id === "process") setActiveStage(5);
            else if (id === "transformation") setActiveStage(6);
            else if (id === "outcome") setActiveStage(7);
            else if (id === "reflection") setActiveStage(8);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    const chapters = document.querySelectorAll("[data-chapter]");
    chapters.forEach((c) => observer.observe(c));

    return () => observer.disconnect();
  }, []);

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

  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

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

      {/* ── Persistent Narrative Spine ──────────────────────────────────── */}
      <ProjectNarrativeSpine
        scrollYProgress={smoothProgress}
        activeStage={activeStage}
      />

      {/* ── Floating Micro-bar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showMicroBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-0 right-0 bg-[var(--s-canvas-primary)]/90 backdrop-blur-xl border-b border-[var(--s-border-subtle)] z-45 py-4 hidden md:block"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center text-xs">
              <span className="font-display text-[var(--s-text-primary)] text-sm tracking-wide">
                {project.title}
              </span>
              <div className="flex gap-8 text-[10px] tracking-widest text-[var(--s-text-tertiary)] uppercase font-bold">
                <div className="flex items-center gap-2">
                  <span>Area:</span>
                  <span className="text-[var(--s-text-secondary)]">{project.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Timeline:</span>
                  <span className="text-[var(--s-text-secondary)]">{project.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Location:</span>
                  <span className="text-[var(--s-text-secondary)]">{project.location}</span>
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
        {/* Blueprint thread overlay — subtle ghost behind spine */}
        <div
          className="absolute left-6 md:left-12 lg:left-16 top-0 bottom-0 w-[1px] bg-[var(--s-border-subtle)] pointer-events-none z-10 hidden lg:block"
          aria-hidden="true"
        >
          <motion.div
            className="absolute top-0 left-0 right-0 bg-[var(--s-text-tertiary)] origin-top opacity-50"
            style={{ height: journeyHeight }}
          />
        </div>

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
        <div className="py-24 md:py-32 bg-[var(--s-surface-raised)] relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 relative z-10">
            {/* Context - Asymmetric left emphasis */}
            <div data-chapter="context" className="md:col-span-8 flex flex-col justify-center pb-8 md:pb-0">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--s-text-tertiary)] mb-8">The Context</h2>
              <p className="text-2xl md:text-3xl lg:text-4xl font-display text-[var(--s-text-primary)] leading-[1.4] tracking-tight">
                {project.brief ||
                  "Every space begins with a distinct reality. The client needed a complete paradigm shift—moving from a fragmented layout to a cohesive, breathable environment."}
              </p>
            </div>
            {/* Constraints - Asymmetric right detail */}
            <div data-chapter="constraints" className="md:col-span-4 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[var(--s-border-subtle)] pt-8 md:pt-0 md:pl-12">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--s-text-tertiary)] mb-6">The Constraints</h2>
              <div className="font-sans font-light text-[var(--s-text-secondary)] leading-relaxed text-sm md:text-base">
                <p>
                  {project.approach ||
                    "Strict structural limitations, unmovable load-bearing elements, and an aggressive timeline forced us to rely on inventive zoning rather than simple demolition."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DESIGN THINKING */}
        <div data-chapter="design" className="py-24 md:py-32">
          <ErrorBoundary>
            <ProjectExperienceCanvas whatsapp={whatsapp} />
          </ErrorBoundary>
        </div>

        {/* 5. MATERIAL DECISIONS */}
        <div data-chapter="materials" className="py-[15vh] relative px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-16 lg:gap-24">
            <div className="w-full md:w-5/12 pb-0 md:pb-12">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--s-text-tertiary)] mb-6">
                Material Decisions
              </h2>
              <p className="text-xl lg:text-2xl font-display text-[var(--s-text-primary)] leading-[1.4] mb-8">
                Tactile choices that define the atmosphere. We selected raw,
                authentic finishes that age gracefully over time.
              </p>
              <p className="text-sm text-[var(--s-text-secondary)] font-sans max-w-sm">
                Focusing on texture rather than ornament, each surface is intentional and resilient.
              </p>
            </div>
            {project.gallery && project.gallery.length > 0 && (
              <div className="w-full md:w-7/12">
                <div className="relative aspect-[4/5] md:aspect-[3/2] w-full overflow-hidden bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)] group">
                  <img
                    src={project.gallery[0]}
                    alt="Material detail"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.02]"
                  />
                </div>
              </div>
            )}
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

        {/* 10. NEXT PROJECT */}
        <div data-chapter="next" className="border-t border-[var(--s-border-subtle)]">
          {nextProject ? (
            <Link 
              to={`/portfolio/${nextProject.slug}`}
              className="relative block w-full h-[60vh] min-h-[400px] overflow-hidden group cursor-pointer" 
            >
              {/* Background image */}
              <div className="absolute inset-0 z-0 bg-[var(--s-canvas-primary)]">
                <img 
                  src={nextProject.heroImage} 
                  alt={nextProject.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-[1.5s] ease-out" 
                />
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-6">Continue the Journey</p>
                <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight">{nextProject.title}</h3>
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <ChevronRight className="w-5 h-5 ml-0.5" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="max-w-6xl mx-auto px-6 py-12 flex justify-center">
              <Link
                to="/portfolio"
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--s-text-tertiary)] hover:text-[var(--s-text-primary)] transition-colors"
              >
                Return to Gallery
              </Link>
            </div>
          )}
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-[15vh] border-t border-[var(--s-border-subtle)] px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--s-text-tertiary)] mb-4">
                — Continue Exploring
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-[var(--s-text-primary)] tracking-tight">
                Related Projects
              </h2>
            </motion.div>
            <div
              className={`grid gap-12 ${
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
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/portfolio/${rp.slug}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden mb-6 relative bg-[var(--s-surface-raised)] border border-[var(--s-border-subtle)]">
                      <motion.div
                        className="w-full h-full"
                      >
                        <img
                          src={rp.heroImage}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </motion.div>
                    </div>
                    <h3 className="font-display text-xl text-[var(--s-text-primary)] group-hover:opacity-70 transition-opacity mb-2">
                      {rp.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[var(--s-text-secondary)]">
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
