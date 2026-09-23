import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import NotFound from "./NotFound";
import ServiceDomain from "@/components/services/ServiceDomain";
import { serviceCategories } from "@/config/site-content";
import { api } from "@/lib/api";
import { Container, Eyebrow, DisplayHeading, Body, textLinkClass, EASE_OUT_EXPO } from "@/components/editorial";

/**
 * One service domain on its own page — the same treatment the domain gets on
 * /services, so the two views of the same content agree.
 */
const ServiceCategoryPage = () => {
    const { category: categorySlug } = useParams();
    const category = serviceCategories.find((c) => c.slug === categorySlug);

    const { data: services, isLoading, isError, refetch } = useQuery({
        queryKey: ["services"],
        queryFn: api.getServices,
    });

    if (!category) {
        return <NotFound />;
    }

    if (isError) {
        return (
            <>
                <Navbar />
                <main className="flex min-h-screen items-center justify-center bg-[var(--s-canvas-primary)] px-6 text-white">
                    <div className="max-w-md text-center">
                        <DisplayHeading as="h1" size="md" className="mb-6">Failed to load services.</DisplayHeading>
                        <Body className="mb-8">There was a network error loading this page. Please try again.</Body>
                        <button type="button" onClick={() => refetch()} className={textLinkClass}>
                            Retry connection <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Matches service.category_id (db) with category.id (static)
    const categoryServices = (services || []).filter((s) => s.category_id === category.id);

    return (
        <>
            <Helmet>
                <title>{`${category.title} services | Cross Angle Interior`}</title>
                <meta name="description" content={category.description} />
                <meta property="og:title" content={`${category.title} services | Cross Angle Interior`} />
                <meta property="og:description" content={category.description} />
                <link rel="canonical" href={`https://crossangleinterior.com/services/${category.slug}`} />
            </Helmet>

            <Navbar />

            <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
                <Container className="pt-36 pb-4 md:pt-48 md:pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                        className="max-w-3xl"
                    >
                        <Eyebrow className="mb-8">Services</Eyebrow>
                        <DisplayHeading as="h1" size="lg" className="mb-6">{category.title}</DisplayHeading>
                        <Body className="max-w-xl">{category.description}</Body>
                    </motion.div>
                </Container>

                <ServiceDomain
                    id="services"
                    rule={false}
                    eyebrow={`${categoryServices.length} ${categoryServices.length === 1 ? "service" : "services"}`}
                    heading={<>What we deliver in {category.title.toLowerCase()}.</>}
                    body={`Every engagement below runs turn-key — one team, one contract, from first drawing to final handover.`}
                    services={categoryServices}
                    isLoading={isLoading}
                />
            </main>

            <Footer />
            <ScrollToTop />
        </>
    );
};

export default ServiceCategoryPage;
