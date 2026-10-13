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
import { useSiteContent } from "@/content/useSiteContent";

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
  const founder = useSiteContent("about.founder");
  const seo = useSiteContent("about.seo");
  const hero = useSiteContent("about.hero");
  const studio = useSiteContent("about.studio");
  const standards = useSiteContent("about.standards");

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.ogTitle || seo.title} />
        <meta property="og:description" content={seo.ogDescription || seo.description} />
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
          name: founder.name,
          jobTitle: founder.jobTitle,
          worksFor: {
            "@type": "Organization",
            name: "Cross Angle Interior"
          },
          sameAs: [
            ...(founder.linkedinUrl ? [founder.linkedinUrl] : []),
            SITE_CONSTANTS.socials.instagram
          ]
        }}
      />

      <Navbar />
      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        <PageHero
          size="sm"
          cursorAura
          kicker={hero.kicker}
          lines={[
            hero.lineOne,
            <span key="l2">{hero.lineTwoLead} <span className="italic font-light text-[#C9A85C]">{hero.lineTwoEmphasis}</span> {hero.lineTwoTail}</span>,
          ]}
          lede={
            <>
              <p>{hero.lede}</p>
              {hero.ledeAccent && (
                <p className="mt-4 font-display italic text-[1.15rem] md:text-[1.35rem] leading-snug text-[#C9A85C]/90">
                  {hero.ledeAccent}
                </p>
              )}
            </>
          }
          image={{ entity: "about-us", fallback: "/modern_interior_base.png", alt: "" }}
          actions={
            <Link to="/portfolio" className={textLinkClass}>
              {hero.linkLabel} <span aria-hidden="true">→</span>
            </Link>
          }
        />

        {/* The studio — statement beside the founder film */}
        <Section>
          <Split
            eyebrow={studio.eyebrow}
            heading={<>{studio.headingLead} <Em>{studio.headingEmphasis}</Em>{studio.headingTail}</>}
            body={studio.body}
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
            eyebrow={standards.eyebrow}
            heading={<>{standards.headingLead} <Em>{standards.headingEmphasis}</Em></>}
            body={standards.body}
            media={<NumberedList items={standards.items} />}
          >
            <Link to="/our-process" className={textLinkClass}>
              {standards.linkLabel} <span aria-hidden="true">→</span>
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
