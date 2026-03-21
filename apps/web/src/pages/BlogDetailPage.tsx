import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { Clock, Linkedin, Twitter, LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import {
    useArticleViewTrack,
    useScrollDepthTrack,
    useReadingTimeTrack,
    trackCtaClick,
    trackShareClick,
} from "@/hooks/useBlogTracking";

/* ─── Style constants ─── */
const GOLD = "#C6A15B";

// Clean up HTML entities and repeating brand names
const cleanTitle = (title: string) => {
    if (!title) return "";
    let cleaned = title
        .replace(/&#8211;/g, "–") // EN DASH
        .replace(/&#8212;/g, "—") // EM DASH
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Remove variations of " - Cross Angle Interior" at the end
    cleaned = cleaned.replace(/\s*[—\-–]\s*Cross Angle Interior\s*$/i, "");
    return cleaned;
};

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string;
    created_at: string;
    read_time_minutes: number;
    views_count: number;
    category?: string;
    author?: string;
    tags?: string[];
}

/* ═══════════════════════════════════════════════════════════════
   READING PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
const ReadingProgressBar = () => {
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

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]" style={{ background: "#111" }}>
            <motion.div
                className="h-full"
                style={{ background: `linear-gradient(90deg, ${GOLD}, #E8D5A3)`, width: `${progress}%` }}
                transition={{ duration: 0.1 }}
            />
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

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            try {
                const { data, error } = await supabase
                    .from("blogs")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (error) throw error;
                setPost(data);

                // Fetch related posts
                if (data?.category) {
                    const { data: related } = await supabase
                        .from("blogs")
                        .select("*")
                        .eq("is_published", true)
                        .neq("slug", slug)
                        .limit(3);
                    setRelatedPosts(related || []);
                }
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    /* ── Engagement Tracking ── */
    useArticleViewTrack(post?.id);
    useScrollDepthTrack(post?.id);
    useReadingTimeTrack(post?.id);

    /* ── Share handlers ── */
    const handleShare = useCallback(async (platform?: string) => {
        const url = window.location.href;
        const title = post?.title || "";

        if (platform === "linkedin") {
            trackShareClick(post?.id || "", "linkedin");
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        } else if (platform === "twitter") {
            trackShareClick(post?.id || "", "twitter");
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank");
        } else {
            trackShareClick(post?.id || "", "copy");
            await navigator.clipboard.writeText(url);
            toast({ title: "Link copied", description: "Article link copied to clipboard" });
        }
    }, [post, toast]);

    /* ── CTA click ── */
    const handleCtaClick = () => {
        if (post?.id) trackCtaClick(post.id, "consultation");
    };

    /* ═══════════════ LOADING STATE ═══════════════ */
    if (isLoading) {
        return (
            <div className="min-h-screen" style={{ background: "#222" }}>
                <Navbar />
                <div className="container mx-auto px-4 pt-40 pb-20 max-w-4xl flex flex-col items-center text-center">
                    <Skeleton className="h-4 w-64 mb-6 bg-white/10" />
                    <Skeleton className="h-4 w-24 mb-6 bg-white/10" />
                    <Skeleton className="h-16 md:h-20 w-full mb-8 bg-white/10" />
                    <Skeleton className="h-4 w-40 mb-12 bg-white/10" />
                </div>
                <Skeleton className="w-full h-[500px] md:h-[600px] mb-16 max-w-5xl mx-auto rounded-none bg-white/10" />
                <div className="container mx-auto px-4 max-w-3xl space-y-4">
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                </div>
                <Footer />
            </div>
        );
    }

    /* ═══════════════ NOT FOUND ═══════════════ */
    if (!post) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: "#222" }}>
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-3xl font-serif font-bold mb-4 text-white">Article not found</h1>
                    <p className="mb-8" style={{ color: "#888" }}>The article you're looking for doesn't exist.</p>
                    <Button asChild style={{ background: GOLD, color: "#000" }}>
                        <Link to="/blog">Back to Articles</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    /* ═══════════════ MAIN RENDER ═══════════════ */
    return (
        <>
            <Helmet>
                <title>{cleanTitle(post.title)} | Cross Angle Interior</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={cleanTitle(post.title)} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={post.cover_image} />
                <meta property="og:type" content="article" />
                <link rel="canonical" href={`https://crossangleinterior.com/blog/${post.slug}`} />
            </Helmet>

            <ReadingProgressBar />

            <main className="min-h-screen w-full font-sans overflow-hidden" style={{ background: "#000000" }}>
                <Navbar />
                <ScrollToTop />

                <article className="w-full">
                    {/* Header Section (Dark Background) */}
                    <div className="w-full pt-40 pb-16" style={{ background: "#000000" }}>
                        <header className="container mx-auto px-4 max-w-4xl text-center">
                            {/* Category Tag */}
                            {post.category && (
                                <span
                                    className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-6"
                                    style={{ color: "#4ade80" }} // Green accent from reference image
                                >
                                    {post.category}
                                </span>
                            )}

                            {/* Huge Centered Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-8 text-white text-balance mx-auto" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                                {cleanTitle(post.title)}
                            </h1>

                            {/* Date  */}
                            <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-widest font-mono" style={{ color: "#999" }}>
                                <span>{format(new Date(post.created_at), "dd MMM yyyy")}</span>
                                {post.read_time_minutes && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.read_time_minutes} MIN READ
                                        </span>
                                    </>
                                )}
                            </div>
                        </header>
                    </div>

                    {/* Edge-to-edge / Max-W Cover Image */}
                    {post.cover_image && (
                        <div className="w-full max-w-[1280px] mx-auto px-0 md:px-8 -mt-6 relative z-10 mb-16">
                            <div className="w-full aspect-[4/3] md:aspect-[21/9] shadow-xl relative overflow-hidden bg-black">
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-[1s]"
                                    loading="eager"
                                />
                            </div>
                        </div>
                    )}

                    {/* Centered Narrow Content Section (Dark Background) */}
                    <div className="container mx-auto px-4 max-w-3xl pb-24">

                        {/* Excerpt Lead */}
                        {post.excerpt && (
                            <p className="text-xl md:text-2xl leading-relaxed text-center mb-16 font-serif italic" style={{ color: GOLD }}>
                                "{post.excerpt}"
                            </p>
                        )}

                        {/* Markdown Content - Dark Theme Adaptation */}
                        <div
                            className="prose prose-lg prose-invert max-w-none mx-auto mb-16"
                            style={{
                                color: "#E0E0E0",
                                fontFamily: "'Inter', sans-serif",
                                lineHeight: "1.9",
                                fontSize: "1.125rem"
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-16 justify-center">
                                {post.tags.map(tag => (
                                    <span key={tag} className="text-xs font-mono uppercase tracking-wider px-4 py-2 border" style={{ borderColor: "#333", color: "#888" }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Share Footer */}
                        <div className="border-t border-b py-8 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderColor: "#222" }}>
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#E0E0E0" }}>Share this article</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleShare("linkedin")} title="Share on LinkedIn" className="p-3 rounded-full hover:bg-white/5 transition-colors" style={{ color: "#888" }}>
                                    <Linkedin className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleShare("twitter")} title="Share on Twitter" className="p-3 rounded-full hover:bg-white/5 transition-colors" style={{ color: "#888" }}>
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleShare()} title="Copy link" className="p-3 rounded-full hover:bg-white/5 transition-colors" style={{ color: "#888" }}>
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Consultation CTA */}
                        <div className="mt-20 text-center py-12 px-6 shadow-sm border" style={{ background: "#111", borderColor: "#222" }}>
                            <h3 className="font-serif text-2xl font-bold mb-3" style={{ color: "#fff" }}>Inspired to transform your space?</h3>
                            <p className="text-base mb-8 mx-auto max-w-md" style={{ color: "#aaa" }}>
                                Partner with CrossAngle Interior to bring exceptional design intelligence to your next project.
                            </p>
                            <Link to="/contact-us" onClick={handleCtaClick}>
                                <Button className="px-10 py-6 text-sm font-bold uppercase tracking-widest rounded-none transition-all duration-300 hover:scale-105" style={{ background: GOLD, color: "#000" }}>
                                    Request Consultation
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* ── Related Articles (Dark Background Again) ── */}
                    {relatedPosts.length > 0 && (
                        <div className="w-full pt-20 pb-24" style={{ background: "#080808" }}>
                            <div className="container mx-auto px-4 max-w-5xl">
                                <h2 className="font-serif text-3xl font-bold text-center text-white mb-12">More Articles</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    {relatedPosts.map(rp => (
                                        <Link key={rp.id} to={`/blog/${rp.slug}`} className="group block">
                                            <div className="aspect-[4/3] overflow-hidden mb-5 shadow-lg rounded-none bg-black">
                                                <img src={rp.cover_image || "/placeholder.svg"} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" loading="lazy" />
                                            </div>
                                            <div className="text-center px-4">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] block mb-3" style={{ color: "#4ade80" }}>{rp.category || "Design"}</span>
                                                <h3 className="text-base font-serif font-semibold text-white line-clamp-3 group-hover:text-[#C6A15B] transition-colors leading-snug">
                                                    {rp.title}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </article>

                <Footer />
            </main>
        </>
    );
};

export default BlogDetailPage;
