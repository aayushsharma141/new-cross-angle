import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import ScrollToTop from "@/components/layout/ScrollToTop";
import {
    Section, Container, Eyebrow, DisplayHeading, Body, Em, StatStrip, Closing,
    reveal, pillCtaClass, PillCtaInner, textLinkClass, EASE_OUT_EXPO,
} from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/**
 * Every service area on one page.
 *
 * Each area is an anchor (`/locations#bistupur`), and `/locations/:slug`
 * redirects here — see `config/service-area.ts` for why the per-city pages
 * were consolidated.
 */
const LocationsPage = () => {
    const seo = useSiteContent("locations.seo");
    const hero = useSiteContent("locations.hero");
    const stats = useSiteContent("locations.stats");
    const { bands } = useSiteContent("locations.areas");
    const closing = useSiteContent("locations.closing");
    const areas = bands.flatMap((band) => band.areas);
    const totalAreas = areas.length;
    const fill = (text: string) => text.replace(/\{areas\}/g, String(totalAreas));
    return (
        <>
            <Helmet>
                <title>{seo.title}</title>
                <meta name="description" content={fill(seo.description)} />
                <meta property="og:title" content={seo.ogTitle || seo.title} />
                <meta property="og:description" content={fill(seo.ogDescription || seo.description)} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://crossangleinterior.com/locations" />
                <link rel="canonical" href="https://crossangleinterior.com/locations" />
            </Helmet>

            <SchemaMarkup
                type="BreadcrumbList"
                data={{
                    items: [
                        { name: "Home", url: "/" },
                        { name: "Service Areas", url: "/locations" },
                    ],
                }}
            />

            <Navbar />

            <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
                {/* Statement */}
                <Container className="pt-36 pb-12 md:pt-48 md:pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                        className="max-w-3xl"
                    >
                        <Eyebrow className="mb-8">{hero.eyebrow}</Eyebrow>
                        <DisplayHeading as="h1" size="lg" className="mb-6">
                            {hero.headingLead} <Em>{hero.headingEmphasis}</Em>
                        </DisplayHeading>
                        <Body className="max-w-xl">{hero.intro}</Body>
                        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                            <Link to="/estimate" className={pillCtaClass}>
                                <PillCtaInner>{hero.primaryLabel}</PillCtaInner>
                            </Link>
                            <Link to="/contact-us" className={textLinkClass}>
                                {hero.secondaryLabel} <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </motion.div>
                </Container>

                <StatStrip
                    stats={[
                        { label: "Home city", value: stats.homeCity },
                        { label: "Areas served", value: totalAreas },
                        { label: "States", value: stats.states },
                        { label: "Projects delivered", value: stats.projectsDelivered },
                    ]}
                />

                {/* Jump list — the compact index for a long page */}
                <Container className="pt-14 md:pt-20">
                    <motion.nav {...reveal()} aria-label="Jump to an area" className="border-t border-white/10 pt-8">
                        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Jump to</p>
                        <ul className="flex flex-wrap gap-x-6 gap-y-3">
                            {areas.map((area) => (
                                <li key={area.slug}>
                                    <a
                                        href={`#${area.slug}`}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                                    >
                                        {area.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.nav>
                </Container>

                {/* Areas, grouped by how far out they sit */}
                {bands.map((band, bandIndex) => (
                    <Section key={band.id} spacing="tight">
                        <motion.div {...reveal()} className="mb-10 grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 pt-8">
                            <span className="pt-1.5 text-[10px] font-bold tracking-[0.2em] text-primary">
                                {String(bandIndex + 1).padStart(2, "0")}
                            </span>
                            <div>
                                <h2 className="mb-2 font-display text-2xl text-white md:text-[1.75rem]">{band.label}</h2>
                                <Body className="max-w-xl text-sm md:text-[15px]">{band.note}</Body>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-x-12 gap-y-0 md:grid-cols-2">
                            {band.areas.map((area, i) => (
                                <motion.article
                                    key={area.slug}
                                    id={area.slug}
                                    {...reveal(Math.min(i, 5) * 0.04)}
                                    className="scroll-mt-28 border-t border-white/5 py-8"
                                >
                                    <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                        <h3 className="font-display text-xl text-white md:text-2xl">{area.name}</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                            {area.context}
                                        </span>
                                    </div>
                                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                                        {area.focus}
                                    </p>
                                    <Body className="max-w-prose text-sm md:text-[15px]">{area.copy}</Body>
                                </motion.article>
                            ))}
                        </div>
                    </Section>
                ))}

                <Closing
                    eyebrow={closing.eyebrow}
                    heading={<>{closing.headingLead} <Em>{closing.headingEmphasis}</Em></>}
                    body={closing.body}
                >
                    <Link to="/contact-us" className={pillCtaClass}>
                        <PillCtaInner>{closing.primaryLabel}</PillCtaInner>
                    </Link>
                    <Link to="/estimate" className={textLinkClass}>
                        {closing.secondaryLabel} <span aria-hidden="true">&rarr;</span>
                    </Link>
                </Closing>
            </main>

            <Footer />
            <ScrollToTop />
        </>
    );
};

export default LocationsPage;
