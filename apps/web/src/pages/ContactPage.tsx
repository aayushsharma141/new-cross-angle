import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import ScrollToTop from "@/components/ScrollToTop";
import ContactHero from "@/components/contact/ContactHero";
import CTAContact from "@/components/CTAContact";
import ContactFAQ from "@/components/contact/ContactFAQ";
import SocialBar from "@/components/contact/SocialBar";

// Lazy load the Mapbox component to save bundle size
const InteractiveMap = lazy(() => import("@/components/contact/InteractiveMap"));

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | Cross Angle Interior - Get A Quote</title>
        <meta
          name="description"
          content="Contact Cross Angle Interior for your interior design needs. Get a free quote and consultation for residential and commercial projects in Jamshedpur."
        />
        <meta property="og:title" content="Contact Cross Angle Interior" />
        <meta property="og:description" content="Get a free quote and consultation for residential and commercial projects." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/contact-us" />
      </Helmet>
      <FixedSocialBar />
      <Navbar />
      <main className="home-shell min-h-screen relative overflow-hidden bg-[var(--site-bg)]">
        <div className="home-noise pointer-events-none absolute inset-0 z-0" />
        <div className="home-content relative z-10">
          <ContactHero />

          <CTAContact />

          <Suspense
            fallback={
              <div className="px-4 pb-20 md:pb-28">
                <div className="container mx-auto max-w-7xl">
                  <div className="home-panel h-[400px] md:h-[500px] animate-pulse rounded-[30px]" />
                </div>
              </div>
            }
          >
            <InteractiveMap latitude={22.8027} longitude={86.2047} zoom={13} />
          </Suspense>

          <ContactFAQ />

          <SocialBar />
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ContactPage;
