import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import LegalFooter from "@/components/layout/LegalFooter";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { useSiteContent } from "@/content/useSiteContent";

/** Privacy Policy. The text is edited in admin → Website Content → Site Content → Privacy Policy. */
const PrivacyPage = () => {
  const doc = useSiteContent("legal.privacy");

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#D4AF37]/30">
      <Helmet>
        <title>{doc.seoTitle}</title>
        <meta name="description" content={doc.seoDescription} />
        <meta property="og:title" content={doc.ogTitle || doc.seoTitle} />
        <meta property="og:description" content={doc.ogDescription || doc.seoDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/privacy" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="relative z-10 overflow-hidden pb-24 pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-[#D4AF37]/8 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-24 -z-10 h-[600px] w-[600px] rounded-full bg-[#D4AF37]/4 blur-[140px]" />
        <LegalDocumentView doc={doc} />
      </main>

      <LegalFooter />
      <ScrollToTop />
    </div>
  );
};

export default PrivacyPage;
