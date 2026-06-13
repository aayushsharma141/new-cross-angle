import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectStory from "@/components/project/ProjectStory";
import ProjectDesignDecisions from "@/components/project/ProjectDesignDecisions";
import ProjectGallery from "@/components/project/ProjectGallery";
import ProjectPalette from "@/components/project/ProjectPalette";
import ProjectOutcome from "@/components/project/ProjectOutcome";
import ProjectHotspots from "@/components/project/ProjectHotspots";
import ProjectMoodboard from "@/components/project/ProjectMoodboard";
import ProjectVideo from "@/components/project/ProjectVideo";
import { Compare } from "@/components/ui/enhanced/compare";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";
import { Image } from "@/components/ui/enhanced/image";

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
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-background">
              Back to Portfolio
            </Button>
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

      <main className="bg-background" id="main-content">

        {/* 1. Cinematic Hero — architectural client profile strip */}
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

        {/* 2. Project Narrative — Challenge → Strategy → Outcome */}
        <ProjectStory
          brief={project.brief || ''}
          approach={project.approach || ''}
          title={project.title || ''}
          image={project.gallery?.[0]?.images?.[1] || project.heroImage}
        />

        {/* 3. Design Decisions — expertise signalling */}
        <ProjectDesignDecisions
          type={project.type}
          category={project.category}
        />

        {/* 3.5 Spatial Details (Hotspots) */}
        {project.gallery && project.gallery.length > 0 && project.gallery[0].images && project.gallery[0].images.length > 0 && (
          <div className="border-t border-white/5 bg-neutral-950">
            <ProjectHotspots image={project.gallery[0].images[0]} />
          </div>
        )}

        {/* 4. Before / After Spatial Transformation (if data available) */}
        {project.gallery && project.gallery[0]?.images?.length >= 2 && (
          <section className="py-20 border-t border-white/5">
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex items-center gap-4 mb-12"
              >
                <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Before / After</span>
                <span className="flex-1 h-px bg-white/10 max-w-xs" />
              </motion.div>

              <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden border border-white/5 select-none">
                <Compare
                  firstImage={project.gallery[0].images[0]}
                  secondImage={project.gallery[0].images[1]}
                  className="w-full h-full object-cover"
                  slideMode="hover"
                />
              </div>
            </div>
          </section>
        )}

        {/* 5. Immersive Editorial Gallery */}
        <ProjectGallery gallery={project.gallery || []} title={project.title} />

        {/* 6. Materials & Finishes — with rationale */}
        <ProjectPalette materials={project.materials || []} />

        {/* 6.5 Project Video Walkthrough */}
        <ProjectVideo />

        {/* 7. Project Snapshot / Outcome — real numbers */}
        <ProjectOutcome
          location={project.location || ''}
          area={project.area || ''}
          duration={project.duration || ''}
          style={project.style || ''}
          year={project.year || 2024}
          type={project.type}
        />

        {/* 8. Design DNA / Archetype + unified CTA */}
        <ProjectMoodboard />

        {/* 9. Project Navigation */}
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

        {/* 10. Related Projects */}
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
                          <Image
                            src={rp.heroImage}
                            alt={rp.title}
                            className="w-full h-full"
                            imageClassName="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
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
