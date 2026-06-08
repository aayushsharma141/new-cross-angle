import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServicesProcess from "@/components/services/ServicesProcess";
import OurApproach from "@/components/services/OurApproach";
import { motion } from "framer-motion";

const OurProcessPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Process | Cross Angle Interior</title>
        <meta name="description" content="Discover our turnkey execution process from discovery and planning to material selection and final delivery. We design and deliver complete environments." />
      </Helmet>
      
      <Navbar />

      <main className="bg-[#020202] min-h-screen pt-32 md:pt-40">
        <div className="max-w-[1400px] mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-site-crimson" />
              How We Work
            </span>
            <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[1.05] tracking-tight text-white mb-8">
              A Framework for <em className="italic font-medium text-site-crimson">Excellence</em>.
            </h1>
            <p className="text-[1.1rem] text-white/60 font-light leading-relaxed">
              We approach every project with rigorous planning, intentional design, and flawless execution. Our methodology ensures transparency, predictable timelines, and an end result that exceeds expectations.
            </p>
          </motion.div>
        </div>

        <OurApproach />
        <ServicesProcess />
      </main>

      <Footer />
    </>
  );
};

export default OurProcessPage;
