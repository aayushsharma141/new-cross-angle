import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import CTAContact from "@/components/shared/CTAContact";
import ContactFAQ from "@/components/contact/ContactFAQ";
import SocialBar from "@/components/contact/SocialBar";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import { ShaderBackground } from "@/components/ui/backgrounds/ShaderBackground";
import { SITE_CONSTANTS } from "@/lib/constants";

// Lazy load the map component to save bundle size
const InteractiveMap = lazy(() => import("@/components/contact/InteractiveMap"));

const ContactPage = () => {
  return (
    <>
      <h1 className="sr-only">Contact Us | Cross Angle Interior - Get A Quote</h1>
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

      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Contact Us", url: "/contact-us" }
          ]
        }}
      />

      <SchemaMarkup
        type="InteriorDesigner"
        data={{
          name: "Cross Angle Interior",
          telephone: SITE_CONSTANTS.defaultPhone,
          email: SITE_CONSTANTS.defaultEmail,
          url: "https://crossangleinterior.com/contact-us"
        }}
      />

            <Navbar />

      <main id="main-content" className="min-h-screen relative overflow-hidden bg-[#050505]">
        <ShaderBackground />
        <div className="relative z-10 pointer-events-none">
          <div className="pointer-events-auto">
          

          {/* Primary contact section — form + bypass + contact info */}
          <CTAContact />

          {/* Compact map strip */}
          <Suspense
            fallback={
              <div className="px-4 pb-16 md:pb-20">
                <div className="container mx-auto max-w-7xl">
                  <div className="home-panel skeleton-shimmer rounded-[24px]" style={{ height: "clamp(280px, 38vw, 440px)" }} />
                </div>
              </div>
            }
          >
            <InteractiveMap latitude={22.8027} longitude={86.2047} zoom={13} />
          </Suspense>

          {/* FAQ */}
          <ContactFAQ />

          {/* Social pill strip */}
          <SocialBar />

          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ContactPage;
