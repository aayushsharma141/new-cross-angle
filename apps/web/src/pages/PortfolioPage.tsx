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

/**
 * Portfolio — the archive is the page.
 *
 * A compact header, then straight into the filterable project grid;
 * narrative lives on the home page chapters, not here.
 */
const PortfolioPage = () => (
  <>
    <Helmet>
      <title>Portfolio | Cross Angle Interior - Immersive Portfolio</title>
      <meta
        name="description"
        content="Explore our cinematic portfolio of luxury interiors. From modular kitchens to peaceful bedrooms, experience spaces designed for real lifestyles."
      />
      <meta property="og:title" content="Portfolio | Cross Angle Interior" />
      <meta property="og:description" content="Explore our cinematic portfolio of luxury interiors — spaces designed for real lifestyles." />
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
          <Eyebrow className="mb-8">Selected work</Eyebrow>
          <DisplayHeading as="h1" size="lg" className="mb-6">
            A collection of <Em>curated spaces.</Em>
          </DisplayHeading>
          <Body className="max-w-xl">
            Residences, workplaces and hospitality interiors delivered turn-key across Jamshedpur and beyond —
            each one a record of material restraint and spatial clarity.
          </Body>
        </motion.div>
      </Container>

      <ProjectArchive />
      <ClientPerspective />

    </main>

    <Footer />
    <ScrollToTop />
  </>
);

export default PortfolioPage;
