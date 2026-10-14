import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import TrustStrip from "@/components/process/TrustStrip";
import ProcessStages from "@/components/process/ProcessStages";
import ProcessFAQ from "@/components/process/ProcessFAQ";
import { PageHero } from "@/components/motion/PageHero";
import { textLinkClass } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/**
 * Our Process — the five stages, once.
 *
 * Hero → studio metrics → the five stages in full → FAQ. The footer carries
 * the page-aware closing CTA.
 */
const OurProcessPage = () => {
  const seo = useSiteContent("process.seo");
  const hero = useSiteContent("process.hero");
  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.ogTitle || seo.title} />
        <meta property="og:description" content={seo.ogDescription || seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crossangleinterior.com/our-process" />
        <link rel="canonical" href="https://crossangleinterior.com/our-process" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        <PageHero
          kicker={hero.kicker}
          lines={[hero.lineLead, ...(hero.lineEmphasis ? [<span key="l2" className="italic font-light text-[#C9A85C]">{hero.lineEmphasis}</span>] : [])]}
          lede={hero.lede}
          image={{ entity: "our-process", fallback: "/blueprint_shell.jpg", alt: "" }}
          actions={
            <>
              <Link to="/contact-us" className={textLinkClass}>
                {hero.primaryLabel} <span aria-hidden="true">→</span>
              </Link>
              <a href="#process" className={textLinkClass}>
                {hero.anchorLabel} <span aria-hidden="true">↓</span>
              </a>
            </>
          }
        />

        <TrustStrip />
        <ProcessStages />
        <ProcessFAQ />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default OurProcessPage;
