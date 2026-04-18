import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectStats from "@/components/project/ProjectStats";
import ProjectGallery from "@/components/project/ProjectGallery";
import ProjectStory from "@/components/project/ProjectStory";
import ProjectPalette from "@/components/project/ProjectPalette";
import ProjectQuote from "@/components/project/ProjectQuote";
import ProjectMoodboard from "@/components/project/ProjectMoodboard";
import ProjectAmbience from "@/components/project/ProjectAmbience";
import ProjectHotspots from "@/components/project/ProjectHotspots";
import { Compare } from "@/components/ui/compare";
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
          <Link to="/gallery">
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

  // Derive a poetic tagline from the project brief (first sentence)
  const tagline = project.brief ? (project.brief.split('.')[0]?.trim() + '.') : "A study in refined modern living.";

  // Derive testimonial quote for quote section  
  const quoteText = project.testimonial?.quote || "Every detail was considered. Every corner speaks with intention.";

  return (
    <>
      <Helmet>
        <title>{project.title} | Crossangle Interior</title>
        <meta name="description" content={project.brief} />
      </Helmet>

      <Navbar />

      <main className="bg-background">
        {/* 1. Cinematic centered hero */}
        <ProjectHero
          heroImage={project.heroImage || ''}
          title={project.title || 'Project Detail'}
          category={project.category || ''}
          style={project.style || ''}
          location={project.location || ''}
          tagline={tagline}
        />

        {/* 2. Stats Bar (floating over content) */}
        <section className="px-6 max-w-7xl mx-auto w-full relative z-20 mb-16">
          <ProjectStats
            location={project.location || 'N/A'}
            area={project.area || 'N/A'}
            duration={project.duration || 'N/A'}
            style={project.style || 'N/A'}
            year={project.year || 2024}
            budget={project.budget || 'Premium'}
          />
        </section>

        {/* 3. Editorial Story Section */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <ProjectStory
            brief={project.brief || ''}
            approach={project.approach || ''}
            title={project.title || ''}
            image={project.gallery?.[0]?.images?.[1] || project.heroImage}
          />
        </section>

        {/* 4. Color Palette & Tactile Materials */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <ProjectPalette materials={project.materials || []} />
        </section>

        {/* 5. Before / After Spatial Transformation */}
        {project.gallery && project.gallery[0]?.images?.length >= 2 && (
          <section className="px-6 max-w-7xl mx-auto w-full mb-32">
            <div className="text-center mb-12 flex flex-col items-center">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">Transformation</span>
              <h2 className="text-3xl md:text-4xl text-white tracking-tight font-serif font-normal">From Vision to Reality</h2>
            </div>
            
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2rem] overflow-hidden group border border-white/10 select-none">
              <Compare
                firstImage={project.gallery[0].images[0]}
                secondImage={project.gallery[0].images[1]}
                className="w-full h-full object-cover"
                slideMode="hover"
              />
            </div>
          </section>
        )}

        {/* 6. Interactive Detail Hotspots */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <ProjectHotspots image={project.gallery?.[0]?.images?.[0] || project.heroImage || ''} />
        </section>

        {/* 7. Cinematic Gallery Stage */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <ProjectGallery gallery={project.gallery || []} title={project.title} />
        </section>

        {/* 8. Cinematic Quote */}
        <ProjectQuote
          quote={quoteText}
          attribution={project.testimonial?.author || "Project Designer"}
          whatsappNumber={whatsapp}
        />

        {/* 9. Ambient Lighting Experience */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <ProjectAmbience />
        </section>

        {/* 10. Inspired By Moodboard */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <ProjectMoodboard images={project.gallery?.[0]?.images?.map(img => ({ src: img, label: 'Inspiration' }))} />
        </section>

        {/* 11. Final Invitation CTA */}
        <section className="py-40 md:py-64 px-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[90vh] bg-neutral-950 border-t border-white/5 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-serif font-normal tracking-tight text-white mb-16 leading-[1.2]">
              Your space is ready for its <br />
              <span className="italic text-stone-300">next chapter.</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/contact-us">
                <button className="bg-primary text-white hover:bg-red-800 px-8 py-4 rounded-full text-[10px] font-medium tracking-[0.2em] transition-all shadow-lg shadow-red-900/20 uppercase w-full sm:w-auto">
                  Book a Free Consultation
                </button>
              </Link>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <button className="border border-white/10 hover:border-white/30 hover:bg-white/5 text-white px-8 py-4 rounded-full text-[10px] font-medium tracking-[0.2em] transition-all w-full sm:w-auto uppercase flex items-center justify-center gap-2">
                  Chat with Designer
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Project Navigation */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-10">
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
                to="/gallery"
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

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
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
                        <motion.img
                          src={rp.heroImage}
                          alt={rp.title}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.7 }}
                        />
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
