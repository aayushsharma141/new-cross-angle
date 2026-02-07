import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { services, serviceCategories } from "@/config/site-content";
import NotFound from "./NotFound";
import { motion } from "framer-motion";

const ServiceDetailPage = () => {
    const { category: categorySlug, service: serviceSlug } = useParams();

    const service = services.find((s) => s.slug === serviceSlug);
    const category = serviceCategories.find((c) => c.slug === categorySlug);

    if (!service || !category || service.categoryId !== category.id) {
        return <NotFound />;
    }

    return (
        <>
            <Helmet>
                <title>{`${service.title} - ${category.title} | Cross Angle Interior`}</title>
                <meta name="description" content={service.description} />
            </Helmet>

            <div className="min-h-screen bg-background">
                <Navbar />

                {/* Breadcrumb-ish Header */}
                <div className="bg-accent/5 py-3 border-b border-border/50 mt-16">
                    <div className="container px-4 flex items-center text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-foreground">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link to="/services" className="hover:text-foreground">Services</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link to={`/services/${category.slug}`} className="hover:text-foreground">{category.title}</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-primary font-medium">{service.title}</span>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="relative py-16 md:py-24">
                    <div className="container px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">{service.title}</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                                {service.description}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" variant="gold" asChild>
                                    <Link to="/contact-us">Get a Quote</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link to={`/gallery?category=${service.slug}`}>View Projects</Link>
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <img src={service.heroImage} alt={service.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </motion.div>
                    </div>
                </section>

                {/* Features & Process */}
                <section className="py-20 bg-accent/5">
                    <div className="container px-4 max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Features */}
                            <div>
                                <h3 className="font-serif text-3xl mb-8">Why Choose This Service?</h3>
                                <div className="space-y-6">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg">{feature}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Process */}
                            <div>
                                <h3 className="font-serif text-3xl mb-8">Our Process</h3>
                                <div className="space-y-0 relative pl-8 border-l border-border/50">
                                    {service.processSteps.map((step, i) => (
                                        <div key={i} className="mb-10 last:mb-0 relative">
                                            <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <h4 className="font-serif text-xl mb-2">{step.title}</h4>
                                            <p className="text-muted-foreground">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-background">
                    <div className="container px-4 max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="font-serif text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground">Common queries about {service.title} projects.</p>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            {service.faq.map((item, i) => (
                                <AccordionItem key={i} value={`item-${i}`}>
                                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
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
                    <div className="container px-4 text-center relative z-10">
                        <h2 className="font-serif text-3xl md:text-5xl mb-6">Let's Discuss Your {service.title}</h2>
                        <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                            Schedule a free consultation to get a precise estimate and timeline for your project.
                        </p>
                        <Button size="lg" variant="secondary" className="font-semibold" asChild>
                            <Link to="/contact-us">
                                Book Free Consultation <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default ServiceDetailPage;
