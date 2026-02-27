import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import SectionNavDots from "@/components/SectionNavDots";
import WhatsAppButton from "@/components/WhatsAppButton";
import Process from "@/components/Process";
import TrustSection from "@/components/TrustSection";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";
import ScrollProgress from "@/components/ScrollProgress";
import WelcomePrompt from "@/components/WelcomePrompt";
import CTAContact from "@/components/CTAContact";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Crossangle Interior | Premium Interior Design Studio in Jamshedpur & Kolkata</title>
        <meta
          name="description"
          content="Transform your vision into exquisite living spaces with Crossangle Interior. Award-winning interior design for homes and commercial spaces in Jamshedpur and Kolkata. 500+ projects completed."
        />
        <meta
          name="keywords"
          content="interior design, residential design, commercial design, luxury interiors, home design, space planning, Jamshedpur, Kolkata, modular kitchen, false ceiling"
        />
        <meta property="og:title" content="Crossangle Interior | Premium Interior Design Studio" />
        <meta property="og:description" content="Transform your vision into exquisite living spaces. Award-winning interior design in Jamshedpur & Kolkata." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920" fetchPriority="high" />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <ScrollProgress />
      <WelcomePrompt />
      <Navbar />
      <main id="main-content" className="min-h-screen relative z-10">
        <FixedSocialBar />
        <SectionNavDots />
        <WhatsAppButton />
        <Hero />
        <About />
        <Services />
        <Process />
        <Portfolio />
        <TrustSection />
        <BeforeAfterShowcase />
        <Testimonials />
        <CTAContact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
