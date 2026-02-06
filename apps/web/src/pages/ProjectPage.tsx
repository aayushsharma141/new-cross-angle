import { useParams, Link, useNavigate } from "react-router-dom";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectStats from "@/components/project/ProjectStats";
import ProjectGallery from "@/components/project/ProjectGallery";
import BeforeAfterSlider from "@/components/project/BeforeAfterSlider";
import { useProjects } from "@/context/ProjectContext";

const ProjectPage = () => {
  const { projects } = useProjects();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[currentIndex];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-4 text-foreground">Project not found</h1>
          <Link to="/gallery">
            <Button>Back to Portfolio</Button>
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
      </Helmet>

      <Navbar />
      <div className="pt-24">
        <AppBreadcrumb />
      </div>
      <WhatsAppButton />

      <main className="bg-background">

        {/* Immersive Hero */}
        <ProjectHero
          heroImage={project.heroImage}
          title={project.title}
          category={project.category}
          style={project.style}
          location={project.location}
        />

        {/* Stats Bar */}
        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <ProjectStats
            location={project.location}
            area={project.area}
            duration={project.duration}
            style={project.style}
            year={project.year}
            budget={project.budget}
          />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              {/* The Brief */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-primary" />
                  The Brief
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {project.brief}
                </p>
              </motion.section>

              {/* Our Approach */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-primary" />
                  Our Approach
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {project.approach}
                </p>
              </motion.section>

              {/* Before/After Slider */}
              {project.gallery[0]?.images?.length >= 2 && (
                <BeforeAfterSlider
                  beforeImage={project.gallery[0].images[0]}
                  afterImage={project.gallery[0].images[1]}
                />
              )}

              {/* Gallery */}
              <ProjectGallery gallery={project.gallery} title={project.title} />

              {/* Materials & Finishes */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-primary" />
                  Materials & Finishes
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.materials.map((material, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      className="p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                      <h4 className="font-semibold text-foreground mb-1">
                        {material.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {material.details}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Client Testimonial */}
              {project.testimonial && (
                <motion.section
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative p-8 md:p-10 rounded-2xl bg-primary/5 border border-primary/20 overflow-hidden"
                >
                  {/* Quote Icon */}
                  <Quote className="absolute top-6 right-6 w-16 h-16 text-primary/10" />

                  <blockquote className="text-lg md:text-xl italic text-foreground mb-6 relative z-10">
                    "{project.testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {project.testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {project.testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* CTA Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 border border-primary-foreground rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 border border-primary-foreground rounded-full translate-y-1/2 -translate-x-1/2" />
                  </div>

                  <h3 className="font-semibold mb-2 relative z-10">Interested in Similar Design?</h3>
                  <p className="text-primary-foreground/80 text-sm mb-4 relative z-10">
                    Get a free consultation for your project
                  </p>
                  <Link to="/contact-us">
                    <Button
                      variant="secondary"
                      className="w-full bg-background text-foreground hover:bg-background/90"
                    >
                      Get Free Consultation
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-border bg-muted/30"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
              {prevProject ? (
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => navigate(`/portfolio/${prevProject.slug}`)}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Previous</p>
                    <p className="font-medium text-foreground">{prevProject.title}</p>
                  </div>
                </motion.button>
              ) : (
                <div />
              )}

              <Link
                to="/gallery"
                className="hidden sm:block text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                View All Projects
              </Link>

              {nextProject ? (
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate(`/portfolio/${nextProject.slug}`)}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Next</p>
                    <p className="font-medium text-foreground">{nextProject.title}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </motion.div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-serif font-bold text-foreground mb-10"
              >
                Related Projects
              </motion.h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProjects.map((rp, index) => (
                  <motion.div
                    key={rp.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/portfolio/${rp.slug}`} className="group block">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                        <motion.img
                          src={rp.heroImage}
                          alt={rp.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {rp.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{rp.location}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main >

      <Footer />
    </>
  );
};

export default ProjectPage;
