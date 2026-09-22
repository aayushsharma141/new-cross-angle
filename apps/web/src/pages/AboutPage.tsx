import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { FounderFilmCard } from "@/components/about/FounderFilmCard";
import AboutValues from "@/components/about/AboutValues";
import AboutStats from "@/components/about/AboutStats";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutCTA from "@/components/about/AboutCTA";
import AboutTeam from "@/components/about/AboutTeam";
import { Section, Split, NumberedList, Em, textLinkClass } from "@/components/editorial";
import { PageHero } from "@/components/motion/PageHero";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";

const workingStandards = [
  {
    title: "Detailed planning",
    description: "We finalise drawings and materials early so the actual building process is smooth and stress-free.",
  },
  {
    title: "End-to-end service",
    description: "Design, supervision, and final setup are all managed by our team in one seamless process.",
  },
  {
    title: "Quality guaranteed",
    description: "We make sure the final result matches exactly what was promised, with no compromises on quality.",
  },
  {
    title: "Local expertise",
    description: "Our work reflects the true needs and aspirations of homes and businesses across the region.",
  },
];

/**
 * About — cinematic hero over an editorial body.
 *
 * Hero → studio statement (with the founder film as its one image) →
 * principles → numbers → journey → how we work → team → closing.
 * One idea and one visual per section; see `components/editorial`.
 */
const AboutPage = () => {
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
      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        <PageHero
          size="sm"
          cursorAura
          kicker="About the studio"
          lines={[
            "We design. We execute.",
            <span key="l2">We deliver <span className="italic font-light text-[#C9A85C]">turnkey</span> interiors.</span>,
          ]}
          lede={
            <>
              <p>
                For over fifteen years we've delivered fully managed interior projects — design intelligence, execution
                precision, and hospitality-level detailing from concept to final handover.
              </p>
              <p className="mt-4 font-display italic text-[1.15rem] md:text-[1.35rem] leading-snug text-[#C9A85C]/90">
                Every project is delivered as a complete, ready-to-live environment.
              </p>
            </>
          }
          image={{ entity: "about-us", fallback: "/modern_interior_base.png", alt: "" }}
          actions={
            <Link to="/portfolio" className={textLinkClass}>
              View our work <span aria-hidden="true">→</span>
            </Link>
          }
        />

        {/* The studio — statement beside the founder film */}
        <Section>
          <Split
            eyebrow="Studio profile"
            heading={<>Interiors that feel <Em>luxurious</Em>, effortless, and deeply personal.</>}
            body="Cross Angle Interior brings together great design, technical expertise, and full-service execution to create spaces you will love living in — whether it's the warmth of oak or the cool elegance of marble, every room looks stunning and works perfectly."
            media={<FounderFilmCard videoUrl={videoUrl} />}
          />
        </Section>

        <AboutValues />
        <AboutStats />
        <AboutTimeline />

        {/* How we work */}
        <Section rule>
          <Split
            align="start"
            mediaSide="left"
            eyebrow="How we work"
            heading={<>A seamless journey from idea to <Em>final reveal.</Em></>}
            body="Great results come from a smooth process. We keep you involved in the decisions that matter while we handle the coordination behind the scenes."
            media={<NumberedList items={workingStandards} />}
          >
            <Link to="/our-process" className={textLinkClass}>
              See the full process <span aria-hidden="true">→</span>
            </Link>
          </Split>
        </Section>

        <AboutTeam />
        <AboutCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default AboutPage;
