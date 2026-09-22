import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useBlogList } from "./blog/_hooks/useBlogList";
import { BlogHero } from "./blog/_components/BlogHero";
import { BlogFilterBar } from "./blog/_components/BlogFilterBar";
import { BlogTrendingSlider } from "./blog/_components/BlogTrendingSlider";
import { BlogGrid } from "./blog/_components/BlogGrid";
import { BlogSidebar } from "./blog/_components/BlogSidebar";
import { BlogNewsletter } from "./blog/_components/BlogNewsletter";

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════════════════════════════════ */
const BlogPage = () => {
  const {
    blogPosts,
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
    trendingPosts,
    categoryCounts
  } = useBlogList();

  useGSAP(() => {
    if (!isLoading && blogPosts.length > 0) {
      gsap.from(".blog-hero-content > *", {
        y: 40, opacity: 0, duration: 1, stagger: 0.15,
        ease: "power4.out", delay: 0.2
      });
    }
  }, [isLoading, blogPosts]);

  return (
    <>
      <Helmet>
        <title>Articles & Blog | Cross Angle Interior - Design Intelligence</title>
        <meta name="description" content="Explore curated articles on hospitality design, luxury interiors, lighting strategies, and sustainable architecture. Expert knowledge from Cross Angle Interior." />
        <meta property="og:title" content="Design Articles | Cross Angle Interior" />
        <meta property="og:description" content="Curated articles on hospitality design, luxury interiors, and spatial intelligence." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/blog" />
      </Helmet>

      <Navbar />
      <main id="main-content" className="min-h-screen relative z-10" style={{ background: "#000" }}>
        {/* 1. HERO FEATURED ARTICLE */}
        <BlogHero featuredPost={featuredPost} isLoading={isLoading} />

        {/* 2. FILTER BAR */}
        <BlogFilterBar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          setVisibleCount={setVisibleCount}
        />

        {/* 3. TRENDING SLIDER */}
        <BlogTrendingSlider isLoading={isLoading} trendingPosts={trendingPosts} />

        {/* 4. MAIN CONTENT: GRID + SIDEBAR */}
        <section className="py-16" style={{ background: "#000" }}>
          <div className="container mx-auto px-4">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Recent Articles</h2>
                <p className="text-[12px] mt-1 text-white/35 font-sans">
                  {isLoading ? "Loading articles…" : `${filtered.length} article${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
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

              <BlogSidebar
                isLoading={isLoading}
                categoryCounts={categoryCounts}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                setVisibleCount={setVisibleCount}
                setSearchQuery={setSearchQuery}
                blogPosts={blogPosts}
              />
            </div>
          </div>
        </section>

        {/* 5. NEWSLETTER */}
        <BlogNewsletter />
      </main>

      <Footer />
      <ScrollToTop />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default BlogPage;
