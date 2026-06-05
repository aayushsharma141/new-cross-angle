import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Compass,
  Gem,
  LayoutGrid,
  MapPinHouse,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutStats from "@/components/about/AboutStats";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutCTA from "@/components/about/AboutCTA";
import AboutVideoModal from "@/components/about/AboutVideoModal";
import AboutTeam from "@/components/about/AboutTeam";
import { TactileMaterial } from "@/components/ui/enhanced/TactileMaterial";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";


const studioHighlights = [
  "Custom homes built for your daily life, comfort, and lasting value.",
  "Smart office designs that improve work and impress your clients.",
  "We handle everything from start to finish, so you don't have to.",
];

const signaturePillars = [
  {
    icon: Compass,
    title: "Smart Layouts",
    description:
      "Every space is planned around how you live and move, making your home feel calm, open, and easy to use.",
  },
  {
    icon: Gem,
    title: "Premium Materials",
    description:
      "We carefully select the best finishes, textures, and lighting so every room looks rich and lasts for years.",
  },
  {
    icon: Sparkles,
    title: "Made Just For You",
    description:
      "We don't use standard formulas. Every project is uniquely designed to match your lifestyle, taste, and goals.",
  },
];

const workingStandards = [
  {
    icon: Ruler,
    title: "Detailed Planning",
    description: "We finalize drawings and materials early so the actual building process is smooth and stress-free.",
  },
  {
    icon: LayoutGrid,
    title: "End-to-End Service",
    description: "Design, supervision, and final setup are all managed by our team in one seamless process.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description: "We make sure the final result matches exactly what was promised, with no compromises on quality.",
  },
  {
    icon: MapPinHouse,
    title: "Local Expertise",
    description: "Our work reflects the true needs and aspirations of homes and businesses across the region.",
  },
];

