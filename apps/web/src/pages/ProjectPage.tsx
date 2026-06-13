import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";

const ProjectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp || SITE_CONSTANTS.defaultWhatsApp;

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => slug ? api.getProjectBySlug(slug) : null,
    enabled: !!slug
  });

  const { data: projects = [], isLoading: isListLoading } = useQuery({
    queryKey: ['minimalProjects'],
    queryFn: api.getMinimalProjects
  });

  const isLoading = isProjectLoading || isListLoading;
  const currentIndex = projects.findIndex((p) => p.slug === slug);

  // Journey Line & Narrative sidebar scroll states
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const journeyHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [activeStage, setActiveStage] = useState(0);
  const [showMicroBar, setShowMicroBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowMicroBar(true);
      } else {
        setShowMicroBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.2) {
        setActiveStage(0); // DISCOVER
      } else if (latest >= 0.2 && latest < 0.4) {
        setActiveStage(1); // IMAGINE
      } else if (latest >= 0.4 && latest < 0.6) {
        setActiveStage(2); // DESIGN
      } else if (latest >= 0.6 && latest < 0.8) {
        setActiveStage(3); // ENGINEER
      } else {
        setActiveStage(4); // DELIVER
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const trackView = async () => {
      if (project?.id) {
        const viewedKey = `viewed_project_${project.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
          supabase.rpc('increment_project_view', { project_id: project.id }).then(({ error }) => {
            if (!error) {
              sessionStorage.setItem(viewedKey, 'true');
            }
          });
        }
      }
    };
    if (project?.id) {
      trackView();
    }
  }, [project?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-white/10 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-primary/60"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light">Loading</p>
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
          <h1 className="text-2xl font-serif mb-4 text-foreground">Project not found</h1>
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
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const relatedProjects = projects
    .filter((p) => p.id !== project.id && p.type === project.type)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{project.title} | Crossangle Interior</title>
        <meta name="description" content={project.brief} />
        <meta property="og:title" content={`${project.title} | Crossangle Interior`} />
        <meta property="og:description" content={project.brief} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://crossangleinterior.com/portfolio/${slug}`} />
      </Helmet>

      <Navbar />

      {/* Golden Journey Line & Scroll Progress Sidebar */}
      <div className="fixed left-6 md:left-12 lg:left-16 top-1/4 bottom-1/4 w-[1px] bg-white/10 z-40 hidden lg:block select-none pointer-events-none">
        {/* Fill track */}
        <motion.div 
          className="absolute top-0 left-0 right-0 bg-site-gold origin-top"
          style={{ height: journeyHeight }}
        />
        
        {/* Markers with labels */}
        <div className="absolute top-0 bottom-0 left-4 flex flex-col justify-between py-4">
          {[
            { name: "THE DREAM", idx: 0 },
            { name: "IMMERSE", idx: 1 },
            { name: "TRANSFORM", idx: 2 },
            { name: "THE CRAFT", idx: 3 },
            { name: "OUTCOME", idx: 4 }
          ].map((stage) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                {activeStage === stage.idx && (
                  <motion.div 
                    layoutId="activeCrosshair"
                    className="absolute w-6 h-6 border border-site-gold/25 rounded-full flex items-center justify-center pointer-events-none"
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  >
                    <div className="absolute w-[24px] h-[1px] bg-site-gold/20" />
                    <div className="absolute h-[24px] w-[1px] bg-site-gold/20" />
                  </motion.div>
                )}
                <div className={`w-2 h-2 rounded-full border transition-all duration-[0.6s] relative z-10 ${
                  activeStage === stage.idx 
                    ? "bg-site-gold border-site-gold scale-125 shadow-lg shadow-site-gold/50" 
                    : "bg-neutral-900 border-white/20"
                }`} />
              </div>
              <span className={`text-[9px] font-mono tracking-[0.25em] font-medium transition-all duration-[0.6s] ${
                activeStage === stage.idx 
                  ? "text-site-gold opacity-100 translate-x-0" 
                  : "text-stone-600 opacity-40 -translate-x-1"
              }`}>
                {stage.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Floating Micro-bar */}
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
 
      <main ref={containerRef} className="bg-background relative" id="main-content">

        {/* Blueprint Line Thread Overlay (Drawing downward dynamically with scroll) */}
        <div className="absolute left-6 md:left-12 lg:left-16 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none z-10 hidden lg:block">
          <motion.div 
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-site-gold via-site-gold to-transparent origin-top shadow-[0_0_12px_rgba(197,168,128,0.4)]"
            style={{ height: journeyHeight }}
          />
        </div>

        {/* ========================================================
            CHAPTER 01: THE DREAM (Visually captivate, establish scale)
           ======================================================== */}
        
        {/* Hero Banner */}
        <ProjectHero
          heroImage={project.heroImage || ''}
          title={project.title || 'Project Detail'}
          category={project.category || ''}
          style={project.style || ''}
          location={project.location || ''}
          area={project.area !== '-' ? project.area : undefined}
          year={project.year}
          tagline={project.brief ? project.brief.split('.')[0]?.trim() : undefined}
          brief={project.brief}
          type={project.type}
        />

        {/* Snapshot metrics */}
        <ProjectSnapshot 
          goal={project.brief ? project.brief.split('.')[0] + '.' : (project.type === 'commercial' ? 'Modernize workspace while maintaining corporate identity' : 'Create a calm, highly functional family home')}
          type={project.style || 'Luxury Turnkey'}
          timeline={project.duration || '45 Days'}
          investment={project.budget && project.budget !== '-' ? project.budget : undefined}
          challenge={project.approach ? project.approach.split('.')[0] + '.' : "Integrating smart home tech without compromising the minimalist aesthetic"}
        />

        {/* Morphing Video / 360 / Hotspots Canvas */}
        <ProjectExperienceCanvas whatsapp={whatsapp} />


        {/* ========================================================
            CHAPTER 02 & 03: THE CHALLENGE & TRANSFORMATION
           ======================================================== */}
        
        <ProjectStoryAndTransformation project={project} />


        {/* ========================================================
            CHAPTER 04: BEHIND THE CRAFT (Engineering & materials)
           ======================================================== */}
        
        {/* Horizontal drawing blueprints documentation */}
        <ProjectDocumentation />

        {/* Standard timeline track */}
        <ProjectSystemInAction project={project} />


        {/* ========================================================
            CHAPTER 05: THE OUTCOME (Metrics, proof, conversion)
           ======================================================== */}
        
        {/* By the numbers counters */}
        <ProjectOutcome
          location={project.location || ''}
          area={project.area || ''}
          duration={project.duration || ''}
          style={project.style || ''}
          year={project.year || 2024}
          type={project.type}
        />

        {/* The Verdict experience Q&A */}
        {project.testimonial && (
          <ProjectClientExperience 
            question1="What was your biggest fear before starting the project?"
            answer1="Honestly, the timeline and budget. We had heard horror stories of contractors disappearing and budgets doubling. Cross Angle's system was the only reason we felt comfortable moving forward."
            question2="What surprised you the most about the process?"
            answer2={project.testimonial.quote}
            clientName={project.testimonial.author}
            clientRole={project.testimonial.role}
          />
        )}

        {/* Invites blueprint CTA */}
        <ProjectCTA />

        {/* 13. Project Navigation (Related) */}
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
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">Previous</p>
                    <p className="font-serif text-foreground text-sm">{prevProject.title}</p>
                  </div>
                </motion.button>
              ) : <div />}

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
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">Next</p>
                    <p className="font-serif text-foreground text-sm">{nextProject.title}</p>
                  </div>
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:text-primary transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ) : <div />}
            </div>
          </div>
        </div>

        {/* 14. Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-24 border-t border-white/5">
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-4 font-light">— Continue Exploring</p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground">Related Projects</h2>
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
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-light">{rp.location}</p>
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
