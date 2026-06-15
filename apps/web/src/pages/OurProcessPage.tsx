import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
        {/* ── Hero ── */}
        <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(196,30,58,0.08)_0%,transparent_60%)]" />
            <div className="absolute top-0 left-1/3 w-px h-full bg-white/[0.03]" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-white/[0.03]" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full pt-40 md:pt-48 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-site-crimson" />
                How We Work
              </span>
              <h1 className="font-display text-[clamp(2.8rem,8vw,6rem)] leading-[1.05] tracking-tight text-white mb-6">
                From Your First Idea <br className="hidden sm:block" />
                <span className="italic font-medium text-site-crimson">to Your Finished Space</span>
              </h1>
              <p className="text-[1.1rem] text-white/60 font-light leading-relaxed max-w-2xl mb-12">
                A contractually-guaranteed 5-stage system that eliminates guesswork, protects your budget, 
                and delivers on time. No ambiguity from the first brief to the final handover.
              </p>
              <div className="flex flex-wrap gap-4">
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
              </div>
            </motion.div>
          </div>
        </section>

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
