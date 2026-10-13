import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

import { useBlogList } from "./blog/_hooks/useBlogList";
import { BlogHero } from "./blog/_components/BlogHero";
import { BlogFilterBar } from "./blog/_components/BlogFilterBar";
import { BlogGrid } from "./blog/_components/BlogGrid";
import { BlogNewsletter } from "./blog/_components/BlogNewsletter";
import { Container, Section, Eyebrow, DisplayHeading, Body, Em, EASE_OUT_EXPO } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/**
 * Blog index — lead story, filters, grid.
 *
 * Categories, search and sort live in one hairline band; the sidebar and
 * trending slider were dropped because both restated what the filters and
 * the grid already show.
 */
const BlogPage = () => {
  const {
    isLoading,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    visibleCount,
    setVisibleCount,
    filtered,
    featuredPost,
    paginatedPosts,
  } = useBlogList();
  const seo = useSiteContent("blog.seo");
  const header = useSiteContent("blog.header");

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.ogTitle || seo.title} />
        <meta property="og:description" content={seo.ogDescription || seo.description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/blog" />
      </Helmet>

      <Navbar />
      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        {/* Header */}
        <Container className="pt-36 pb-14 md:pt-48 md:pb-20">
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

        <BlogHero featuredPost={featuredPost} isLoading={isLoading} />

        <BlogFilterBar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          setVisibleCount={setVisibleCount}
        />

        <Section spacing="default">
          <div className="mb-12 flex items-baseline justify-between gap-6">
            <h2 className="font-display text-2xl text-white md:text-[1.75rem]">
              {activeCategory === "All" ? "Recent articles" : activeCategory}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 tabular-nums">
              {isLoading ? "Loading" : `${filtered.length} article${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <BlogGrid
            isLoading={isLoading}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            setSearchQuery={setSearchQuery}
            filteredLength={filtered.length}
            paginatedPosts={paginatedPosts}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
          />
        </Section>

        <BlogNewsletter />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default BlogPage;
