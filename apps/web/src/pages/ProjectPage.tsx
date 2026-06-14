import { useParams, Link, useNavigate } from "react-router-dom";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectSnapshot from "@/components/project/ProjectSnapshot";
import ProjectExperienceCanvas from "@/components/project/ProjectExperienceCanvas";
import ProjectStoryAndTransformation from "@/components/project/ProjectStoryAndTransformation";
import ProjectDocumentation from "@/components/project/ProjectDocumentation";
import ProjectSystemInAction from "@/components/project/ProjectSystemInAction";
import ProjectOutcome from "@/components/project/ProjectOutcome";
import ProjectClientExperience from "@/components/project/ProjectClientExperience";
import ProjectCTA from "@/components/project/ProjectCTA";
import ProjectNarrativeSpine from "@/components/project/ProjectNarrativeSpine";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";

// Register GSAP plugins once at module level
gsap.registerPlugin(ScrollTrigger, useGSAP);

const ProjectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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

  // Stage detection via scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v < 0.2)        setActiveStage(0);
      else if (v < 0.4)   setActiveStage(1);
      else if (v < 0.6)   setActiveStage(2);
      else if (v < 0.8)   setActiveStage(3);
      else                setActiveStage(4);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const onScroll = () => setShowMicroBar(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── GSAP Master Scroll Timeline ───────────────────────────────────────────
  useGSAP(
    () => {
      if (!project) return;

      const prefersReduced =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Chapter: Canvas section fades in from slight offset — tightening the
      // perceived gap between Hero and the immersive canvas
      ScrollTrigger.create({
        trigger: '[data-chapter="canvas"]',
        start: "top 85%",
        end: "top 40%",
        scrub: 1,
        onUpdate: (self) => {
          gsap.set('[data-chapter="canvas"]', {
            opacity: 0.4 + self.progress * 0.6,
            y: 30 - self.progress * 30,
          });
        },
      });

      // Chapter: Story section — slide text from left as it enters
      ScrollTrigger.create({
        trigger: '[data-chapter="story"]',
        start: "top 90%",
        end: "top 50%",
        scrub: 1,
        onUpdate: (self) => {
          gsap.set('[data-chapter="story"] [data-reveal="quote"]', {
            opacity: self.progress,
            x: -20 + self.progress * 20,
          });
        },
      });

      // Chapter: Documentation — stagger reveal the timeline cards
      ScrollTrigger.create({
        trigger: '[data-chapter="craft"]',
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            '[data-chapter="craft"] [data-reveal="card"]',
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
            }
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
            }
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
            }
          );
        },
      });
    },
    { scope: containerRef, dependencies: [project] }
  );

  // ── View tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (project?.id) {
      const key = `viewed_project_${project.id}`;
      if (!sessionStorage.getItem(key)) {
        supabase
          .rpc("increment_project_view", { project_id: project.id })
          .then(({ error }) => {
            if (!error) sessionStorage.setItem(key, "true");
          });
      }
    }
  }, [project?.id]);

  // ── Loading / 404 states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-white/10 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-primary/60"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-serif mb-4 text-foreground">
            Project not found
          </h1>
          <Link to="/portfolio">
            <button className="inline-flex items-center justify-center border border-primary/30 text-primary hover:bg-primary hover:text-background px-6 py-2 rounded-md transition-colors text-sm">
              Back to Portfolio
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
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
            className="fixed top-16 left-0 right-0 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 z-45 py-3.5 hidden md:block"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center text-xs">
              <span className="font-serif text-white text-sm tracking-wide">
                {project.title}
              </span>
              <div className="flex gap-8 text-[10px] font-mono tracking-widest text-stone-400 uppercase">
                <div className="flex items-center gap-2">
                  <span className="text-site-gold">Area:</span>
                  <span className="text-white">{project.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-site-gold">Timeline:</span>
                  <span className="text-white">{project.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-site-gold">Location:</span>
                  <span className="text-white">{project.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN PAGE JOURNEY ───────────────────────────────────────────── */}
      <main
        ref={containerRef}
        className="bg-background relative"
        id="main-content"
      >
        {/* Blueprint thread overlay — subtle ghost behind spine */}
        <div
          className="absolute left-6 md:left-12 lg:left-16 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none z-10 hidden lg:block"
          aria-hidden="true"
        >
          <motion.div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-site-gold via-site-gold to-transparent origin-top shadow-[0_0_12px_rgba(197,168,128,0.3)]"
            style={{ height: journeyHeight }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 01 — THE DREAM
            Rhythm: MASSIVE (100vh) — captivate
           ═══════════════════════════════════════════════════════════════ */}
        <div data-chapter="dream">
          <ProjectHero
            heroImage={project.heroImage || ""}
            title={project.title || "Project Detail"}
            category={project.category || ""}
            style={project.style || ""}
            location={project.location || ""}
            area={project.area !== "-" ? project.area : undefined}
            year={project.year}
            tagline={
              project.brief
                ? project.brief.split(".")[0]?.trim()
                : undefined
            }
            brief={project.brief}
            type={project.type}
          />
        </div>

        {/* Rhythm: tiny — metadata chips, breathe after the hero */}
        <div data-chapter="snapshot">
          <ProjectSnapshot
            goal={
              project.brief
                ? project.brief.split(".")[0] + "."
                : project.type === "commercial"
                ? "Modernize workspace while maintaining corporate identity"
                : "Create a calm, highly functional family home"
            }
            type={project.style || "Luxury Turnkey"}
            timeline={project.duration || "45 Days"}
            investment={
              project.budget && project.budget !== "-"
                ? project.budget
                : undefined
            }
            challenge={
              project.approach
                ? project.approach.split(".")[0] + "."
                : "Integrating smart home tech without compromising the minimalist aesthetic"
            }
          />
        </div>

        {/* Rhythm: HUGE (80vh canvas) — immerse */}
        <div
          data-chapter="canvas"
          id="walkthrough"
          className="will-change-[opacity,transform]"
        >
          <ProjectExperienceCanvas whatsapp={whatsapp} />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 02 & 03 — CHALLENGE & TRANSFORMATION
            Rhythm: quiet (quote) → MASSIVE (before/after) → tiny (3 lines)
            Overlaps upward into canvas section for seamless flow
           ═══════════════════════════════════════════════════════════════ */}
        <div
          data-chapter="story"
          className="relative -mt-10 z-10"
        >
          <ProjectStoryAndTransformation project={project} />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 04 — BEHIND THE CRAFT
            Rhythm: HUGE (blueprints) → quiet (methodology)
           ═══════════════════════════════════════════════════════════════ */}
        <div data-chapter="craft">
          <ProjectDocumentation />
          <ProjectSystemInAction project={project} />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 05 — THE OUTCOME
            Rhythm: HUGE (numbers) → quiet (testimonial) → MASSIVE (CTA)
           ═══════════════════════════════════════════════════════════════ */}
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

        {project.testimonial && (
          <div data-chapter="testimonial">
            <ProjectClientExperience
              question1="What was your biggest fear before starting the project?"
              answer1="Honestly, the timeline and budget. We had heard horror stories of contractors disappearing and budgets doubling. Cross Angle's system was the only reason we felt comfortable moving forward."
              question2="What surprised you the most about the process?"
              answer2={project.testimonial.quote}
              clientName={project.testimonial.author}
              clientRole={project.testimonial.role}
            />
          </div>
        )}

        <div data-chapter="cta">
          <ProjectCTA />
        </div>

        {/* Project navigation */}
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex justify-between items-center">
              {prevProject ? (
                <motion.button
                  whileHover={{ x: -4 }}
                  onClick={() => navigate(`/portfolio/${prevProject.slug}`)}
                  className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:text-primary transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">
                      Previous
                    </p>
                    <p className="font-serif text-foreground text-sm">
                      {prevProject.title}
                    </p>
                  </div>
                </motion.button>
              ) : (
                <div />
              )}

              <Link
                to="/portfolio"
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors font-light"
              >
                All Projects
              </Link>

              {nextProject ? (
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/portfolio/${nextProject.slug}`)}
                  className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">
                      Next
                    </p>
                    <p className="font-serif text-foreground text-sm">
                      {nextProject.title}
                    </p>
                  </div>
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:text-primary transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-24 border-t border-white/5">
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-4 font-light">
                  — Continue Exploring
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                  Related Projects
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-5">
                {relatedProjects.map((rp, index) => (
                  <motion.div
                    key={rp.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/portfolio/${rp.slug}`} className="group block">
                      <div className="aspect-[4/3] overflow-hidden mb-5 relative">
                        <motion.div
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.7 }}
                          className="w-full h-full"
                        >
                          <img
                            src={rp.heroImage}
                            alt={rp.title}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                            loading="lazy"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <h3 className="font-serif text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                        {rp.title}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-light">
                        {rp.location}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default ProjectPage;
