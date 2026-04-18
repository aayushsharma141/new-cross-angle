import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  BadgeCheck,
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
import AboutHero from "@/components/home/About/AboutHero";
import AboutValues from "@/components/home/About/AboutValues";
import AboutStats from "@/components/home/About/AboutStats";
import AboutTimeline from "@/components/home/About/AboutTimeline";
import AboutCTA from "@/components/home/About/AboutCTA";
import AboutVideoModal from "@/components/home/About/AboutVideoModal";
import AboutTeam from "@/components/home/About/AboutTeam";
import { AppBreadcrumb } from "@/components/layout/AppBreadcrumb";
import { TactileMaterial } from "@/components/ui/enhanced/TactileMaterial";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";

const studioHighlights = [
  "Residential interiors shaped around daily rituals, comfort, and longevity.",
  "Commercial environments designed to feel polished, intuitive, and memorable.",
  "End-to-end execution with material coordination, site supervision, and handover clarity.",
];

const signaturePillars = [
  {
    icon: Compass,
    title: "Spatial Clarity",
    description:
      "Every layout is driven by movement, proportion, and a natural sense of flow so spaces feel calm and intelligently resolved.",
  },
  {
    icon: Gem,
    title: "Material Depth",
    description:
      "We layer finishes, textures, and lighting with restraint so each room feels rich, tactile, and built to age beautifully.",
  },
  {
    icon: Sparkles,
    title: "Tailored Character",
    description:
      "Rather than repeating formulas, we shape each project around the client’s pace of life, aesthetic preferences, and ambitions.",
  },
];

const workingStandards = [
  {
    icon: Ruler,
    title: "Detail-Led Planning",
    description: "Drawings, dimensions, and selections are refined early to reduce friction during execution.",
  },
  {
    icon: LayoutGrid,
    title: "Turnkey Coordination",
    description: "Design, site follow-through, and installation are aligned through one coherent process.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Accountability",
    description: "Material intent and finish quality stay central from first concept to final styling.",
  },
  {
    icon: MapPinHouse,
    title: "Regional Insight",
    description: "Our work reflects the practical realities and aspirations of homes and businesses across Jharkhand and beyond.",
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

      <Navbar />
      <main id="main-content" className="min-h-screen relative z-10">
        <FixedSocialBar />

        {/* Immersive Hero with Video */}
        <AboutHero videoUrl={videoUrl} onPlayVideo={() => setIsVideoOpen(true)} />

        <section className="relative overflow-hidden border-y border-white/5 bg-card/30 py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(196,18,48,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_32%)]" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-10"
              >
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-primary">
                  <BadgeCheck className="h-4 w-4" />
                  Studio Profile
                </span>
                <h2 className="max-w-2xl font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
                  We shape interiors that feel elevated, effortless, and deeply personal.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  Cross Angle Interior brings together design direction, technical discipline, and turnkey delivery to create spaces that work beautifully in everyday life. Our approach balances visual identity with practical intelligence, so every room feels intentional from the first glance—whether it's the warmth of <TactileMaterial name="wood" texture="wood" /> or the cool elegance of <TactileMaterial name="marble" texture="marble" />.
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {studioHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="grid gap-6"
              >
                <div className="rounded-[2rem] border border-primary/20 bg-primary/[0.08] p-7">
                  <p className="text-xs uppercase tracking-[0.32em] text-primary/80">What defines us</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-3xl font-semibold text-foreground">Concept to Completion</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        A single design language carried through planning, execution, styling, and handover.
                      </p>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div>
                      <p className="text-3xl font-semibold text-foreground">Function with Refinement</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        Beautiful spaces are only complete when they support the way people actually live and work.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7">
                  <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Studio standards</p>
                  <div className="mt-5 space-y-3">
                    {["Clear consultations", "Curated finish selections", "Execution oversight", "Premium visual consistency"].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values with 3D Cards */}
        <AboutValues />

        {/* Stats Section with Count-up */}
        <AboutStats />

        <section className="relative overflow-hidden bg-background py-24 md:py-32">
          <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="mb-4 block text-sm font-medium uppercase tracking-[0.32em] text-primary">
                Our Design Signature
              </span>
              <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
                A premium language that stays calm, warm, and lasting.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                The best interiors feel composed rather than crowded. We build that feeling through disciplined layouts, tactile materials, and a design rhythm that supports everyday use.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {signaturePillars.map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card/40 p-8 backdrop-blur-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <pillar.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 font-serif text-2xl font-semibold text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
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

        <section className="relative overflow-hidden bg-card/40 py-24 md:py-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <span className="mb-4 block text-sm font-medium uppercase tracking-[0.32em] text-primary">
                  How We Work
                </span>
                <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
                  A smoother journey from brief to final reveal.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                  Great outcomes come from a process that feels transparent. We keep clients close to the important decisions while handling the complexity behind the scenes.
                </p>
              </motion.div>

              <div className="grid gap-4">
                {workingStandards.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="flex gap-5 rounded-[1.75rem] border border-white/10 bg-black/30 p-6 backdrop-blur-md"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.28em] text-primary/70">
                          0{index + 1}
                        </span>
                        <h3 className="font-serif text-2xl font-semibold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
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
