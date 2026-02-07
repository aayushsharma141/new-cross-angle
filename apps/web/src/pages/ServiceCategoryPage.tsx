import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { serviceCategories, services } from "@/config/site-content";
import NotFound from "./NotFound";
import { motion } from "framer-motion";

const ServiceCategoryPage = () => {
    const { category: categorySlug } = useParams();
    const category = serviceCategories.find((c) => c.slug === categorySlug);

    if (!category) {
        return <NotFound />;
    }

    const categoryServices = services.filter((s) => s.categoryId === category.id);

    return (
        <>
            <Helmet>
                <title>{`${category.title} services | Cross Angle Interior`}</title>
                <meta name="description" content={category.description} />
            </Helmet>

            <div className="min-h-screen bg-background">
                <Navbar />

                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={category.heroImage}
                            alt={category.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>
                    <div className="container relative z-10 px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6 border border-white/20">
                                <category.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">{category.title}</h1>
                            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                                {category.description}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Sub-Services Grid */}
                <section className="py-20 bg-background">
                    <div className="container px-4">
                        <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">Our Expertise</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categoryServices.map((service, idx) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={service.heroImage}
                                            alt={service.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-serif text-2xl mb-3">{service.title}</h3>
                                        <p className="text-muted-foreground mb-6 line-clamp-2">{service.description}</p>
                                        <ul className="mb-6 space-y-2">
                                            {service.features.slice(0, 3).map((feature, i) => (
                                                <li key={i} className="flex items-center text-sm text-muted-foreground">
                                                    <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Link to={`/services/${category.slug}/${service.slug}`}>
                                                View Details <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-accent/5">
                    <div className="container px-4 text-center">
                        <h2 className="font-serif text-3xl md:text-4xl mb-6">Ready to transform your space?</h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                            Book a free consultation with our {category.title} experts today.
                        </p>
                        <Button size="lg" variant="gold" asChild>
                            <Link to="/contact-us">Get Started</Link>
                        </Button>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default ServiceCategoryPage;
