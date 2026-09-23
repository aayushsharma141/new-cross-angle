import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import NotFound from "./NotFound";
import { Image } from "@/components/ui/enhanced/image";
import { serviceCategories, services } from "@/config/site-content";
import { SchemaMarkup, serializeJsonLd } from "@/components/shared/SchemaMarkup";
import { api } from "@/lib/api";
import {
  Section, Container, Eyebrow, DisplayHeading, Body, Em,
  FaqAccordion, reveal, textLinkClass, pillCtaClass, PillCtaInner, EASE_OUT_EXPO,
} from "@/components/editorial";

const ServiceDetailPage = () => {
    const { category: categorySlug, service: serviceSlug } = useParams();
    const staticService = services.find((item) => item.slug === serviceSlug);
    const { data: service, isLoading } = useQuery({
        queryKey: ["service", serviceSlug],
        queryFn: () => api.getServiceBySlug(serviceSlug || ""),
        enabled: !!serviceSlug,
    });
    const { data: allServices = [] } = useQuery({
        queryKey: ["services"],
        queryFn: api.getServices,
        enabled: true,
    });

    const category = serviceCategories.find((c) => c.slug === categorySlug);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--s-canvas-primary)]" aria-busy="true">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Loading service</span>
            </div>
        );
    }

    if (!service || !category) {
        return <NotFound />;
    }

    const relatedSlugs = service?.relatedServices || staticService?.relatedServices || [];
    const relatedServicesData = relatedSlugs
        .map((slug) => allServices.find((item) => item.slug === slug || item.id === slug))
        .filter((s): s is (typeof allServices)[number] => s !== undefined);

    const features = service.features ?? [];
    const processSteps = service.process_steps ?? [];
    const galleryImages = service.galleryImages ?? [];
    const faqs = (service.faq ?? []).map((item: { question: string; answer: string }) => ({
        question: item.question,
        answer: item.answer,
    }));

    return (
        <>
            <Helmet>
                <title>{`${service.title} - ${category.title} | Cross Angle Interior`}</title>
                <meta name="description" content={service.description} />
                <meta property="og:title" content={`${service.title} - ${category.title} | Cross Angle Interior`} />
                <meta property="og:description" content={service.description} />
                <link rel="canonical" href={`https://crossangleinterior.com/services/${category.slug}/${service.slug}`} />

                {faqs.length > 0 && (
                    <script type="application/ld+json">
                        {serializeJsonLd({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": faqs.map((item) => ({
                                "@type": "Question",
                                "name": item.question,
                                "acceptedAnswer": { "@type": "Answer", "text": item.answer },
                            })),
                        })}
                    </script>
                )}
            </Helmet>

            <SchemaMarkup
                type="Service"
                data={{
                    name: service.title,
                    description: service.description,
                }}
            />

            <Navbar />

            <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
                {/* Masthead */}
                <Container className="pt-36 pb-16 md:pt-48 md:pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                        className="max-w-3xl"
                    >
                        <Link
                            to={`/services/${category.slug}`}
                            className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:text-white"
                        >
                            <span aria-hidden="true">←</span> {category.title}
                        </Link>
                        <DisplayHeading as="h1" size="lg" className="mb-6">{service.title}</DisplayHeading>
                        <Body className="max-w-xl">{service.description}</Body>
                        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                            <Link to="/estimate" className={pillCtaClass}>
                                <PillCtaInner>Get an estimate</PillCtaInner>
                            </Link>
                            <Link to="/contact-us" className={textLinkClass}>
                                Talk to the studio <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </motion.div>
                </Container>

                {/* Lead image */}
                {service.hero_image && (
                    <Container className="mb-4 md:mb-8">
                        <motion.div {...reveal()} className="aspect-[16/9] w-full overflow-hidden bg-white/[0.03] md:aspect-[21/9]">
                            <Image
                                src={service.hero_image}
                                alt={service.title}
                                className="h-full w-full"
                                imageClassName="h-full w-full object-cover"
                                width={1800}
                                height={771}
                            />
                        </motion.div>
                    </Container>
                )}

                {/* Long description */}
                {service.longDescription && (
                    <Section rule>
                        <motion.div {...reveal()} className="service-prose max-w-[68ch]">
                            <ReactMarkdown>{service.longDescription}</ReactMarkdown>
                        </motion.div>
                    </Section>
                )}

                {/* What's included */}
                {features.length > 0 && (
                    <Section rule>
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
                            <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
                                <Eyebrow className="mb-6">What's included</Eyebrow>
                                <DisplayHeading className="mb-6">Scope of <Em>this service.</Em></DisplayHeading>
                            </motion.div>
                            <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
                                {features.map((feature, i) => (
                                    <motion.li
                                        key={feature}
                                        {...reveal(Math.min(i, 6) * 0.04)}
                                        className="flex items-baseline gap-4 border-t border-white/10 py-5"
                                    >
                                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                                        <span className="text-sm font-light leading-relaxed text-white/75 md:text-[15px]">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </Section>
                )}

                {/* Process */}
                {processSteps.length > 0 && (
                    <Section rule>
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
                            <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
                                <Eyebrow className="mb-6">How it runs</Eyebrow>
                                <DisplayHeading className="mb-6">From brief to <Em>handover.</Em></DisplayHeading>
                            </motion.div>
                            <ol>
                                {processSteps.map((step, i) => (
                                    <motion.li
                                        key={step.title}
                                        {...reveal(i * 0.05)}
                                        className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-7"
                                    >
                                        <span className="pt-1 text-[10px] font-bold tracking-[0.2em] text-primary">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div>
                                            <h3 className="mb-2 font-display text-xl text-white md:text-2xl">{step.title}</h3>
                                            {step.description && <Body className="text-sm md:text-[15px]">{step.description}</Body>}
                                        </div>
                                    </motion.li>
                                ))}
                            </ol>
                        </div>
                    </Section>
                )}

                {/* Gallery */}
                {galleryImages.length > 0 && (
                    <Section rule>
                        <motion.div {...reveal()} className="mb-12">
                            <Eyebrow className="mb-6">Selected work</Eyebrow>
                            <DisplayHeading>Delivered <Em>projects.</Em></DisplayHeading>
                        </motion.div>
                        <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {galleryImages.map((img: string, idx: number) => (
                                <motion.li key={img} {...reveal(Math.min(idx, 5) * 0.05)}>
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                                        <Image
                                            src={img}
                                            alt={`${service.title} — project ${idx + 1}`}
                                            className="h-full w-full"
                                            imageClassName="h-full w-full object-cover"
                                            width={900}
                                            height={675}
                                        />
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* FAQ */}
                {faqs.length > 0 && (
                    <Section rule>
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
                            <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
                                <Eyebrow className="mb-6">Questions</Eyebrow>
                                <DisplayHeading className="mb-6">About {service.title.toLowerCase()}.</DisplayHeading>
                            </motion.div>
                            <FaqAccordion items={faqs} idPrefix={`service-faq-${service.slug}`} />
                        </div>
                    </Section>
                )}

                {/* Related services */}
                {relatedServicesData.length > 0 && (
                    <Section rule>
                        <motion.div {...reveal()} className="mb-12 flex items-baseline justify-between gap-6">
                            <DisplayHeading as="h2" size="sm">Often paired with</DisplayHeading>
                            <Link to="/services" className={textLinkClass}>All services <span aria-hidden="true">→</span></Link>
                        </motion.div>
                        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedServicesData.map((related, i) => (
                                <motion.li key={related.id} {...reveal(i * 0.05)}>
                                    <Link to={`/services/${related.category_id}/${related.slug}`} className="group block focus-visible:outline-none">
                                        {related.hero_image && (
                                            <div className="mb-6 aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                                                <Image
                                                    src={related.hero_image}
                                                    alt={related.title}
                                                    className="h-full w-full"
                                                    imageClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                                    width={900}
                                                    height={675}
                                                />
                                            </div>
                                        )}
                                        <h3 className="font-display text-xl text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                                            {related.title}
                                        </h3>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </Section>
                )}

            </main>

            <Footer />
            <ScrollToTop />

            <style>{`
                .service-prose {
                  font-family: var(--font-sans), system-ui, sans-serif;
                  font-size: 1.0625rem;
                  font-weight: 300;
                  line-height: 1.85;
                  color: rgba(255,255,255,0.7);
                }
                .service-prose h2, .service-prose h3 {
                  font-family: var(--font-display), serif;
                  font-weight: 400;
                  letter-spacing: -0.02em;
                  color: #fff;
                  margin: 2.2em 0 0.7em;
                }
                .service-prose h2 { font-size: clamp(1.6rem, 2.4vw, 2.1rem); }
                .service-prose h3 { font-size: clamp(1.3rem, 1.8vw, 1.6rem); }
                .service-prose p { margin-bottom: 1.5em; }
                .service-prose ul { margin: 0 0 1.5em 1.1em; list-style: disc; }
                .service-prose li { margin-bottom: 0.5em; }
            `}</style>
        </>
    );
};

export default ServiceDetailPage;
