import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OurApproach from "@/components/services/OurApproach";
import StageDetailPanel from "@/components/process/StageDetailPanel";
import TrustStrip from "@/components/process/TrustStrip";
import TimelineGantt from "@/components/process/TimelineGantt";
import ProcessCaseStudy from "@/components/process/ProcessCaseStudy";
import ProcessFAQ from "@/components/process/ProcessFAQ";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ProcessCTA from "@/components/process/ProcessCTA";
import { PageHero } from "@/components/motion/PageHero";
import { ProcessChapter } from "@/components/home/ProcessChapter";

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

      <main id="main-content" className="bg-[#020202] min-h-screen">
        <PageHero
          kicker="How We Work"
          lines={["From Your First Idea", <span key="l2" className="italic font-light text-[#C9A85C]">to Your Finished Space</span>]}
          lede="A contractually-guaranteed 5-stage system that eliminates guesswork, protects your budget, and delivers on time. No ambiguity from the first brief to the final handover."
          image={{ entity: "our-process", fallback: "/blueprint_shell.jpg", alt: "" }}
          actions={
            <>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 bg-white text-black px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-stone-200 transition-all"
              >
                Book Free Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#process"
                className="group inline-flex items-center gap-3 border border-white/20 text-white px-7 py-3.5 rounded-full text-sm font-light tracking-wide hover:bg-white/5 transition-all"
              >
                Explore the 5 Stages
              </a>
            </>
          }
        />

        {/* Cinematic overview of the five stages (pinned, scroll-driven) */}
        <ProcessChapter kicker="The Journey" />

        <TrustStrip />
        <OurApproach />
        <div id="process">
          <StageDetailPanel />
        </div>
        <TimelineGantt />
        <ProcessCaseStudy />
        <ProcessFAQ />
        <ProcessCTA />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default OurProcessPage;
