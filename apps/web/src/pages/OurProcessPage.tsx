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

/**
 * Our Process — the five stages, once.
 *
 * Hero → studio metrics → the five stages in full → FAQ. The footer carries
 * the page-aware closing CTA.
 */
const OurProcessPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Process | Cross Angle Interior</title>
        <meta name="description" content="A contractually-guaranteed 5-stage turnkey interior design process. From consultation to handover — see timelines, budgets, and what you can expect at every stage." />
        <meta property="og:title" content="Our Process | Cross Angle Interior" />
        <meta property="og:description" content="A contractually-guaranteed 5-stage turnkey interior design process. From consultation to handover — see timelines, budgets, and what you can expect at every stage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crossangleinterior.com/our-process" />
        <link rel="canonical" href="https://crossangleinterior.com/our-process" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        <PageHero
          kicker="How we work"
          lines={["From your first idea", <span key="l2" className="italic font-light text-[#C9A85C]">to your finished space</span>]}
          lede="A contractually-guaranteed 5-stage system that eliminates guesswork, protects your budget, and delivers on time. No ambiguity from the first brief to the final handover."
          image={{ entity: "our-process", fallback: "/blueprint_shell.jpg", alt: "" }}
          actions={
            <>
              <Link to="/contact-us" className={textLinkClass}>
                Book a free consultation <span aria-hidden="true">→</span>
              </Link>
              <a href="#process" className={textLinkClass}>
                Explore the 5 stages <span aria-hidden="true">↓</span>
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
