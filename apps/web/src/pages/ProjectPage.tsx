import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Image } from "@/components/ui/enhanced/image";
import { api } from "@/lib/api";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import { getOptimizedUrl } from "@/lib/cdn";
import {
  Section, Container, Eyebrow, DisplayHeading, Body, Em,
  reveal, textLinkClass, EASE_OUT_EXPO,
} from "@/components/editorial";

/** CMS rows use "-" as an empty placeholder for the fact fields. */
const hasValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  return text.length > 0 && text !== "-" && text !== "—";
};

const ProjectPage = () => {
  const { slug } = useParams<{ slug: string }>();

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--s-canvas-primary)]" aria-busy="true">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Loading project</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--s-canvas-primary)] px-6 text-white">
        <div className="text-center">
          <DisplayHeading as="h1" size="md" className="mb-8">Project not found.</DisplayHeading>
          <Link to="/portfolio" className={textLinkClass}>
            Back to portfolio <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = projects.findIndex((p) => p.slug === slug);
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

  /* Every block below renders only when the CMS actually has that content —
     several projects carry nothing beyond title, location and cover image. */
  const facts = [
    { label: "Client", value: project.client },
    { label: "Location", value: project.location },
    { label: "Area", value: project.area },
    { label: "Duration", value: project.duration },
    { label: "Investment", value: project.budget },
    { label: "Style", value: project.style },
    { label: "Year", value: project.year },
  ].filter((f) => hasValue(f.value));

  const galleryRooms = (project.gallery ?? []).filter((room) => room.images?.length);
  const materials = project.materials ?? [];

  return (
    <>
      <Helmet>
        <title>{project.title} | Crossangle Interior</title>
        {project.brief && <meta name="description" content={project.brief} />}
        <meta property="og:title" content={`${project.title} | Crossangle Interior`} />
        {project.brief && <meta property="og:description" content={project.brief} />}
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://crossangleinterior.com/portfolio/${slug}`} />
      </Helmet>

      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Portfolio", url: "/portfolio" },
            { name: project.title, url: `/portfolio/${slug}` },
          ],
        }}
      />

      <Navbar />

      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white" data-environment="gallery">
        {/* Cover */}
        <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-black md:min-h-[85vh]">
          <img
            src={getOptimizedUrl(project.heroImage, { width: 2000, quality: 82 })}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            loading="eager"
            decoding="async"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
          <Container className="relative z-10 pb-16 pt-32 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
              className="max-w-4xl"
            >
              <Eyebrow className="mb-6">{project.category}</Eyebrow>
              <DisplayHeading as="h1" size="xl">{project.title}</DisplayHeading>
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                {[project.location, hasValue(project.style) ? project.style : null, project.year]
                  .filter(Boolean)
                  .map((item, i, arr) => (
                    <span key={String(item)} className="flex items-center gap-3">
                      {item}
                      {i < arr.length - 1 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/25" />}
                    </span>
                  ))}
              </p>
            </motion.div>
          </Container>
        </section>

        {/* Facts */}
        {facts.length > 0 && (
          <Section spacing="tight" className="border-b border-white/5">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-7">
              {facts.map((fact, i) => (
                <motion.div key={fact.label} {...reveal(i * 0.04)}>
                  <dt className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">{fact.label}</dt>
                  <dd className="font-display text-xl text-white">{fact.value}</dd>
                </motion.div>
              ))}
            </dl>
          </Section>
        )}

        {/* Brief & approach */}
        {(project.brief || project.approach) && (
          <Section rule>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
              <motion.div {...reveal()}>
                <Eyebrow className="mb-6">The brief</Eyebrow>
                <DisplayHeading className="mb-6">
                  What the space had to <Em>do.</Em>
                </DisplayHeading>
              </motion.div>
              <motion.div {...reveal(0.1)} className="flex flex-col gap-8">
                {project.brief && <Body className="max-w-2xl text-base md:text-lg">{project.brief}</Body>}
                {project.approach && (
                  <div className="border-t border-white/10 pt-8">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Our approach</p>
                    <Body className="max-w-2xl">{project.approach}</Body>
                  </div>
                )}
              </motion.div>
            </div>
          </Section>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <Section rule>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
              <motion.div {...reveal()}>
                <Eyebrow className="mb-6">Materials</Eyebrow>
                <DisplayHeading className="mb-6">
                  What it is <Em>made of.</Em>
                </DisplayHeading>
              </motion.div>
              <ol className="lg:col-span-1">
                {materials.map((material, i) => (
                  <motion.li
                    key={material.name}
                    {...reveal(i * 0.05)}
                    className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-7"
                  >
                    <span className="pt-1 text-[10px] font-bold tracking-[0.2em] text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="mb-2 font-display text-xl text-white md:text-2xl">{material.name}</h3>
                      {material.details && <Body className="text-sm md:text-[15px]">{material.details}</Body>}
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </Section>
        )}

        {/* Gallery, grouped by room */}
        {galleryRooms.length > 0 && (
          <Section rule>
            <motion.div {...reveal()} className="mb-14 max-w-3xl md:mb-20">
              <Eyebrow className="mb-6">The rooms</Eyebrow>
              <DisplayHeading className="mb-6">
                Photographed <Em>as built.</Em>
              </DisplayHeading>
            </motion.div>

            <div className="flex flex-col gap-20 md:gap-28">
              {galleryRooms.map((room) => (
                <section key={room.room}>
                  <motion.div {...reveal()} className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-white/10 pb-5">
                    <DisplayHeading as="h3" size="sm">{room.room}</DisplayHeading>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 tabular-nums">
                      {room.images.length} {room.images.length === 1 ? "frame" : "frames"}
                    </span>
                  </motion.div>
                  <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
                    {room.images.map((image, i) => (
                      <motion.li key={image} {...reveal(Math.min(i, 4) * 0.05)}>
                        <div className="aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                          <Image
                            src={image}
                            alt={`${project.title} — ${room.room}`}
                            className="h-full w-full"
                            imageClassName="h-full w-full object-cover"
                            width={1000}
                            height={750}
                          />
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </Section>
        )}

        {/* Client voice */}
        {project.testimonial?.quote && (
          <Section rule spacing="loose">
            <motion.figure {...reveal()} className="mx-auto max-w-4xl text-center">
              <Eyebrow rule={false} className="mb-10">Client perspective</Eyebrow>
              <blockquote>
                <DisplayHeading as="h2" size="lg" className="font-light">
                  &ldquo;{project.testimonial.quote}&rdquo;
                </DisplayHeading>
              </blockquote>
              <figcaption className="mt-10 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  {project.testimonial.author}
                </span>
                {project.testimonial.role && (
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                    {project.testimonial.role}
                  </span>
                )}
              </figcaption>
            </motion.figure>
          </Section>
        )}

        {/* Move on */}
        <Section rule spacing="tight">
          <div className="flex flex-col gap-10 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
            <Link to="/portfolio" className={textLinkClass}>
              <span aria-hidden="true">←</span> All projects
            </Link>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              {prevProject && (
                <Link to={`/portfolio/${prevProject.slug}`} className="group text-right focus-visible:outline-none">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Previous</span>
                  <span className="font-display text-xl text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                    {prevProject.title}
                  </span>
                </Link>
              )}
              {nextProject && (
                <Link to={`/portfolio/${nextProject.slug}`} className="group text-right focus-visible:outline-none">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Next</span>
                  <span className="font-display text-xl text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                    {nextProject.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </Section>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ProjectPage;
