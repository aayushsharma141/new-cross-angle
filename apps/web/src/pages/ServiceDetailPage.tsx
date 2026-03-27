import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, ChevronRight, Loader2, Sparkles, MoveRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { serviceCategories, services } from "@/config/site-content";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const ServiceDetailPage = () => {
    const { category: categorySlug, service: serviceSlug } = useParams();

    // In a real app, this would be an API call. For now we filter locally to get "related" details.
    const { data: service, isLoading } = useQuery({
        queryKey: ["service", serviceSlug],
        queryFn: async () => {
            // Simulate API delay if needed, or just return from constant
            return services.find(s => s.slug === serviceSlug) || null;
        },
        enabled: !!serviceSlug,
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
    const relatedServicesData = (service.relatedServices || [])
        .map(id => services.find(s => s.id === id))
        .filter(Boolean);

    return (
        <>
            <Helmet>
                <title>{`${service.title} - ${category.title} | Cross Angle Interior`}</title>
                <meta name="description" content={service.description} />
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

                <main className="flex-grow">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="bg-accent/5 py-3 border-b border-border/50 mt-16">
                        <div className="container px-4 flex items-center text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
                            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                            <Link to="/services" className="hover:text-foreground transition-colors">Services</Link>
                            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                            <Link to={`/services/${category.slug}`} className="hover:text-foreground transition-colors">{category.title}</Link>
                            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                            <span className="text-primary font-medium">{service.title}</span>
                        </div>
                    </nav>

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
                                        <Link to="/estimate">Calculate Cost</Link>
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
                                    <img src={service.heroImage} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Rich Content / Long Description */}
                    {service.longDescription && (
                        <section className="py-16 border-t border-border/50">
                            <div className="container px-4 max-w-4xl mx-auto prose prose-lg prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground md:prose-xl">
                                <ReactMarkdown>{service.longDescription}</ReactMarkdown>
                            </div>
                        </section>
                    )}

                    {/* Gallery Carousel (New) */}
                    {service.galleryImages && service.galleryImages.length > 0 && (
                        <section className="py-20 bg-muted/30">
                            <div className="container px-4">
                                <div className="text-center mb-12">
                                    <h2 className="font-serif text-3xl md:text-4xl mb-3">Project Gallery</h2>
                                    <p className="text-muted-foreground">Recent executions of {service.title}</p>
                                </div>
                                <Carousel className="w-full max-w-5xl mx-auto">
                                    <CarouselContent>
                                        {service.galleryImages.map((img, idx) => (
                                            <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                                <div className="p-1">
                                                    <Card className="border-0 shadow-lg overflow-hidden">
                                                        <CardContent className="flex aspect-[3/4] items-center justify-center p-0 relative group">
                                                            <img
                                                                src={img}
                                                                alt={`Gallery ${idx + 1}`}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm" />
                                    <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm" />
                                </Carousel>
                                <div className="text-center mt-10">
                                    <Button variant="link" className="text-primary text-lg" asChild>
                                        <Link to={`/gallery?category=${service.slug}`}>View All Projects <MoveRight className="ml-2 w-4 h-4" /></Link>
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Features & Process */}
                    <section className="py-20 bg-background">
                        <div className="container px-4 max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {/* Features */}
                                <div>
                                    <h3 className="font-serif text-3xl mb-8 flex items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        Why Choose This Service?
                                    </h3>
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
                                    <h3 className="font-serif text-3xl mb-8">Our Process</h3>
                                    <div className="space-y-0 relative pl-8 border-l-2 border-primary/20">
                                        {(service.processSteps || []).map((step, i) => (
                                            <div key={i} className="mb-10 last:mb-0 relative">
                                                <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-background border-4 border-primary flex items-center justify-center top-1">
                                                </div>
                                                <h4 className="font-serif text-xl mb-2 font-semibold text-foreground">{step.title}</h4>
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
                                        <Link key={s.id} to={`/services/${s?.categoryId as string}/${s?.slug}`} className="group aspect-video relative overflow-hidden rounded-xl shadow-md block">
                                            <img src={s?.heroImage} alt={s?.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <h3 className="text-white text-xl font-bold font-serif">{s?.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* FAQ Section */}
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

                    {/* Final CTA */}
                    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-wine opacity-90"></div>
                        <div className="container px-4 text-center relative z-10">
                            <h2 className="font-serif text-3xl md:text-5xl mb-6 font-bold">Ready to transform your {service.title}?</h2>
                            <p className="text-primary-foreground/90 text-xl mb-10 max-w-2xl mx-auto font-light">
                                Schedule a free consultation to get a precise estimate and timeline for your project.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" variant="secondary" className="font-bold text-primary text-lg h-14 px-8" asChild>
                                    <Link to="/contact-us">
                                        Book Free Consultation <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg h-14 px-8 bg-transparent" asChild>
                                    <Link to="/style-quiz">
                                        Discover Your Aesthetic
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default ServiceDetailPage;
