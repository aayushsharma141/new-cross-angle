import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/primitives/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/primitives/accordion";
import { serviceCategories, services } from "@/config/site-content";
import NotFound from "./NotFound";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { motion } from "framer-motion";
import { SchemaMarkup, serializeJsonLd } from "@/components/shared/SchemaMarkup";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import { Image } from "@/components/ui/enhanced/image";

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
        enabled: Boolean(staticService?.relatedServices?.length),
    });

    const category = serviceCategories.find((c) => c.slug === categorySlug);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!service || !category) {
        return <NotFound />;
    }

    // Get related services data
    const relatedServicesData = (staticService?.relatedServices || [])
        .map((slug) => allServices.find((item) => item.slug === slug))
        .filter((s): s is (typeof allServices)[number] => s !== undefined);

    return (
        <>
            <Helmet>
                <title>{`${service.title} - ${category.title} | Cross Angle Interior`}</title>
                <meta name="description" content={service.description} />
                <meta property="og:title" content={`${service.title} - ${category.title} | Cross Angle Interior`} />
                <meta property="og:description" content={service.description} />
                <meta property="og:type" content="website" />
                <link rel="canonical" href={`https://crossangleinterior.com/services/${categorySlug}/${serviceSlug}`} />
                {service.faq && service.faq.length > 0 && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{
                        __html: serializeJsonLd({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": service.faq.map((item: { question: string; answer: string }) => ({
                                "@type": "Question",
                                "name": item.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": item.answer
                                }
                            }))
                        })
                    }} />
                )}
            </Helmet>
            <SchemaMarkup
                type="Service"
                data={{
                    "@type": "Service",
                    "serviceType": "Interior Design",
                    "provider": {
                        "@type": "InteriorDesigner",
                        "name": "Cross Angle Interior",
                        "image": "https://crossangleinterior.com/logo-icon.png"
                    },
                    "areaServed": {
                        "@type": "Country",
                        "name": "India"
                    },
                    "name": service.title,
                    "description": service.description,
                    "offers": {
                        "@type": "Offer",
                        "availability": "https://schema.org/InStock",
                        "price": "Call for quote",
                        "priceCurrency": "INR"
                    }
                }}
            />

            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />

                <main id="main-content" className="flex-grow">

                    {/* Hero Section */}
                    <section className="relative py-16 md:py-24 overflow-hidden">
                        <div className="container px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
                                    {category.title}
                                </span>
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-bold tracking-tight text-foreground">
                                    {service.title}
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary/20 pl-6">
                                    {service.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/20" asChild>
                                        <Link to="/contact-us">Get a Free Quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg" asChild>
                                        <Link to="/estimate">Get Your Estimate</Link>
                                    </Button>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
                                    <Image
                                        src={service.hero_image}
                                        alt={service.title}
                                        className="h-full w-full"
                                        imageClassName="transform transition duration-700 group-hover:scale-105"
                                        width={960}
                                        height={720}
                                        loading="eager"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Rich Content / Long Description */}
                    {staticService?.longDescription && (
                        <section className="py-16 border-t border-border/50">
                            <div className="container px-4 max-w-4xl mx-auto prose prose-lg prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground md:prose-xl">
                                <ReactMarkdown>{staticService.longDescription}</ReactMarkdown>
                            </div>
                        </section>
                    )}

                    {/* Features & Process */}
                    <section className="py-20 bg-background">
                        <div className="container px-4 max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {/* Features */}
                                <div>
                                    <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        Why Choose This Service?
                                    </h2>
                                    <div className="space-y-6">
                                        {service.features.map((feature, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex gap-4 items-center p-4 rounded-xl bg-accent/5 border border-border hover:border-primary/30 transition-all"
                                            >
                                                <div className="p-2 bg-primary/10 rounded-full text-primary flex-shrink-0">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-lg">{feature}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Process */}
                                <div>
                                    <h2 className="font-serif text-3xl mb-8">Our Process</h2>
                                    <div className="space-y-0 relative pl-8 border-l-2 border-primary/20">
                                        {(service.process_steps || []).map((step, i) => (
                                            <div key={i} className="mb-10 last:mb-0 relative">
                                                <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-background border-4 border-primary flex items-center justify-center top-1">
                                                </div>
                                                <h3 className="font-serif text-xl mb-2 font-semibold text-foreground">{step.title}</h3>
                                                <p className="text-muted-foreground">{step.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Related Services (New) */}
                    {relatedServicesData.length > 0 && (
                        <section className="py-16 bg-muted/20">
                            <div className="container px-4">
                                <h2 className="font-serif text-3xl mb-10 text-center">Complementary Services</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                    {relatedServicesData.map((s) => (
                                        <Link key={s.id} to={`/services/${s.category_id}/${s.slug}`} className="group aspect-video relative overflow-hidden rounded-xl shadow-md block">
                                            <Image
                                                src={s.hero_image}
                                                alt={s.title || "Related service"}
                                                className="h-full w-full"
                                                imageClassName="transition-transform duration-500 group-hover:scale-110"
                                                width={640}
                                                height={360}
                                            />
                                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <h3 className="text-white text-xl font-bold font-serif">{s.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* FAQ Section */}
                    {service.faq && service.faq.length > 0 && (
                    <section className="py-20 bg-background">
                        <div className="container px-4 max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
                                <p className="text-muted-foreground">Common queries about {service.title} projects.</p>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {service.faq.map((item, i) => (
                                    <AccordionItem key={i} value={`item-${i}`} className="border-b- border-border/60">
                                        <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors">{item.question}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </section>
                    )}

                </main>
                <Footer />
                <ScrollToTop />
                
                {/* Sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-50 flex justify-center items-center gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <p className="hidden md:block text-foreground font-serif text-lg">Ready to start your project?</p>
                    <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/20 w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                        <Link to="/contact-us">Consult with us <ArrowRight className="ml-2 w-5 h-5" /></Link>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ServiceDetailPage;
