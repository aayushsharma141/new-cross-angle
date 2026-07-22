import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/primitives/button";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";
import { useEffect, useState, useMemo, useRef } from "react";
import { api, Blog } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, Eye, ArrowRight, ArrowDown,
  TrendingUp, Mail, Sparkles, BookOpen, Tag
} from "lucide-react";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { trackNewsletterSignup, trackTagClick } from "@/hooks/useBlogTracking";
import { supabase } from "@/integrations/supabase/client";

/* ─────────────────────────── STYLE CONSTANTS ─────────────────────────── */
const CRIMSON = "#C41230";
const GOLD = "#C6A15B";

const CATEGORIES = [
  "All",
  "Modular Kitchens",
  "Luxury Residential",
  "Commercial Fit-outs",
  "False Ceilings",
  "Turnkey Execution",
  "Interior Styling",
];

const POPULAR_TAGS = [
  "Bespoke Kitchens", "Villa Design", "Corporate Spaces",
  "Lighting & Ceilings", "Materials", "Smart Homes",
];

const cleanTitle = (title: string) => {
  if (!title) return "";
  let cleaned = title
    .replace(/&#8211;/g, "—")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/\s*[—\-–]\s*Cross Angle Interior\s*$/i, "");
  return cleaned;
};

const readTime = (post: Blog) => `${Math.max(3, Math.ceil((post.excerpt?.length || 200) / 200))} min`;
const formatViews = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════════════════════════════════ */
const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "trending">("latest");
  const [visibleCount, setVisibleCount] = useState(5);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterHoneypot, setNewsletterHoneypot] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useGSAP(() => {
    if (!isLoading && blogPosts.length > 0) {
      gsap.from(".blog-hero-content > *", {
        y: 40, opacity: 0, duration: 1, stagger: 0.15,
        ease: "power4.out", delay: 0.2
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
        setDragConstraints({ right: 0, left: Math.min(0, -(scrollWidth - containerWidth)) });
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
    if (sortBy === "trending") {
      posts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    } else {
      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return posts;
  }, [blogPosts, activeCategory, searchQuery, sortBy]);

  const featuredPost = blogPosts[0];
  const paginatedPosts = filtered
    .filter(p => !featuredPost || p.id !== featuredPost.id)
    .slice(0, visibleCount);
  const trendingPosts = [...blogPosts]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 6);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    blogPosts.forEach(p => {
      const cat = p.category || "Interior Design";
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [blogPosts]);

  /* ── Newsletter ── */
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    if (newsletterHoneypot) return;
    const lastSubmit = sessionStorage.getItem("newsletter_last_submit");
    if (lastSubmit && Date.now() - Number(lastSubmit) < 30000) return;
    setNewsletterSubmitting(true);
    try {
      sessionStorage.setItem("newsletter_last_submit", String(Date.now()));
      await supabase.from("leads").insert({
        email: newsletterEmail,
        lead_source: "other",
        name: "Newsletter Subscriber",
        message: "Signed up for 'Design Decoded' newsletter.",
      });
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

            <Navbar />
      <main id="main-content" className="min-h-screen relative z-10" style={{ background: "#000" }}>

        {/* ═══════════════ 1. HERO FEATURED ARTICLE ═══════════════ */}
        {isLoading ? (
          <section className="relative pt-24 pb-0 overflow-hidden" style={{ minHeight: "80vh" }}>
            <div className="absolute inset-0 skeleton-shimmer" />
            <div className="container mx-auto px-4 relative z-10 flex items-end pb-16" style={{ minHeight: "70vh" }}>
              <div className="max-w-2xl space-y-5 md:pl-14">
                <Skeleton className="h-6 w-32 rounded-full bg-zinc-800/50" />
                <Skeleton className="h-14 w-full bg-zinc-800/50" />
                <Skeleton className="h-4 w-3/4 bg-zinc-800/30" />
                <Skeleton className="h-4 w-1/2 bg-zinc-800/30" />
                <Skeleton className="h-12 w-44 rounded-lg bg-zinc-800/50" />
              </div>
            </div>
          </section>
        ) : featuredPost && (
          <section className="relative pt-24 pb-0 overflow-hidden" style={{ minHeight: "80vh" }}>
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full"
                imageClassName="object-cover"
                loading="eager"
                width={1400}
                quality={90}
              />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(105deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.35) 100%)"
              }} />
              {/* Bottom fade for seamless transition into filter bar */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex items-end pb-20 blog-hero-content" style={{ minHeight: "72vh" }}>
              <div className="max-w-xl space-y-5 md:pl-14">

                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full"
                  style={{ background: `${CRIMSON}25`, color: CRIMSON, border: `1px solid ${CRIMSON}40` }}
                >
                  Featured Article
                </span>

                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {cleanTitle(featuredPost.title)}
                </h1>

                <p className="text-sm md:text-base leading-relaxed text-white/65 line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-white/50">
                  <span className="font-semibold" style={{ color: CRIMSON }}>{featuredPost.category || "Interior Design"}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readTime(featuredPost)} read</span>
                  <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{formatViews(featuredPost.view_count)} views</span>
                  <span>{featuredPost.date}</span>
                </div>

                <Link to={`/blog/${featuredPost.slug || featuredPost.id}`}>
                  <button
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300"
                    style={{ background: CRIMSON, color: "#fff" }}
                  >
                    Read Full Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ 2. FILTER BAR ═══════════════ */}
        <section className="sticky top-0 z-30 py-4 border-b" style={{ borderColor: "#1f1f1f", background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

              {/* Category chips — scrollable on mobile */}
              <div
                role="tablist"
                aria-label="Filter articles by category"
                className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-nowrap"
              >
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    role="tab"
                    id={`tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    {...({ "aria-selected": activeCategory === cat } as React.HTMLAttributes<HTMLButtonElement>)}
                    aria-label={`Filter by ${cat}`}
                    onClick={() => { setActiveCategory(cat); setVisibleCount(5); }}
                    className="flex-shrink-0 px-4 py-2 text-[12px] font-semibold rounded-full transition-all duration-200 border whitespace-nowrap"
                    style={{
                      background: activeCategory === cat ? CRIMSON : "transparent",
                      color: activeCategory === cat ? "#fff" : "#aaa",
                      borderColor: activeCategory === cat ? CRIMSON : "#333",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <label className="relative">
                  <span className="sr-only">Search articles</span>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#555" }} />
                  <input
                    type="search"
                    placeholder="Search articles…"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setVisibleCount(5); }}
                    className="pl-9 pr-4 py-2.5 text-[13px] rounded-full border focus:outline-none focus:ring-2 focus:ring-[#C41230]/40 w-48"
                    style={{ background: "#111", borderColor: "#2a2a2a", color: "#fff" }}
                  />
                </label>
                <label className="sr-only" htmlFor="sort-select">Sort articles</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as "latest" | "trending")}
                  className="px-3.5 py-2.5 text-[12px] rounded-full border cursor-pointer appearance-none pr-8"
                  style={{ background: "#111", borderColor: "#2a2a2a", color: "#aaa" }}
                >
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ 3. TRENDING SLIDER ═══════════════ */}
        {!isLoading && trendingPosts.length > 0 && (
          <section className="py-14" style={{ background: "#060606" }}>
            <div className="container mx-auto px-4" ref={containerRef}>
              <div className="flex items-center gap-2.5 mb-8">
                <TrendingUp className="w-4 h-4" style={{ color: CRIMSON }} />
                <h2 className="font-serif text-xl font-bold text-white">Trending Articles</h2>
                <span className="text-[11px] text-white/30 font-sans ml-1">— drag to explore</span>
              </div>

              <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing">
                <motion.div
                  ref={sliderRef}
                  drag="x"
                  dragConstraints={dragConstraints}
                  dragElastic={0.15}
                  dragTransition={{ power: 0.2, timeConstant: 200 }}
                  dragMomentum
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
                  style={{ touchAction: "pan-y" }}
                  className="flex w-max gap-5 pb-3"
                >
                  {trendingPosts.map((post, i) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug || post.id}`}
                      className="flex-shrink-0 w-[280px] group block"
                      draggable={false}
                      onClick={(e) => { if (isDragging) e.preventDefault(); }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-2xl overflow-hidden border transition-all duration-400 hover:border-[#C41230]/40 hover:shadow-[0_8px_32px_rgba(196,18,48,0.1)]"
                        style={{ background: "#111", borderColor: "#1e1e1e" }}
                      >
                        <div className="aspect-[16/9] overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full pointer-events-none"
                            imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
                            width={400} height={225}
                            draggable={false}
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CRIMSON }}>{post.category}</span>
                          <h3 className="text-[13px] font-semibold text-white/90 line-clamp-2 group-hover:text-[#C41230] transition-colors leading-snug">
                            {cleanTitle(post.title)}
                          </h3>
                          <div className="flex items-center gap-3 text-[11px] text-white/35">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime(post)} read</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(post.view_count)} views</span>
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

            <div className="flex items-baseline justify-between mb-10">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Recent Articles</h2>
                <p className="text-[12px] mt-1 text-white/35 font-sans">
                  {isLoading ? "Loading articles…" : `${filtered.length} article${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

              {/* ── Main Grid ── */}
              <div>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={`rounded-2xl overflow-hidden border space-y-4 ${i === 1 ? "md:col-span-2" : ""}`} style={{ background: "#0D0D0D", borderColor: "#1a1a1a" }}>
                        <Skeleton className={`w-full rounded-lg bg-zinc-800/30 ${i === 1 ? "aspect-[21/9]" : "aspect-[16/9]"}`} />
                        <div className="p-5 space-y-3">
                          <Skeleton className="h-3 w-20 bg-zinc-800/50" />
                          <Skeleton className="h-5 w-full bg-zinc-800/50" />
                          <Skeleton className="h-4 w-4/5 bg-zinc-800/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paginatedPosts.length === 0 ? (
                  <div className="text-center py-24" style={{ color: "#555" }}>
                    <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
                    <p className="text-base text-white/40">No articles found for this filter.</p>
                    <button
                      onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                      className="mt-4 text-[13px] underline text-white/30 hover:text-white/60 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeCategory}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      role="tabpanel"
                      id="blog-posts-panel"
                      aria-labelledby={`tab-${activeCategory.toLowerCase().replace(/\s+/g, '-')}`}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {paginatedPosts.map((post, i) => (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`rounded-2xl overflow-hidden border group transition-all duration-400 hover:border-[#C41230]/30 hover:shadow-[0_12px_40px_rgba(196,18,48,0.07)] ${i === 0 ? "md:col-span-2" : ""}`}
                          style={{ background: "#0D0D0D", borderColor: "#1c1c1c" }}
                        >
                          <Link to={`/blog/${post.slug || post.id}`} className="block">
                            <div className={`overflow-hidden ${i === 0 ? "aspect-[21/9]" : "aspect-[16/9]"}`}>
                              <Image
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full"
                                imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
                                width={i === 0 ? 900 : 500}
                                height={i === 0 ? 400 : 280}
                              />
                            </div>
                          </Link>
                          <div className="p-5 md:p-6 space-y-3">
                            <div className="flex items-center gap-3">
                              <span
                                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{ background: `${CRIMSON}15`, color: CRIMSON }}
                              >
                                {post.category || "Design"}
                              </span>
                              <span className="text-[12px] text-white/30">{post.date}</span>
                            </div>
                            <Link to={`/blog/${post.slug || post.id}`}>
                              <h3 className={`font-serif font-semibold text-white group-hover:text-[#C41230] transition-colors leading-snug line-clamp-2 ${i === 0 ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
                                {cleanTitle(post.title)}
                              </h3>
                            </Link>
                            <p className="text-[13px] leading-relaxed line-clamp-2 text-white/55">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-4 text-[12px] text-white/35">
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{readTime(post)} read</span>
                                <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" />{formatViews(post.view_count)} views</span>
                              </div>
                              <Link
                                to={`/blog/${post.slug || post.id}`}
                                className="text-[12px] font-semibold flex items-center gap-1 transition-colors hover:gap-2"
                                style={{ color: CRIMSON }}
                                aria-label={`Read more: ${cleanTitle(post.title)}`}
                              >
                                Read <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* ── Load More ── */}
                {filtered.length > visibleCount && (
                  <div className="flex items-center justify-center mt-16 w-full relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: "#1A1A1A" }}></div>
                    </div>
                    <button
                      onClick={() => setVisibleCount(prev => prev + 2)}
                      className="group relative z-10 flex items-center gap-2.5 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-[#C41230]"
                      style={{ background: "#000", color: "#666" }}
                    >
                      <span>Load More</span>
                      <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Sidebar ── */}
              <aside className="space-y-6" aria-label="Blog sidebar">

                {/* Categories */}
                <div className="rounded-2xl p-6 border" style={{ background: "#0A0A0A", borderColor: "#1c1c1c" }}>
                  <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ background: GOLD }} />
                    Categories
                  </h3>
                  <div className="space-y-0.5">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center py-2.5">
                          <Skeleton className="h-3.5 w-28 bg-zinc-800/30" />
                          <Skeleton className="h-4 w-7 rounded-full bg-zinc-800/30" />
                        </div>
                      ))
                    ) : (
                      Object.entries(categoryCounts).map(([cat, count]) => (
                        <button
                          key={cat}
                          onClick={() => { setActiveCategory(cat); setVisibleCount(5); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13px] transition-all hover:bg-white/[0.04]"
                          style={{ color: activeCategory === cat ? CRIMSON : "#888" }}
                          {...({ "aria-pressed": activeCategory === cat } as React.HTMLAttributes<HTMLButtonElement>)}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#1c1c1c", color: "#555" }}>{count}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="rounded-2xl p-6 border" style={{ background: "#0A0A0A", borderColor: "#1c1c1c" }}>
                  <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ background: GOLD }} />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => { trackTagClick("", tag); setSearchQuery(tag); setVisibleCount(5); }}
                        className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all hover:border-[#C41230]/60 hover:text-[#C41230] hover:bg-[#C41230]/5"
                        style={{ borderColor: "#2a2a2a", color: "#666" }}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Most Read */}
                <div className="rounded-2xl p-6 border" style={{ background: "#0A0A0A", borderColor: "#1c1c1c" }}>
                  <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ background: GOLD }} />
                    Most Read
                  </h3>
                  <div className="space-y-5">
                    {isLoading ? (
                      [1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="h-6 w-6 bg-zinc-800/30 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-full bg-zinc-800/50" />
                            <Skeleton className="h-3 w-16 bg-zinc-800/30" />
                          </div>
                        </div>
                      ))
                    ) : blogPosts.slice(0, 4).map((post, i) => (
                      <Link to={`/blog/${post.slug || post.id}`} key={post.id} className="flex gap-3 group items-start">
                        <span className="text-xl font-serif font-bold leading-none mt-0.5 shrink-0" style={{ color: `${CRIMSON}50` }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="text-[13px] font-medium text-white/80 group-hover:text-[#C41230] transition-colors line-clamp-2 leading-snug">
                            {cleanTitle(post.title)}
                          </h4>
                          <span className="text-[11px] text-white/30">{readTime(post)} read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA Block */}
                <div
                  className="rounded-2xl p-6 border text-center"
                  style={{ background: `linear-gradient(135deg, ${CRIMSON}12, #0A0A0A)`, borderColor: `${CRIMSON}25` }}
                >
                  <Sparkles className="w-7 h-7 mx-auto mb-3" style={{ color: CRIMSON }} />
                  <h3 className="font-serif text-base font-bold text-white mb-1.5">Partner With Experts</h3>
                  <p className="text-[12px] mb-4 text-white/50 leading-relaxed">
                    Ready to redefine your hospitality space? Let's collaborate.
                  </p>
                  <Link to="/contact-us">
                    <button
                      className="w-full text-[12px] font-semibold py-2.5 rounded-full transition-all duration-200 hover:opacity-90"
                      style={{ background: CRIMSON, color: "#fff" }}
                    >
                      Request Consultation
                    </button>
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ═══════════════ 5. NEWSLETTER ═══════════════ */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C6A15B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          
          <div className="container mx-auto px-4 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Content & Form */}
              <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full" style={{ background: "#161616", border: "1px solid #2a2a2a" }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: CRIMSON }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: CRIMSON }}>Newsletter</span>
                </div>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">Design Decoded</h2>
                <p className="text-[14px] mb-8 text-white/50 leading-relaxed max-w-md mx-auto lg:mx-0">
                  Join 5,000+ industry professionals receiving monthly design insights, trends, and case studies directly from our studio.
                </p>

                {newsletterDone ? (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-6 border-l-2 pl-6" style={{ borderColor: CRIMSON }}>
                    <p className="text-xl font-serif text-white">Welcome aboard! ✨</p>
                    <p className="text-[13px] text-white/50 mt-2">Your first edition is on its way.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                    <label className="sr-only" htmlFor="newsletter-email">Email address</label>
                    <div aria-hidden="true" className="absolute left-[-9999px]">
                      <label htmlFor="newsletter-website">Website</label>
                      <input id="newsletter-website" tabIndex={-1} autoComplete="off" value={newsletterHoneypot} onChange={e => setNewsletterHoneypot(e.target.value)} />
                    </div>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      placeholder="Your professional email"
                      className="flex-1 px-5 py-3.5 rounded-full text-[13px] border focus:outline-none focus:ring-2 focus:ring-[#C41230]/40 transition-all"
                      style={{ background: "#111", borderColor: "#2a2a2a", color: "#fff" }}
                    />
                    <Button
                      type="submit"
                      disabled={newsletterSubmitting}
                      className="px-6 py-3.5 text-[13px] font-semibold rounded-full whitespace-nowrap transition-all hover:scale-[1.02]"
                      style={{ background: CRIMSON, color: "#fff" }}
                    >
                      {newsletterSubmitting ? "Subscribing…" : "Subscribe"}
                    </Button>
                  </form>
                )}
                <div className="text-[10px] mt-4 text-white/25 flex items-center justify-center lg:justify-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#333] inline-block" /> We respect your privacy. Unsubscribe anytime.
                </div>
              </div>

              {/* Right Column: Free-Floating Design Intelligence Hub */}
              <div className="hidden lg:flex justify-center items-center relative h-[380px] w-full" style={{ perspective: "1200px" }}>
                
                {/* Massive Ambient Glow bleeding into the whole section */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15 pointer-events-none z-0"
                  style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
                  animate={{ 
                    scale: [1, 1.1, 1, 1.1, 1],
                    opacity: [0.15, 0.25, 0.15, 0.25, 0.15]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Central Open Design Journal (3D Spline style) */}
                <motion.div
                  className="relative z-10 w-60 h-44 flex shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  style={{ rotateX: 20, rotateZ: -12, transformStyle: "preserve-3d" }}
                  animate={{ rotateZ: [-12, -8, -12], y: [-8, 8, -8] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Left Page */}
                  <div className="w-1/2 h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-l-lg p-4 relative overflow-hidden flex flex-col gap-2" style={{ transformOrigin: "right", transform: "rotateY(-8deg)" }}>
                    <div className="w-10 h-1.5 bg-white/30 rounded" />
                    <div className="w-20 h-1 bg-white/10 rounded" />
                    <div className="w-14 h-1 bg-white/10 rounded" />
                    <div className="w-16 h-1 bg-white/10 rounded" />
                    
                    <div className="mt-auto w-full h-16 bg-white/5 rounded border border-white/5 p-1.5 flex gap-1.5">
                      <div className="w-1/3 h-full bg-white/10 rounded-sm" />
                      <div className="w-1/3 h-full bg-white/10 rounded-sm" />
                    </div>
                  </div>
                  
                  {/* Right Page */}
                  <div className="w-1/2 h-full bg-gradient-to-bl from-[#1f1f1f] to-[#0a0a0a] border border-white/10 border-l-0 rounded-r-lg p-4 relative flex flex-col items-center justify-center" style={{ transformOrigin: "left", transform: "rotateY(8deg)" }}>
                     <motion.div 
                        className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-black/50 shadow-inner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     >
                       <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20" />
                     </motion.div>
                     <div className="absolute bottom-4 right-4 w-12 h-1 bg-white/10 rounded" />
                  </div>
                  
                  {/* Glowing spine */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent -translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                </motion.div>

                {/* Orbiting Elements (Magic UI Floating Cards style) */}
                
                {/* 1. Trend Card */}
                <motion.div
                  className="absolute z-20 w-28 h-36 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  style={{ top: "8%", left: "-2%" }}
                  animate={{ y: [0, -15, 0], rotate: [8, 4, 8] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                >
                  <p className="text-[9px] text-white/50 font-mono tracking-wider mb-2">TREND 2026</p>
                  <div className="flex-1 rounded bg-white/5 border border-white/5 relative overflow-hidden mb-2 flex items-end p-1.5 gap-1.5">
                    <motion.div className="w-full bg-white/20 rounded-sm" animate={{ height: ["40%", "70%", "40%"] }} transition={{ duration: 4, repeat: Infinity }} />
                    <motion.div className="w-full rounded-sm" style={{ background: CRIMSON }} animate={{ height: ["20%", "50%", "20%"] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
                    <motion.div className="w-full bg-white/40 rounded-sm" animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
                  </div>
                  <div className="w-12 h-1 bg-white/20 rounded mx-auto" />
                </motion.div>

                {/* 2. Material Sample (Brass) */}
                <motion.div
                  className="absolute z-20 w-24 h-28 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 flex flex-col shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  style={{ bottom: "8%", right: "2%" }}
                  animate={{ y: [0, 12, 0], rotate: [-12, -6, -12], scale: [1.05, 1, 1.05] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex-1 rounded-lg mb-2 relative overflow-hidden border border-white/10 shadow-inner" style={{ background: GOLD }}>
                     <motion.div 
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent w-[200%]"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 1, ease: "easeInOut" }}
                     />
                  </div>
                  <p className="text-[8px] text-white/50 font-mono tracking-wider text-center">BRASS / 04</p>
                </motion.div>

                {/* 3. Case Study Image */}
                <motion.div
                  className="absolute z-0 w-36 h-24 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  style={{ top: "25%", right: "-8%" }}
                  animate={{ y: [0, -10, 0], rotate: [-6, -3, -6], scale: [0.9, 0.95, 0.9] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <MediaSlot assetKey="blog_newsletter_bg" fallbackUrl="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80" alt="" className="w-full h-full rounded-lg object-cover" />
                </motion.div>

                {/* Floating Particles in 3D Space */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/40 blur-[1px]"
                    style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: `${Math.random() * 100}%` 
                    }}
                    animate={{ 
                      y: [0, -150], 
                      opacity: [0, 1, 0],
                      x: Math.random() * 80 - 40,
                      scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{ 
                      duration: 6 + Math.random() * 5, 
                      repeat: Infinity, 
                      delay: Math.random() * 4,
                      ease: "linear"
                    }}
                  />
                ))}

              </div>

            </div>
          </div>
        </section>

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
