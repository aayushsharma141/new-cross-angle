import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import ScrollToTop from "@/components/ScrollToTop";
import ContactHero from "@/components/contact/ContactHero";
import CTAContact from "@/components/CTAContact";

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
      <main className="min-h-screen relative z-10 bg-background">
        <ContactHero />
        <CTAContact />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ContactPage;
