import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@/config/site-content";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image } from "@/components/ui/image";

const ServiceCategoryPage = () => {
    const { category: categorySlug } = useParams();
    const category = serviceCategories.find((c) => c.slug === categorySlug);

    const { data: services, isLoading } = useQuery({
        queryKey: ["services"],
        queryFn: api.getServices,
    });

    if (!category) {
        return <NotFound />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Filter services for this category
    // Matches service.category_id (db) with category.id (static)
    const categoryServices = (services || []).filter((s) => s.category_id === category.id);
    const categoryHeroImage = categoryServices.find((service) => service.hero_image)?.hero_image;


    return (
        <>
            <Helmet>
                <title>{`${category.title} services | Cross Angle Interior`}</title>
                <meta name="description" content={category.description} />
            </Helmet>

            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />

                <main className="flex-grow">
                    {/* Hero Section */}
                    <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={categoryHeroImage}
                                alt={category.title}
                                className="h-full w-full"
                                width={1600}
                                height={900}
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-black/50" />
                        </div>
                        <div className="relative z-10 text-center text-white px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{category.title}</h1>
                                <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">{category.description}</p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Services List */}
                    <section className="py-20">
                        <div className="container px-4">
                            <div className="grid grid-cols-1 gap-12">
                                {categoryServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                                    >
                                        <div className={`aspect-video rounded-2xl overflow-hidden ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                            <Image
                                                src={service.hero_image}
                                                alt={service.title}
                                                className="h-full w-full"
                                                imageClassName="transition-transform duration-500 group-hover:scale-105"
                                                width={900}
                                                height={506}
                                            />
                                        </div>
                                        <div className={`${index % 2 === 1 ? 'md:order-1 md:text-right' : ''}`}>
                                            <h2 className="font-serif text-3xl mb-4 text-primary">{service.title}</h2>
                                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                                {service.description}
                                            </p>
                                            <ul className={`space-y-2 mb-8 ${index % 2 === 1 ? 'flex flex-col items-end' : ''}`}>
                                                {(service.features || []).slice(0, 3).map((f, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm font-medium">
                                                        <Check className="w-4 h-4 text-primary" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button asChild size="lg" className="rounded-full px-8">
                                                <Link to={`/services/${category.slug}/${service.slug}`}>
                                                    Explore {service.title} <ArrowRight className="ml-2 w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="py-20 bg-accent/10">
                        <div className="container text-center">
                            <h2 className="font-serif text-3xl mb-4">Not finding what you're looking for?</h2>
                            <p className="text-muted-foreground mb-8">We also offer custom design solutions tailored to your unique needs.</p>
                            <Button variant="outline" size="lg" asChild>
                                <Link to="/contact-us">Contact Our Design Team</Link>
                            </Button>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default ServiceCategoryPage;
