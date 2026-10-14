import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import LegalFooter from "@/components/layout/LegalFooter";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { useSiteContent } from "@/content/useSiteContent";

/** Terms & Conditions. The text is edited in admin → Website Content → Site Content → Terms & Conditions. */
const TermsPage = () => {
  const doc = useSiteContent("legal.terms");

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#d1af6e]/20">
      <Helmet>
        <title>{doc.seoTitle}</title>
        <meta name="description" content={doc.seoDescription} />
        <meta property="og:title" content={doc.ogTitle || doc.seoTitle} />
        <meta property="og:description" content={doc.ogDescription || doc.seoDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/terms" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="relative z-10 overflow-hidden pb-24 pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-[#d1af6e]/6 to-transparent" />
        <div className="pointer-events-none absolute left-0 top-24 -z-10 h-[600px] w-[600px] rounded-full bg-[#d1af6e]/3 blur-[140px]" />
        <LegalDocumentView doc={doc} />
      </main>

      <LegalFooter />
      <ScrollToTop />
    </div>
  );
};

export default TermsPage;
