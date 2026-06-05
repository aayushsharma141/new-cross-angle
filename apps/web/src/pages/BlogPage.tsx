import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedSocialBar from "@/components/layout/FixedSocialBar";
import { Button } from "@/components/ui/primitives/button";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useEffect, useState, useMemo, useRef } from "react";
import { api, Blog } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, Eye, ArrowRight,
  TrendingUp, Tag, Mail, Sparkles, BookOpen
} from "lucide-react";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { trackNewsletterSignup, trackTagClick } from "@/hooks/useBlogTracking";
import { supabase } from "@/integrations/supabase/client";

/* ─────────────────────────── STYLE CONSTANTS ─────────────────────────── */
const CRIMSON = "#C41230";
const CRIMSON_DIM = "#9C0E26";
const GOLD = "#C6A15B";

const CATEGORIES = [
  "All",
  "Hotel Design",
  "Restaurant Interiors",
  "Lighting",
  "Furniture Sourcing",
  "Sustainability",
  "Interior Design",
];

const POPULAR_TAGS = [
  "Luxury Hotels", "Biophilic Design", "Lighting",
  "Materials", "Spatial Layout", "Modern",
];

// Clean HTML entities and common repeating brand names
const cleanTitle = (title: string) => {
  if (!title) return "";
  let cleaned = title
    .replace(/&#8211;/g, "—")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove variations of " - Cross Angle Interior" at the end
  cleaned = cleaned.replace(/\s*[—\-–]\s*Cross Angle Interior\s*$/i, "");
  return cleaned;
};

/* ─────────────────────────── HELPER ─────────────────────────── */
const readTime = (post: Blog) => `${Math.max(3, Math.ceil((post.excerpt?.length || 200) / 200))} min read`;
const formatViews = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1)}k views` : `${count} views`;

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════════════════════════════════ */
const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "trending">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const POSTS_PER_PAGE = 6;

  useGSAP(() => {
    if (!isLoading && blogPosts.length > 0) {
      gsap.from(".blog-hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.2
      });
    }
  }, [isLoading, blogPosts]);

  useEffect(() => {

    const fetchBlogs = async () => {
      try {
        const data = await api.getBlogs();
        setBlogPosts(data);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && sliderRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scrollWidth = sliderRef.current.scrollWidth;
        setDragConstraints({
          right: 0,
          left: Math.min(0, -(scrollWidth - containerWidth)),
        });
      }
    };

    updateConstraints();
    setTimeout(updateConstraints, 300);
    const imgs = sliderRef.current?.querySelectorAll("img");
    imgs?.forEach((img) => img.addEventListener("load", updateConstraints));
    window.addEventListener("resize", updateConstraints);
    return () => {
      imgs?.forEach((img) => img.removeEventListener("load", updateConstraints));
      window.removeEventListener("resize", updateConstraints);
    };
  }, [blogPosts]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let posts = [...blogPosts];
    if (activeCategory !== "All") {
      posts = posts.filter(p => p.category?.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q)
      );
    }
    return posts;
  }, [blogPosts, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginatedPosts = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const featuredPost = blogPosts[0];
  const trendingPosts = blogPosts.slice(0, 6);

  /* ── Sidebar categories with counts ── */
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    blogPosts.forEach(p => {
      const cat = p.category || "Interior Design";
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [blogPosts]);

  /* ── Slider scroll ── */
  // Removed manual scroll since we are using drag gestures

  /* ── Newsletter ── */
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitting(true);
    try {
      await supabase.from("newsletter_subscribers").insert({ email: newsletterEmail, source: "blog" });
      trackNewsletterSignup();
      setNewsletterDone(true);
      setNewsletterEmail("");
    } catch (error) { 
      console.error("Newsletter signup error:", error); 
    }
    setNewsletterSubmitting(false);
  };

  /* ═══════════════ RENDER ═══════════════ */
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

      <FixedSocialBar />
      <Navbar />
      <main id="main-content" className="min-h-screen relative z-10" style={{ background: "#000" }}>

        {/* ═══════════════ 1. HERO FEATURED ARTICLE ═══════════════ */}
        {isLoading ? (
          <section className="relative pt-24 pb-0 overflow-hidden" style={{ minHeight: "85vh" }}>
            <div className="absolute inset-0 skeleton-shimmer" />
            <div className="container mx-auto px-4 relative z-10 flex items-center" style={{ minHeight: "70vh" }}>
              <div className="max-w-2xl space-y-6">
                <Skeleton className="h-8 w-40 rounded-full bg-zinc-800/50" />
                <Skeleton className="h-16 w-full bg-zinc-800/50" />
                <Skeleton className="h-4 w-3/4 bg-zinc-800/30" />
                <div className="flex gap-4">
                   <Skeleton className="h-4 w-20 bg-zinc-800/30" />
                   <Skeleton className="h-4 w-20 bg-zinc-800/30" />
                </div>
                <Skeleton className="h-12 w-48 bg-zinc-800/50" />
              </div>
            </div>
          </section>
        ) : featuredPost && (
          <section className="relative pt-24 pb-0 overflow-hidden" style={{ minHeight: "85vh" }}>
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full"
                imageClassName="object-cover"
                loading="eager"
                width={1200}
                quality={90}
              />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%)"
              }} />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex items-center blog-hero-content" style={{ minHeight: "70vh" }}>
              <div className="max-w-2xl space-y-6 md:pl-14">

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4"
                      style={{ background: `${CRIMSON}20`, color: CRIMSON, border: `1px solid ${CRIMSON}40` }}
                    >
                      Featured Article
                    </span>

                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                      {cleanTitle(featuredPost.title)}
                    </h1>

                    <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "#B8B8B8" }}>
                      {featuredPost.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-6" style={{ color: "#999" }}>
                      <span style={{ color: CRIMSON }}>{featuredPost.category || "Interior Design"}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime(featuredPost)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(featuredPost.view_count)}</span>
                      <span>{featuredPost.date}</span>
                    </div>

                    <Link to={`/blog/${featuredPost.slug || featuredPost.id}`}>
                      <Button
                        className="group px-8 py-3 text-sm font-semibold tracking-wide rounded-lg transition-all duration-300"
                        style={{ background: CRIMSON, color: "#fff" }}
                      >
                        Read Full Article
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ 2. CATEGORY FILTER + SEARCH ═══════════════ */}
        <section className="py-10 border-b" style={{ borderColor: "#1a1a1a", background: "#0A0A0A" }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                    className="px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 border"
                    style={{
                      background: activeCategory === cat ? CRIMSON : "transparent",
                      color: activeCategory === cat ? "#fff" : "#888",
                      borderColor: activeCategory === cat ? CRIMSON : "#333",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#666" }} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-1 w-56"
                    style={{ background: "#111", borderColor: "#333", color: "#fff" }}
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as "latest" | "trending")}
                  aria-label="Sort articles"
                  className="px-3 py-2.5 text-xs rounded-lg border cursor-pointer"
                  style={{ background: "#111", borderColor: "#333", color: "#888" }}
                >
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ 3. TRENDING SLIDER ═══════════════ */}
        {isLoading ? (
          <section className="py-16" style={{ background: "#050505" }}>
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mb-8 bg-zinc-800/50" />
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex-shrink-0 w-[300px] space-y-4">
                    <Skeleton className="h-44 w-full rounded-xl bg-zinc-800/30" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-800/50" />
                    <Skeleton className="h-3 w-1/2 bg-zinc-800/30" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : trendingPosts.length > 0 && (
          <section className="py-16" style={{ background: "#050505" }}>
            <div className="container mx-auto px-4" ref={containerRef}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" style={{ color: CRIMSON }} />
                  <h2 className="font-serif text-2xl font-bold text-white">Trending Articles</h2>
                </div>
              </div>

              <div className="overflow-hidden w-full">
                <motion.div
                  ref={sliderRef}
                  drag="x"
                  dragConstraints={dragConstraints}
                  dragElastic={0.2}
                  dragTransition={{ power: 0.2, timeConstant: 200 }}
                  dragMomentum={true}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
                  style={{ touchAction: "pan-y" }}
                  className="flex w-max gap-6 pb-4 cursor-grab active:cursor-grabbing"
                >
                {trendingPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className="flex-shrink-0 w-[300px] group block"
                    draggable={false}
                    onClick={(e) => { if (isDragging) e.preventDefault(); }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl overflow-hidden border transition-all duration-500 hover:border-[#C41230]/30"
                      style={{ background: "#111", borderColor: "#222" }}
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full pointer-events-none"
                          imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
                          width={400}
                          height={250}
                          draggable={false}
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CRIMSON }}>{post.category}</span>
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#C41230] transition-colors">{cleanTitle(post.title)}</h3>
                        <div className="flex items-center gap-3 text-[11px]" style={{ color: "#666" }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime(post)}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(post.view_count)}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ 4. MAIN CONTENT: GRID + SIDEBAR ═══════════════ */}
        <section className="py-16" style={{ background: "#000" }}>
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-white mb-2">Recent Articles</h2>
            <p className="text-sm mb-10" style={{ color: "#888" }}>
              {isLoading ? "Loading articles..." : `${filtered.length} article${filtered.length !== 1 ? "s" : ""} found`}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* ── Main Grid ── */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={`rounded-xl overflow-hidden border p-5 space-y-4 ${i === 1 ? "md:col-span-2" : ""}`} style={{ background: "#0D0D0D", borderColor: "#1a1a1a" }}>
                        <Skeleton className={`w-full rounded-lg bg-zinc-800/30 ${i === 1 ? "aspect-[21/9]" : "aspect-[16/10]"}`} />
                        <div className="space-y-3">
                          <Skeleton className="h-3 w-24 bg-zinc-800/50" />
                          <Skeleton className="h-6 w-full bg-zinc-800/50" />
                          <Skeleton className="h-4 w-full bg-zinc-800/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paginatedPosts.length === 0 ? (
                  <div className="text-center py-20" style={{ color: "#666" }}>
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No articles found for this filter.</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeCategory}-${currentPage}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {paginatedPosts.map((post, i) => (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`rounded-xl overflow-hidden border group transition-all duration-500 hover:border-[#C41230]/30 hover:shadow-[0_12px_40px_rgba(196,18,48,0.08)] ${i === 0 ? "md:col-span-2" : ""}`}
                          style={{ background: "#0D0D0D", borderColor: "#1a1a1a" }}
                        >
                          <Link to={`/blog/${post.slug || post.id}`} className="block">
                            <div className={`overflow-hidden ${i === 0 ? "aspect-[21/9]" : "aspect-[16/10]"}`}>
                              <Image
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full"
                                imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
                                width={i === 0 ? 800 : 400}
                                height={i === 0 ? 400 : 250}
                              />
                            </div>
                          </Link>
                          <div className="p-5 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: `${CRIMSON}15`, color: CRIMSON }}>
                                {post.category}
                              </span>
                              <span className="text-[11px]" style={{ color: "#555" }}>{post.date}</span>
                            </div>
                            <Link to={`/blog/${post.slug || post.id}`}>
                              <h3 className="font-serif text-lg font-semibold text-white group-hover:text-[#C41230] transition-colors leading-snug line-clamp-2">
                                {cleanTitle(post.title)}
                              </h3>
                            </Link>
                            <p className="text-sm line-clamp-2" style={{ color: "#888" }}>{post.excerpt}</p>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-4 text-[11px]" style={{ color: "#555" }}>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime(post)}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(post.view_count)}</span>
                              </div>
                              <Link
                                to={`/blog/${post.slug || post.id}`}
                                className="text-xs font-medium flex items-center gap-1 transition-colors hover:text-[#C41230]"
                                style={{ color: CRIMSON_DIM }}
                              >
                                Read More <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-9 h-9 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: currentPage === page ? CRIMSON : "#111",
                          color: currentPage === page ? "#fff" : "#888",
                          border: `1px solid ${currentPage === page ? CRIMSON : "#333"}`,
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Sidebar ── */}
              <aside className="space-y-8">
                {/* Categories */}
                <div className="rounded-xl p-6 border" style={{ background: "#0A0A0A", borderColor: "#1a1a1a" }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center py-2">
                           <Skeleton className="h-4 w-32 bg-zinc-800/30" />
                           <Skeleton className="h-4 w-8 rounded-full bg-zinc-800/30" />
                        </div>
                      ))
                    ) : (
                      Object.entries(categoryCounts).map(([cat, count]) => (
                        <button
                          key={cat}
                          onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5"
                          style={{ color: activeCategory === cat ? CRIMSON : "#999" }}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#666" }}>{count}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="rounded-xl p-6 border" style={{ background: "#0A0A0A", borderColor: "#1a1a1a" }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => { trackTagClick("", tag); setSearchQuery(tag); setCurrentPage(1); }}
                        className="text-xs px-3 py-1.5 rounded-full border transition-all hover:border-[#C41230] hover:text-[#C41230]"
                        style={{ borderColor: "#333", color: "#888" }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Most Read Articles */}
                <div className="rounded-xl p-6 border" style={{ background: "#0A0A0A", borderColor: "#1a1a1a" }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
                    Most Read
                  </h3>
                  <div className="space-y-4">
                    {isLoading ? (
                      [1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3">
                           <Skeleton className="h-8 w-8 bg-zinc-800/30" />
                           <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-full bg-zinc-800/50" />
                             <Skeleton className="h-3 w-16 bg-zinc-800/30" />
                           </div>
                        </div>
                      ))
                    ) : blogPosts.slice(0, 4).map((post, i) => (
                      <Link to={`/blog/${post.slug || post.id}`} key={post.id} className="flex gap-3 group">
                        <span className="text-2xl font-serif font-bold" style={{ color: `${CRIMSON}40` }}>{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <h4 className="text-sm font-medium text-white group-hover:text-[#C41230] transition-colors line-clamp-2 leading-snug">{post.title}</h4>
                          <span className="text-[11px]" style={{ color: "#555" }}>{readTime(post)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA Block */}
                <div className="rounded-xl p-6 border text-center" style={{ background: `linear-gradient(135deg, ${CRIMSON}10, #0A0A0A)`, borderColor: `${CRIMSON}30` }}>
                  <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: CRIMSON }} />
                  <h3 className="font-serif text-lg font-bold text-white mb-2">Partner With Experts</h3>
                  <p className="text-xs mb-4" style={{ color: "#888" }}>
                    Ready to redefine your hospitality space? Let's collaborate.
                  </p>
                  <Link to="/contact-us">
                    <Button className="w-full text-xs font-semibold py-2.5 rounded-lg" style={{ background: CRIMSON, color: "#fff" }}>
                      Request Consultation
                    </Button>
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ═══════════════ 5. NEWSLETTER ═══════════════ */}
        <section className="py-20 relative overflow-hidden" style={{ background: "#050505" }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C6A15B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="w-5 h-5" style={{ color: CRIMSON }} />
                <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: CRIMSON }}>Newsletter</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">Design Decoded Newsletter</h2>
              <p className="text-sm mb-8" style={{ color: "#888" }}>
                Stay ahead of hospitality trends. Join 5,000+ industry professionals receiving our monthly insights.
              </p>

              {newsletterDone ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                  <p className="text-lg font-serif" style={{ color: CRIMSON }}>Thank you! Welcome aboard. ✨</p>
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Your professional email"
                    className="flex-1 px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1"
                    style={{ background: "#111", borderColor: "#333", color: "#fff" }}
                  />
                  <Button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="px-8 py-3 text-sm font-semibold rounded-lg whitespace-nowrap"
                    style={{ background: CRIMSON, color: "#fff" }}
                  >
                    {newsletterSubmitting ? "Subscribing..." : "Subscribe Now"}
                  </Button>
                </form>
              )}
              <p className="text-[10px] mt-4" style={{ color: "#555" }}>
                We respect your privacy. Unsubscribe any time.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════ 6. RELATED CASE STUDIES ═══════════════ */}
        <section className="py-16 border-t" style={{ borderColor: "#1a1a1a", background: "#000" }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-2xl font-bold text-white mb-2">From Ideas to Execution</h2>
            <p className="text-sm mb-10" style={{ color: "#888" }}>See how our design thinking translates to real-world spaces.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Luxury Hotel Lobby Redesign", tag: "Hospitality" },
                { title: "Restaurant Interior Transformation", tag: "Restaurant" },
                { title: "Resort Spatial Strategy", tag: "Resort" },
              ].map((cs, i) => (
                <Link key={i} to="/gallery" className="group">
                  <div
                    className="rounded-xl p-8 border transition-all duration-500 hover:border-[#C41230]/30"
                    style={{ background: "#0A0A0A", borderColor: "#1a1a1a" }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CRIMSON }}>{cs.tag}</span>
                    <h3 className="font-serif text-lg font-semibold text-white mt-2 group-hover:text-[#C41230] transition-colors">{cs.title}</h3>
                    <span className="inline-flex items-center gap-1 text-xs mt-4 transition-colors" style={{ color: CRIMSON_DIM }}>
                      View Project <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />

      {/* ── Scrollbar hide utility ── */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default BlogPage;
