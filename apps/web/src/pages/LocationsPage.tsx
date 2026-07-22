import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Building, Home, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { LOCATION_DATA } from "@/addons/calculators/components/data/pricing-config";
import type { CityTier } from "@/addons/calculators/components/data/types";

function slugify(name: string) {
    return (name || "").toLowerCase().replace(/\s+/g, "-");
}

interface CityEntry {
    name: string;
    slug: string;
    tier: CityTier;
}

interface StateGroup {
    state: string;
    cities: CityEntry[];
}

const seen = new Set<string>();

const stateGroups: StateGroup[] = Object.entries(LOCATION_DATA)
    .map(([state, cities]) => ({
        state,
        cities: Object.entries(cities)
            .filter(([name]) => {
                if (seen.has(name)) return false;
                seen.add(name);
                return true;
            })
            .map(([name, tier]) => ({
                name,
                slug: slugify(name),
                tier: tier as CityTier,
            })),
    }))
    .sort((a, b) => a.state.localeCompare(b.state));

const allCities = stateGroups.flatMap(g => g.cities);
const totalCities = allCities.length;
const totalStates = stateGroups.length;
const metroCount = allCities.filter(c => c.tier === "metro").length;

const tierConfig = {
    metro: { label: "Metro", color: "text-red-400 bg-red-400/10 border-red-400/20" },
    tier1: { label: "Tier-1", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    tier2: { label: "Tier-2", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
} as const;

const LocationsPage = () => {
    return (
        <>
            <Helmet>
                <title>Service Locations | Cross Angle Interior</title>
                <meta
                    name="description"
                    content={`Premium luxury interior design services across ${totalCities}+ cities in ${totalStates}+ states & UTs across India. Find your nearest studio.`}
                />
                <meta property="og:title" content="Service Locations | Cross Angle Interior" />
                <meta
                    property="og:description"
                    content={`Premium luxury interior design services across ${totalCities}+ cities in India.`}
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://crossangleinterior.com/locations" />
                <link rel="canonical" href="https://crossangleinterior.com/locations" />
            </Helmet>

            <SchemaMarkup
                type="BreadcrumbList"
                data={{
                    items: [
                        { name: "Home", url: "/" },
                        { name: "Locations", url: "/locations" },
                    ],
                }}
            />

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    itemListElement: allCities.map((c, i) => ({
                        "@type": "ListItem",
                        position: i + 1,
                        name: c.name,
                        url: `https://crossangleinterior.com/locations/${c.slug}`,
                    })),
                }),
            }} />

            <Navbar />

            <main id="main-content" className="bg-[#020202] min-h-screen pt-32 md:pt-48">
                {/* ── Hero ── */}
                <section className="relative overflow-hidden pb-8">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(196,30,58,0.06)_0%,transparent_60%)]" />
                        <div className="absolute top-0 left-1/3 w-px h-full bg-white/[0.03]" />
                    </div>

                    <div className="relative z-10 max-w-[1400px] mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl"
                        >
                            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-primary flex items-center gap-4 mb-6">
                                <div className="w-12 h-px bg-primary" />
                                Service Areas
                            </span>
                            <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-tight text-white mb-8">
                                Luxury Interior Design <br className="hidden sm:block" />
                                <em className="italic font-medium text-primary">Across India</em>
                            </h1>
                            <p className="text-[1.1rem] text-white/60 font-light leading-relaxed max-w-2xl mb-12">
                                From metro hubs to emerging cities — we bring premium turnkey interior solutions
                                to <strong className="text-white/80">{totalCities}+ cities</strong> across{" "}
                                <strong className="text-white/80">{totalStates}+ states &amp; union territories</strong>.
                                Each location backed by a dedicated local execution team.
                            </p>

                            <Link to="/estimate">
                                <button className="px-8 py-4 bg-primary text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-primary/90 transition-colors">
                                    Estimate Your Project
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* ── Stats Strip ── */}
                <section className="border-y border-white/5 bg-[#050505]">
                    <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Cities Served", value: totalCities, icon: MapPin },
                            { label: "States & UTs", value: totalStates, icon: Building },
                            { label: "Metro Cities", value: metroCount, icon: Home },
                            { label: "Active Projects", value: "1,200+", icon: Users },
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="text-center">
                                    <Icon className="w-5 h-5 mx-auto mb-3 text-primary/60" />
                                    <div className="text-2xl md:text-3xl font-display text-white mb-1">
                                        {typeof stat.value === "number" ? `${stat.value}+` : stat.value}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">
                                        {stat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Location Grid by State ── */}
                <section className="py-24">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                            {stateGroups.map((group) => (
                                <div key={group.state}>
                                    <h2 className="font-display text-xl text-white mb-6 flex items-center gap-3">
                                        <div className="w-1 h-6 bg-primary rounded-full" />
                                        {group.state}
                                    </h2>
                                    <ul className="space-y-3">
                                        {group.cities.map((city) => {
                                            const tier = tierConfig[city.tier];
                                            return (
                                                <li key={city.name}>
                                                    <Link
                                                        to={`/locations/${city.slug}`}
                                                        className="group flex items-center justify-between py-2 px-3 -mx-3 rounded-lg transition-all duration-200 hover:bg-white/[0.04]"
                                                    >
                                                        <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                                                            {city.name}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${tier.color} transition-colors`}
                                                        >
                                                            {tier.label}
                                                        </span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Tier Legend ── */}
                <section className="border-t border-white/5 bg-[#050505] py-16">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mr-4">
                                City Classification
                            </span>
                            {Object.entries(tierConfig).map(([key, cfg]) => (
                                <span key={key} className="flex items-center gap-2">
                                    <span className={`inline-block w-2 h-2 rounded-full ${cfg.color.split(" ")[0].replace("text-", "bg-")}`} />
                                    {cfg.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(196,30,58,0.06)_0%,transparent_60%)] pointer-events-none" />
                    <div className="relative z-10 max-w-[1400px] mx-auto px-6 text-center">
                        <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight mb-6">
                            Don&apos;t See Your City?
                        </h2>
                        <p className="text-white/60 font-light max-w-xl mx-auto mb-12">
                            We continuously expand our service network. Reach out and we&apos;ll connect you with
                            the nearest design studio or explore a remote consultation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/contact-us"
                                className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Contact Us <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/estimate"
                                className="inline-flex items-center gap-3 border border-white/20 text-white/80 px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
                            >
                                Get a Free Estimate
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
        </>
    );
};

export default LocationsPage;