const AboutPage = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { settings } = useSiteSettings();
  const videoUrl = settings?.about_video_url || SITE_CONSTANTS.defaultYoutubeVideoUrl;

  return (
    <>
      <Helmet>
        <title>About Us | Cross Angle Interior - Premier Interior Design Studio</title>
        <meta
          name="description"
          content="Learn about Cross Angle Interior - Jamshedpur's premier interior design studio. Over a decade of expertise transforming spaces into stunning, functional environments."
        />
        <meta property="og:title" content="About Cross Angle Interior" />
        <meta property="og:description" content="Over a decade of expertise transforming spaces into stunning, functional environments." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/about-us" />
      </Helmet>

      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "About Us", url: "/about-us" }
          ]
        }}
      />

      <SchemaMarkup
        type="Organization"
        data={{
          name: "Cross Angle Interior",
          url: "https://crossangleinterior.com/about-us",
          description: "Over a decade of expertise transforming residential and commercial spaces into stunning, functional premium environments."
        }}
      />

      <SchemaMarkup
        type="Person"
        data={{
          name: "Aayush Sharma",
          jobTitle: "Founder & Lead Architect",
          worksFor: {
            "@type": "Organization",
            name: "Cross Angle Interior"
          },
          sameAs: [
            "https://www.linkedin.com/in/aayushsharma",
            SITE_CONSTANTS.socials.instagram
          ]
        }}
      />

      <Navbar />
      <main id="main-content" className="min-h-screen relative z-10">
        <FixedSocialBar />

        {/* Immersive Hero with Video */}
        <AboutHero videoUrl={videoUrl} onPlayVideo={() => setIsVideoOpen(true)} />

        <section className="relative overflow-hidden border-y border-white/5 bg-background py-24 md:py-36">
          {/* Subtle architectural background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,43,43,0.12),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(209,175,110,0.06),transparent_40%)]" />
          
          {/* Luxury Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-serif font-bold text-white/[0.01] pointer-events-none select-none whitespace-nowrap z-0">
            CROSS ANGLE
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-[3rem] border border-white/10 bg-gradient-to-br from-black/80 to-black/40 p-10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl md:p-14 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-site-gold/10 rounded-full blur-[80px] group-hover:bg-site-gold/20 transition-colors duration-700 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-px bg-gradient-to-r from-site-crimson to-transparent" />
                    <span className="text-site-gold font-bold uppercase tracking-[0.4em] text-[10px]">Studio Profile</span>
                  </div>
                  <h2 className="font-serif font-bold text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-white">
                    We design interiors that feel <span className="text-site-gold italic font-light">luxurious</span>, <span className="text-site-crimson font-medium">effortless</span>, and deeply personal.
                  </h2>
                  <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg max-w-2xl">
                    Cross Angle Interior brings together great design, technical expertise, and full-service execution to create spaces you will love living in. We make sure every room looks stunning and works perfectly—whether it's the warmth of <TactileMaterial name="wood" texture="wood" /> or the cool elegance of <TactileMaterial name="marble" texture="marble" />.
                  </p>
                  
                  {/* Highlights Grid with architectural lines */}
                  <div className="mt-12 grid gap-6 md:grid-cols-3 relative">
                    <div className="absolute -inset-x-4 top-1/2 -translate-y-1/2 h-px bg-white/5 hidden md:block" />
                    {studioHighlights.map((item, idx) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="relative rounded-2xl border border-white/5 bg-black/40 p-6 text-sm leading-relaxed text-muted-foreground shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-500 hover:border-site-gold/30 hover:bg-white/[0.02] hover:shadow-[0_20px_40px_rgba(217,43,43,0.1)] group/item"
                      >
                        <div className="absolute top-0 left-6 w-8 h-px bg-site-gold/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                        <span className="block text-site-gold/40 font-serif text-xl font-bold mb-3 group-hover/item:text-site-crimson transition-colors duration-300">0{idx + 1}</span>
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-8"
              >
                {/* Custom glowing defines us card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-black/60 to-black/20 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all duration-700 hover:border-site-gold/30"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,120,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-site-crimson/0 group-hover:border-site-crimson/30 rounded-br-[2.5rem] transition-all duration-700 pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-2 rounded-full bg-site-gold shadow-[0_0_10px_#d1af6e] animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground group-hover:text-site-gold transition-colors duration-500">What defines us</p>
                  </div>
                  
                  <div className="space-y-8 relative z-10">
                    <div className="group/sub">
                      <p className="text-2xl font-serif font-semibold text-white group-hover/sub:text-site-gold transition-colors duration-300">Start to Finish</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover/sub:text-white/80 transition-colors duration-300">
                        A single team handles everything from your first idea to the final reveal.
                      </p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                    <div className="group/sub">
                      <p className="text-2xl font-serif font-semibold text-white group-hover/sub:text-site-gold transition-colors duration-300">Beauty meets Function</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover/sub:text-white/80 transition-colors duration-300">
                        A beautiful space is only perfect if it makes your daily life easier and more comfortable.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Studio standards card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative rounded-[2.5rem] border border-white/5 bg-black/40 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl group hover:border-site-crimson/20 transition-all duration-700"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground/60 mb-8">Studio standards</p>
                  <div className="space-y-4">
                    {["Clear consultations", "Curated finish selections", "Execution oversight", "Premium visual consistency"].map((item, idx) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        whileHover={{ x: 8 }}
                        className="flex items-center gap-5 rounded-2xl border border-transparent hover:border-white/5 bg-transparent hover:bg-white/[0.02] px-2 py-3 transition-all duration-300 group/item"
                      >
                        <span className="relative flex h-3 w-3 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-site-crimson opacity-20 group-hover/item:opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-site-crimson group-hover/item:bg-site-gold transition-colors duration-300"></span>
                        </span>
                        <span className="text-sm font-medium text-muted-foreground group-hover/item:text-white transition-colors duration-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values with 3D Cards */}
        <AboutValues />

        {/* Stats Section with Count-up */}
        <AboutStats />

        <section className="relative overflow-hidden bg-background py-28 md:py-36">
          {/* Glowing backdrops */}
          <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
          <div className="absolute left-10 bottom-10 h-64 w-64 rounded-full bg-site-gold/5 blur-[120px] pointer-events-none" />
          
          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="w-12 h-px bg-site-crimson" />
                <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">Our Design Signature</span>
              </div>
              <h2 className="font-serif font-bold text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-foreground">
                Premium designs that feel comfortable and last for years.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                The best interiors don't feel crowded or complicated. We build that feeling through smart layouts, high-quality materials, and designs that make your everyday life easier.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {signaturePillars.map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-[2.25rem] border border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.005] p-8 shadow-[0_15px_45px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-500 hover:border-site-gold/25 hover:shadow-[0_30px_70px_rgba(217,43,43,0.12)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,120,0.06),transparent_45%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,43,43,0.08),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-site-gold/20 bg-gradient-to-b from-site-gold/15 to-transparent text-site-gold shadow-[0_4px_20px_rgba(255,215,120,0.1)] group-hover:border-site-crimson/30 group-hover:from-site-crimson/20 group-hover:text-site-crimson transition-all duration-500">
                      <pillar.icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <h3 className="mt-8 font-serif text-2xl font-semibold text-foreground group-hover:text-site-gold transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    
                    {/* Expanding line divide on hover */}
                    <div className="my-4 h-px w-8 bg-site-crimson/40 transition-all duration-500 group-hover:w-full group-hover:bg-site-gold/30" />
                    
                    <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline with Scroll Animation */}
        <AboutTimeline />

        <section className="relative overflow-hidden bg-card/25 py-24 md:py-32">
          {/* Blueprint architectural grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="container relative z-10 mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65 }}
                className="flex flex-col justify-center"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-px bg-site-crimson" />
                  <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">How We Work</span>
                </div>
                <h2 className="font-serif font-bold text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-foreground">
                  A seamless journey from idea to final reveal.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Great results come from a smooth process. We keep you involved in the fun decisions while we handle all the stress and hard work behind the scenes.
                </p>
              </motion.div>

              <div className="grid gap-5">
                {workingStandards.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ x: 8, scale: 1.01 }}
                    className="group flex gap-6 rounded-[2rem] border border-white/5 bg-gradient-to-r from-black/45 via-black/25 to-transparent p-7 shadow-[0_15px_40px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-site-gold/20 hover:shadow-[0_20px_50px_rgba(255,215,120,0.06)]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-site-gold/20 bg-gradient-to-b from-site-gold/15 to-transparent text-site-gold shadow-[0_4px_15px_rgba(255,215,120,0.05)] group-hover:border-site-crimson/30 group-hover:from-site-crimson/20 group-hover:text-site-crimson transition-all duration-500">
                      <item.icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <div className="mb-2.5 flex items-center gap-3">
                        <span className="font-serif text-sm font-bold tracking-[0.2em] text-site-crimson group-hover:text-site-gold transition-colors duration-300">
                          0{index + 1}
                        </span>
                        <h3 className="font-serif text-2xl font-semibold text-foreground group-hover:text-site-gold transition-colors duration-300">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The Visionaries - Team Section */}
        <AboutTeam />

        {/* CTA Section */}
        <AboutCTA />
      </main>
      <Footer />
      <ScrollToTop />

      {/* Video Modal */}
      <AboutVideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={videoUrl}
      />
    </>
  );
};

export default AboutPage;
