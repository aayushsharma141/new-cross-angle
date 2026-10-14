import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { ProjectArchive } from "@/components/portfolio/ProjectArchive";
import { ClientPerspective } from "@/components/portfolio/ClientPerspective";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import { Container, Eyebrow, DisplayHeading, Body, Em, EASE_OUT_EXPO } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/**
 * Portfolio — the archive is the page.
 *
 * A compact header, then straight into the filterable project grid;
 * narrative lives on the home page chapters, not here.
 */
const PortfolioPage = () => {
  const seo = useSiteContent("portfolio.seo");
  const header = useSiteContent("portfolio.header");
  return (
  <>
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.ogTitle || seo.title} />
      <meta property="og:description" content={seo.ogDescription || seo.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://crossangleinterior.com/portfolio" />
      <link rel="canonical" href="https://crossangleinterior.com/portfolio" />
    </Helmet>

    <SchemaMarkup
      type="BreadcrumbList"
      data={{
        items: [
          { name: "Home", url: "/" },
          { name: "Portfolio", url: "/portfolio" }
        ]
      }}
    />

    <ScrollProgress />
    <Navbar />

    <main id="main-content" className="relative z-10 min-h-screen w-full overflow-x-clip bg-[var(--s-canvas-primary)] text-white">
      {/* Header */}
      <Container className="pt-36 pb-16 md:pt-48 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          className="max-w-3xl"
        >
          <Eyebrow className="mb-8">{header.eyebrow}</Eyebrow>
          <DisplayHeading as="h1" size="lg" className="mb-6">
            {header.headingLead} <Em>{header.headingEmphasis}</Em>
          </DisplayHeading>
          <Body className="max-w-xl">{header.intro}</Body>
        </motion.div>
      </Container>

      <ProjectArchive />
      <ClientPerspective />

    </main>

    <Footer />
    <ScrollToTop />
  </>
  );
};

export default PortfolioPage;
