import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import FloatingParticles from "@/components/FloatingParticles";
import ScrollToTop from "@/components/ScrollToTop";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";

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
      <FloatingParticles count={25} />
      <main className="min-h-screen relative z-10 bg-background">
        <FixedSocialBar />
        <Navbar />

        <ContactHero />

        {/* Contact Form Section */}
        <section className="pb-24 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-wine-500/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-wine-500/5 rounded-full blur-3xl -z-10" />

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Form Section */}
              <ContactForm />

              {/* Info Section - Sticky on Desktop */}
              <div className="lg:sticky lg:top-24 space-y-8">
                <div className="hidden lg:block mb-6">
                  <h3 className="text-2xl font-serif font-bold text-foreground">Get in Touch</h3>
                  <p className="text-muted-foreground mt-2">
                    Visit our studio or contact us directly. We're here to help.
                  </p>
                </div>
                <ContactInfo />
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <ScrollToTop />
      </main>
    </>
  );
};

export default ContactPage;
