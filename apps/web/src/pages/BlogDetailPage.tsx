import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import {
    Clock, Linkedin, LinkIcon, ArrowLeft, ArrowRight, Eye, ChevronRight,
    List, Calculator, ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Button } from "@/components/ui/primitives/button";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { useToast } from "@/hooks/useToast";
import React from "react";
import { createPortal } from "react-dom";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/enhanced/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import {
    useArticleViewTrack,
    useScrollDepthTrack,
    useReadingTimeTrack,
    trackCtaClick,
    trackShareClick,
} from "@/hooks/useBlogTracking";

/* ─── Style constants ─── */
const CRIMSON = "#C41230";
const GOLD = "#C6A15B";

const cleanTitle = (title: string) => {
    if (!title) return "";
    let cleaned = title
        .replace(/&#8211;/g, "–")
        .replace(/&#8212;/g, "—")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    cleaned = cleaned.replace(/\s*[—\-–]\s*Cross Angle Interior\s*$/i, "");
    return cleaned;
};

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image_url?: string;
    cover_image?: string;
    created_at: string;
    read_time_minutes?: number;
    view_count?: number;
    category?: string;
    author?: string;
    tags?: string[];
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

/* ═══════════════════════════════════════════════════════════════
   READING PROGRESS BAR + TIME REMAINING
   ═══════════════════════════════════════════════════════════════ */
const ReadingProgressBar = ({ totalMinutes }: { totalMinutes: number }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handler = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
        };
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const remaining = Math.max(0, Math.ceil(totalMinutes * (1 - progress / 100)));

    return createPortal(
        <div className="fixed top-0 left-0 right-0 z-[60]">
            <div
                role="progressbar"
                aria-label="Reading progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-[3px]"
                style={{ background: "rgba(255,255,255,0.04)" }}
            >
                <motion.div
                    className="h-full origin-left"
                    style={{
                        background: `linear-gradient(90deg, ${CRIMSON} 0%, ${GOLD} 100%)`,
                        width: `${progress}%`
                    }}
                    transition={{ duration: 0.08 }}
                />
            </div>
            {/* Time remaining pill — only shows after scrolling past header */}
            <AnimatePresence>
                {progress > 5 && progress < 95 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-[3px] right-4 mt-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white/50 font-sans"
                        style={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        ~{remaining} min left
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

/* ═══════════════════════════════════════════════════════════════
   STICKY ARTICLE NAV BAR
   ═══════════════════════════════════════════════════════════════ */
const StickyArticleBar = ({ post }: { post: BlogPost }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = () => setVisible(window.scrollY > 350);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return createPortal(
        <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: visible ? 0 : -48, opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-[3px] left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-12 border-b"
            style={{ background: "rgba(6,6,6,0.97)", borderColor: "#1c1c1c", backdropFilter: "blur(16px)" }}
        >
            <Link to="/blog" className="flex items-center gap-2 text-[12px] text-white/50 hover:text-white transition-colors font-sans">
                <ArrowLeft className="w-3.5 h-3.5" />
                Articles
            </Link>
            <span className="text-[12px] text-white/40 font-sans line-clamp-1 max-w-sm hidden md:block">
                {cleanTitle(post.title)}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-white/30 font-sans">
                {post.read_time_minutes && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time_minutes} min</span>
                )}
            </div>
        </motion.div>,
        document.body
    );
};

/* ═══════════════════════════════════════════════════════════════
   TABLE OF CONTENTS (Sticky Left Sidebar)
   ═══════════════════════════════════════════════════════════════ */
const TableOfContents = ({ items, activeId }: { items: TocItem[]; activeId: string }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = () => {
            const scrollY = window.scrollY;
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const hideThreshold = Math.max(docH - 1500, docH * 0.75);
            setVisible(scrollY > 700 && scrollY < hideThreshold);
        };
        window.addEventListener("scroll", handler, { passive: true });
        handler();
        return () => window.removeEventListener("scroll", handler);
    }, []);

    if (items.length < 2) return null;

    return (
        <nav
            aria-label="Table of contents"
            className={`w-full transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
        >
            <div className="py-2 pr-2">
                <div className="flex items-center gap-2 mb-5">
                    <List className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">In This Article</span>
                </div>
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {items.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={`block py-1 text-[12.5px] leading-snug transition-all duration-200 border-l-2 ${
                                item.level === 3 ? "pl-5" : "pl-3.5"
                            } ${
                                activeId === item.id
                                    ? "text-white/90 border-[#C41230] font-medium"
                                    : "text-white/35 border-transparent hover:text-white/60 hover:border-white/10"
                            }`}
                        >
                            {item.text}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};

/* ═══════════════════════════════════════════════════════════════
   IN-ARTICLE LEAD MAGNET CTA (Sticky Right Sidebar)
   ═══════════════════════════════════════════════════════════════ */
const InArticleLeadCTA = () => {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (dismissed) return;
        const handler = () => {
            const scrollY = window.scrollY;
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            if (docH <= 0) return;
            const pct = scrollY / docH;
            const hideThreshold = Math.max(docH - 1500, docH * 0.75);
            setVisible(pct > 0.25 && scrollY < hideThreshold);
        };
        window.addEventListener("scroll", handler, { passive: true });
        handler();
        return () => window.removeEventListener("scroll", handler);
    }, [dismissed]);

    if (dismissed) return null;

    return (
        <div
            className={`w-full transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
            <div
                className="rounded-2xl p-5 border shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative"
                style={{ background: "#111", borderColor: "#222" }}
            >
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-2 right-3 text-white/20 hover:text-white/60 text-xs transition-colors"
                    aria-label="Dismiss"
                >
                    ✕
                </button>
                <div className="flex items-center gap-2.5 mb-3">
                    <Calculator className="w-5 h-5" style={{ color: CRIMSON }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: CRIMSON }}>
                        Free Tool
                    </span>
                </div>
                <p className="text-[14px] font-serif font-bold text-white mb-1.5">
                    Calculate Your Interior Budget
                </p>
                <p className="text-[12px] text-white/40 mb-4 leading-relaxed">
                    Get an instant cost estimate for your turnkey interior project — no signup needed.
                </p>
                <Link
                    to="/estimate"
                    onClick={() => trackCtaClick("", "in_article_estimator")}
                    className="block w-full text-center py-2.5 rounded-full text-[12px] font-semibold transition-all duration-200 hover:opacity-90"
                    style={{ background: CRIMSON, color: "#fff" }}
                >
                    Get Free Estimate →
                </Link>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   BLOG DETAIL PAGE
   ═══════════════════════════════════════════════════════════════ */
const BlogDetailPage = () => {
    const { slug } = useParams();
    const { toast } = useToast();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
    const [nextPost, setNextPost] = useState<BlogPost | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [tocItems, setTocItems] = useState<TocItem[]>([]);
    const [activeHeadingId, setActiveHeadingId] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            try {
                const { data, error } = await supabase
                    .from("blog_posts")
                    .select("*")
                    .eq("slug", slug)
                    .single();
                if (error) throw error;
                setPost(data as unknown as BlogPost);

                // Fetch related + prev/next
                if (data) {
                    const { data: allPosts } = await supabase
                        .from("blog_posts")
                        .select("*")
                        .eq("status", "published")
                        .order("published_at", { ascending: false });

                    if (allPosts) {
                        const typedPosts = allPosts as unknown as BlogPost[];
                        const currentIdx = typedPosts.findIndex(p => p.slug === slug);
                        setPrevPost(currentIdx > 0 ? typedPosts[currentIdx - 1] : null);
                        setNextPost(currentIdx < typedPosts.length - 1 ? typedPosts[currentIdx + 1] : null);
                        setRelatedPosts(
                            typedPosts.filter(p => p.slug !== slug).slice(0, 3)
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    /* ── View count ── */
    useEffect(() => {
        if (!slug) return;
        const sessionKey = `blog_viewed_${slug}`;
        if (sessionStorage.getItem(sessionKey)) return;
        sessionStorage.setItem(sessionKey, "1");
        // @ts-ignore - Supabase type might not be updated
        supabase.rpc("increment_blog_view", { post_slug: slug }).then(({ error }) => {
            if (error) console.warn("View increment failed:", error.message);
        });
    }, [slug]);

    /* ── Extract Table of Contents from rendered HTML ── */
    useEffect(() => {
        if (!contentRef.current) return;

        // Hack to remove scraped WordPress metadata links from the top of the article body
        const firstChildren = Array.from(contentRef.current.children).slice(0, 8);
        firstChildren.forEach(child => {
            const text = child.textContent?.trim() || "";
            // Check if it's the exact scraped metadata strings
            if (
                text === "Interior Design" || 
                text === "Uncategorized" ||
                /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/i.test(text)
            ) {
                (child as HTMLElement).style.display = "none";
            }
        });

        const headings = contentRef.current.querySelectorAll("h2, h3, strong");
        const items: TocItem[] = [];
        headings.forEach((el, i) => {
            const text = el.textContent?.trim() || "";
            if (!text || text.length < 5 || text.length > 120) return;
            // Assign an id if missing
            const id = el.id || `heading-${i}`;
            el.id = id;
            const level = el.tagName === "H3" ? 3 : 2;
            items.push({ id, text, level });
        });
        setTocItems(items);
    }, [post, isLoading]);

    /* ── Track active heading for ToC highlight ── */
    useEffect(() => {
        if (tocItems.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter(e => e.isIntersecting);
                if (visible.length > 0) {
                    setActiveHeadingId(visible[0].target.id);
                }
            },
            { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
        );
        tocItems.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [tocItems]);

    useGSAP(() => {
        if (!isLoading && post) {
            gsap.from(".blog-header-content > *", {
                y: 24, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out"
            });
            if (post.cover_image) {
                gsap.to(".blog-cover-parallax", {
                    y: 40, ease: "none",
                    scrollTrigger: {
                        trigger: ".blog-cover-parallax",
                        start: "top bottom", end: "bottom top", scrub: true
                    }
                });
            }
        }
    }, [isLoading, post]);

    useArticleViewTrack(post?.id);
    useScrollDepthTrack(post?.id);
    useReadingTimeTrack(post?.id);

    const handleShare = useCallback(async (platform?: string) => {
        const url = window.location.href;
        const title = post?.title || "";
        if (platform === "linkedin") {
            trackShareClick(post?.id || "", "linkedin");
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        } else if (platform === "whatsapp") {
            trackShareClick(post?.id || "", "whatsapp");
            const text = encodeURIComponent(title + " " + url);
            window.open(`https://wa.me/?text=${text}`, "_blank");
        } else {
            trackShareClick(post?.id || "", "copy");
            await navigator.clipboard.writeText(url);
            toast({ title: "Link copied!", description: "Article URL copied to clipboard." });
        }
    }, [post, toast]);

    const handleCtaClick = () => {
        if (post?.id) trackCtaClick(post.id, "consultation");
    };

    /* ── Computed values ── */
    const readMinutes = post?.read_time_minutes || Math.max(3, Math.ceil((post?.content?.length || 1000) / 1200));
    const authorName = post?.author || "CrossAngle Editorial";
    const authorInitial = authorName.charAt(0).toUpperCase();

    /* ══ LOADING STATE ══ */
    if (isLoading) {
        return (
            <div className="min-h-screen" style={{ background: "#050505" }}>
                <Navbar />
                <div className="container mx-auto px-4 pt-40 pb-20 max-w-3xl">
                    <Skeleton className="h-4 w-32 mb-6 rounded-full bg-zinc-800/40" />
                    <Skeleton className="h-14 w-full mb-4 bg-zinc-800/50" />
                    <Skeleton className="h-14 w-3/4 mb-8 bg-zinc-800/50" />
                    <Skeleton className="h-4 w-48 mb-16 bg-zinc-800/30" />
                </div>
                <div className="w-full h-[480px] skeleton-shimmer mb-16" />
                <div className="container mx-auto px-4 max-w-3xl space-y-5">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full bg-zinc-800/20" />)}
                </div>
                <Footer />
            </div>
        );
    }

    /* ══ NOT FOUND ══ */
    if (!post) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: "#050505" }}>
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h1 className="text-3xl font-serif font-bold mb-4 text-white">Article not found</h1>
                    <p className="mb-8 text-white/40">The article you're looking for doesn't exist or may have been moved.</p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[13px] font-semibold"
                        style={{ background: CRIMSON, color: "#fff" }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Articles
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    /* ══ MAIN RENDER ══ */
    return (
        <>
            <Helmet>
                <title>{cleanTitle(post.title)} | Cross Angle Interior</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={cleanTitle(post.title)} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={post.cover_image_url || post.cover_image || ""} />
                <meta property="og:type" content="article" />
                <link rel="canonical" href={`https://crossangleinterior.com/blog/${post.slug}`} />
            </Helmet>

            <ReadingProgressBar totalMinutes={readMinutes} />
            <StickyArticleBar post={post} />

            <main className="min-h-screen w-full font-sans overflow-clip" style={{ background: "#050505" }}>
                <Navbar />
                <ScrollToTop />

                <article className="w-full">

                    {/* ── Header ── */}
                    <div className="w-full pt-36 pb-14" style={{ background: "#000" }}>
                        <header className="container mx-auto px-4 max-w-3xl blog-header-content">

                            {/* Breadcrumb */}
                            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-white/30 text-[11px] font-sans mb-6">
                                <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
                                <ChevronRight className="w-3 h-3" />
                                <Link to="/blog" className="hover:text-white/60 transition-colors">Articles</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-white/50 line-clamp-1 max-w-[200px]">{cleanTitle(post.title)}</span>
                            </nav>

                            {/* Category badge */}
                            {post.category && (
                                <span
                                    className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6"
                                    style={{ background: `${CRIMSON}20`, color: CRIMSON, border: `1px solid ${CRIMSON}30` }}
                                >
                                    {post.category}
                                </span>
                            )}

                            {/* Title */}
                            <h1
                                className="font-serif font-bold leading-[1.12] mb-6 text-white"
                                style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
                            >
                                {cleanTitle(post.title)}
                            </h1>

                            {/* Meta + Author Row */}
                            <div className="flex items-center gap-4 flex-wrap">
                                {/* Author avatar */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-sm text-white shrink-0"
                                        style={{ background: `${CRIMSON}25`, border: `1.5px solid ${CRIMSON}35` }}
                                    >
                                        {authorInitial}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-medium text-white/80 font-sans">{authorName}</p>
                                        <p className="text-[11px] text-white/30 font-sans">
                                            {format(new Date(post.created_at), "dd MMM yyyy")}
                                        </p>
                                    </div>
                                </div>

                                <span className="w-px h-5 bg-white/10 hidden sm:block" />

                                <div className="flex items-center gap-4 text-[12px] text-white/35 font-sans">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {readMinutes} min read
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5" />
                                        {post.view_count ?? 0} views
                                    </span>
                                </div>
                            </div>
                        </header>
                    </div>

                    {/* ── Cover Image ── */}
                    {(post.cover_image_url || post.cover_image) && (
                        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 -mt-2 relative z-10 mb-14 blog-cover-parallax">
                            <div className="w-full aspect-[4/3] md:aspect-[21/9] relative overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
                                <Image
                                    src={(post.cover_image_url || post.cover_image)!}
                                    alt={post.title}
                                    className="w-full h-full"
                                    imageClassName="object-cover"
                                    loading="eager" width={1200} quality={90}
                                />
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050505] to-transparent" />
                            </div>
                        </div>
                    )}

                    {/* ── Article Content Area (Flex layout with sticky sidebars) ── */}
                    <div className="container mx-auto px-4 max-w-[1300px] flex gap-8 lg:gap-12 xl:gap-16 relative items-start pb-12">
                        
                        {/* ── Left Sidebar (TOC & Share) ── */}
                        <div className="hidden xl:block w-[220px] shrink-0 sticky top-32 z-30">
                            <TableOfContents items={tocItems} activeId={activeHeadingId} />
                            
                            <div className="mt-12">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-4">Share Article</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleShare("linkedin")}
                                        title="Share on LinkedIn"
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border hover:border-[#0077B5]/40 hover:bg-[#0077B5]/10 hover:text-[#0077B5] group"
                                        style={{ background: "#0c0c0c", borderColor: "#1e1e1e", color: "#666" }}
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = window.location.href;
                                            const text = encodeURIComponent(post.title + " " + url);
                                            window.open(`https://wa.me/?text=${text}`, "_blank");
                                            trackShareClick(post.id, "whatsapp");
                                        }}
                                        title="Share on WhatsApp"
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border hover:border-[#25D366]/40 hover:bg-[#25D366]/10 hover:text-[#25D366]"
                                        style={{ background: "#0c0c0c", borderColor: "#1e1e1e", color: "#666" }}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.662-1.218A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.335-.245-3.476.908.939-3.427-.268-.361A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleShare()}
                                        title="Copy article link"
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border hover:border-[#C41230]/40 hover:bg-[#C41230]/10 hover:text-[#C41230]"
                                        style={{ background: "#0c0c0c", borderColor: "#1e1e1e", color: "#666" }}
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Main Article Body ── */}
                        <div className="flex-1 max-w-2xl mx-auto w-full min-w-0">

                        {/* "In This Article" summary box for mobile (desktop uses floating ToC) */}
                        {tocItems.length >= 3 && (
                            <div className="xl:hidden mb-10 rounded-2xl border p-5" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <List className="w-3.5 h-3.5 text-white/40" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">In This Article</span>
                                </div>
                                <ol className="space-y-2 list-decimal list-inside">
                                    {tocItems.filter(t => t.level === 2).map(item => (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                }}
                                                className="text-[13px] text-white/55 hover:text-white transition-colors"
                                            >
                                                {item.text}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Excerpt lead removed to avoid duplicated text from scraped content */}

                        {/* Body content */}
                        <div
                            ref={contentRef}
                            className="blog-prose"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                        />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-12 mb-10">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="text-[11px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full border"
                                        style={{ borderColor: "#2a2a2a", color: "#666" }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* ── Author card ── */}
                        <div className="mt-10 mb-12 flex items-center gap-5 p-5 rounded-2xl border"
                            style={{ background: "#0c0c0c", borderColor: "#1e1e1e" }}
                        >
                            <div
                                className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center font-serif font-bold text-xl text-white"
                                style={{ background: `${CRIMSON}20`, border: `1.5px solid ${CRIMSON}40` }}
                            >
                                {authorInitial}
                            </div>
                            <div>
                                <p className="text-[11px] text-white/30 uppercase tracking-widest font-sans mb-0.5">Written by</p>
                                <p className="text-[15px] font-semibold text-white font-serif">{authorName}</p>
                                <p className="text-[12px] text-white/40 font-sans mt-0.5">Cross Angle Interior · Design Team</p>
                            </div>
                        </div>

                        {/* ── Share Bar ── */}
                        <div className="border-t border-b py-7 flex flex-col sm:flex-row items-center justify-between gap-5"
                            style={{ borderColor: "#1c1c1c" }}
                        >
                            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/50">Share</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleShare("linkedin")}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-200 border hover:border-[#0077B5]/50 hover:text-[#0077B5] hover:bg-[#0077B5]/5"
                                    style={{ borderColor: "#2a2a2a", color: "#888" }}
                                >
                                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                </button>
                                <button
                                    onClick={() => handleShare("whatsapp")}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-200 border hover:border-[#25D366]/50 hover:text-[#25D366] hover:bg-[#25D366]/5"
                                    style={{ borderColor: "#2a2a2a", color: "#888" }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.662-1.218A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.335-.245-3.476.908.939-3.427-.268-.361A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => handleShare()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-200 border hover:border-[#C41230]/40 hover:text-[#C41230] hover:bg-[#C41230]/5"
                                    style={{ borderColor: "#2a2a2a", color: "#888" }}
                                >
                                    <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                                </button>
                            </div>
                        </div>

                        {/* ── Consultation CTA ── */}
                        <div
                            className="mt-16 text-center py-12 px-8 rounded-2xl border"
                            style={{ background: `linear-gradient(135deg, ${CRIMSON}10 0%, #0a0a0a 100%)`, borderColor: `${CRIMSON}25` }}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 font-sans mb-4 block">Ready to transform?</span>
                            <h3 className="font-serif text-2xl font-bold mb-3 text-white">Inspired by this article?</h3>
                            <p className="text-[14px] mb-8 mx-auto max-w-sm text-white/50 leading-relaxed">
                                Partner with CrossAngle Interior to bring exceptional design intelligence to your next project.
                            </p>
                            <Link to="/contact-us" onClick={handleCtaClick}>
                                <button
                                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_8px_32px_rgba(196,18,48,0.3)]"
                                    style={{ background: CRIMSON, color: "#fff" }}
                                >
                                    Request Consultation
                                </button>
                            </Link>
                        </div>
                        </div>
                        
                        {/* ── Right Sidebar (CTA) ── */}
                        <div className="hidden lg:block w-[260px] xl:w-[280px] shrink-0 sticky top-32 z-30">
                            <InArticleLeadCTA />
                        </div>
                    </div>

                    {/* ── Previous / Next Article Navigation ── */}
                    {(prevPost || nextPost) && (
                        <div className="border-t" style={{ borderColor: "#111", background: "#030303" }}>
                            <div className="container mx-auto px-4 max-w-4xl">
                                <div className={`grid ${prevPost && nextPost ? "grid-cols-2" : "grid-cols-1"} divide-x divide-white/[0.06]`}>
                                    {prevPost && (
                                        <Link
                                            to={`/blog/${prevPost.slug}`}
                                            className="group flex flex-col gap-2 py-10 pr-8 hover:bg-white/[0.01] transition-colors"
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 flex items-center gap-1.5">
                                                <ArrowLeft className="w-3 h-3" /> Previous
                                            </span>
                                            <h4 className="text-[14px] font-serif font-semibold text-white/60 group-hover:text-white transition-colors line-clamp-2">
                                                {cleanTitle(prevPost.title)}
                                            </h4>
                                        </Link>
                                    )}
                                    {nextPost && (
                                        <Link
                                            to={`/blog/${nextPost.slug}`}
                                            className={`group flex flex-col gap-2 py-10 ${prevPost ? "pl-8 text-right items-end" : "pr-8"} hover:bg-white/[0.01] transition-colors`}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 flex items-center gap-1.5">
                                                Next <ArrowRight className="w-3 h-3" />
                                            </span>
                                            <h4 className="text-[14px] font-serif font-semibold text-white/60 group-hover:text-white transition-colors line-clamp-2">
                                                {cleanTitle(nextPost.title)}
                                            </h4>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Related Articles ── */}
                    {relatedPosts.length > 0 && (
                        <div className="w-full pt-20 pb-24 border-t" style={{ background: "#030303", borderColor: "#111" }}>
                            <div className="container mx-auto px-4 max-w-5xl">
                                <div className="flex items-center gap-3 mb-12">
                                    <span className="w-1 h-6 rounded-full" style={{ background: CRIMSON }} />
                                    <h2 className="font-serif text-2xl font-bold text-white">More Articles</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    {relatedPosts.map(rp => (
                                        <Link key={rp.id} to={`/blog/${rp.slug}`} className="group block">
                                            <div className="aspect-[16/10] overflow-hidden mb-4 rounded-xl shadow-lg">
                                                <Image
                                                    src={rp.cover_image}
                                                    alt={rp.title}
                                                    className="w-full h-full"
                                                    imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    width={420} height={262}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] block mb-2" style={{ color: CRIMSON }}>
                                                {rp.category || "Design"}
                                            </span>
                                            <h3 className="text-[14px] font-serif font-semibold text-white/85 line-clamp-2 group-hover:text-[#C41230] transition-colors leading-snug mb-2">
                                                {cleanTitle(rp.title)}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                                                <Clock className="w-3 h-3" />
                                                {Math.max(3, Math.ceil((rp.excerpt?.length || 200) / 200))} min read
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="text-center mt-14">
                                    <Link
                                        to="/blog"
                                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[13px] font-semibold border transition-all duration-200 hover:border-white/20 hover:text-white"
                                        style={{ borderColor: "#2a2a2a", color: "#777" }}
                                    >
                                        <ArrowLeft className="w-4 h-4" /> All Articles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </article>

                <Footer />
            </main>

            {/* ── Blog prose + scrollbar-hide styles ── */}
            <style>{`
                .blog-prose {
                    color: #D4D4D4;
                    font-size: 1.0625rem;
                    line-height: 1.85;
                    font-family: 'Inter', Georgia, serif;
                }
                .blog-prose h1, .blog-prose h2, .blog-prose h3,
                .blog-prose h4, .blog-prose h5, .blog-prose h6 {
                    color: #ffffff;
                    font-family: 'Playfair Display', Georgia, serif;
                    margin-top: 2.25em;
                    margin-bottom: 0.75em;
                    line-height: 1.2;
                    font-weight: 700;
                    scroll-margin-top: 80px;
                }
                .blog-prose h2 { font-size: 1.5rem; }
                .blog-prose h3 { font-size: 1.25rem; }
                .blog-prose p { margin-bottom: 1.6em; }
                /* Hide WordPress imported metadata */
                .blog-prose .entry-meta, 
                .blog-prose .posted-on, 
                .blog-prose .byline,
                .blog-prose .-admin-primary,
                .blog-prose header { display: none !important; }
                .blog-prose a {
                    color: ${CRIMSON};
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    text-decoration-color: ${CRIMSON}60;
                    transition: text-decoration-color 0.2s;
                }
                .blog-prose a:hover { text-decoration-color: ${CRIMSON}; }
                .blog-prose blockquote {
                    border-left: 3px solid ${CRIMSON};
                    padding-left: 1.25rem;
                    margin: 2em 0;
                    color: #aaa;
                    font-style: italic;
                    font-size: 1.1rem;
                }
                .blog-prose ul, .blog-prose ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1.6em;
                }
                .blog-prose li { margin-bottom: 0.6em; }
                .blog-prose ul li::marker { color: ${CRIMSON}; }
                .blog-prose ol li::marker { color: ${CRIMSON}; font-weight: 600; }
                .blog-prose img {
                    width: 100%;
                    border-radius: 12px;
                    margin: 2rem 0;
                    object-fit: cover;
                }
                .blog-prose strong { color: #fff; font-weight: 600; }
                .blog-prose em { color: #bbb; }
                .blog-prose hr {
                    border: none;
                    border-top: 1px solid #1e1e1e;
                    margin: 3em 0;
                }
                .blog-prose code {
                    font-size: 0.875rem;
                    background: #111;
                    border: 1px solid #2a2a2a;
                    padding: 0.15em 0.5em;
                    border-radius: 4px;
                    color: #ccc;
                }
                .blog-prose pre {
                    background: #0d0d0d;
                    border: 1px solid #1e1e1e;
                    border-radius: 10px;
                    padding: 1.5rem;
                    overflow-x: auto;
                    margin: 2rem 0;
                }
                .blog-prose pre code {
                    background: transparent;
                    border: none;
                    padding: 0;
                    font-size: 0.875rem;
                }
                .blog-prose figure { margin: 2rem 0; }
                .blog-prose figcaption {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #555;
                    margin-top: 0.5rem;
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
};

export default BlogDetailPage;
