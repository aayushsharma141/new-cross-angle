/**
 * useBlogPost.ts — Data hook for a single blog article.
 *
 * Owns:
 * - Post fetching by slug/UUID
 * - Related posts + prev/next navigation
 * - Table of contents extraction from rendered DOM
 * - Active heading tracking via IntersectionObserver
 * - GSAP entrance animation
 *
 * Returns everything BlogDetailPage needs to render.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import {
  useArticleViewTrack,
  useScrollDepthTrack,
  useReadingTimeTrack,
  trackCtaClick,
  trackShareClick,
} from "@/hooks/useBlogTracking";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url?: string;
  cover_image?: string;
  /**
   * The column that actually exists on `blog_posts`. `cover_image_url` is only
   * populated by fetchAndStitchDamUsages (which the list query calls and this
   * hook does not), and `cover_image` belongs to the separate `blogs` table —
   * so without this field no article page ever rendered a cover.
   */
  deprecated_cover_image_url?: string;
  created_at: string;
  read_time_minutes?: number;
  view_count?: number;
  category?: string;
  author?: string;
  tags?: string[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function useBlogPost() {
  const { slug } = useParams();
  const { toast } = useToast();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
  const [nextPost, setNextPost] = useState<BlogPost | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Data fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
        let query = supabase.from("blog_posts").select("*");
        query = isUuid ? query.eq("id", slug) : query.eq("slug", slug);
        const { data, error } = await query.maybeSingle();
        if (error || !data) throw error || new Error("Not found");
        setPost(data as unknown as BlogPost);

        const { data: allPosts } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (allPosts) {
          const typed = allPosts as unknown as BlogPost[];
          const idx = typed.findIndex((p) => p.slug === slug || p.id === slug);
          setPrevPost(idx > 0 ? typed[idx - 1] : null);
          setNextPost(idx < typed.length - 1 ? typed[idx + 1] : null);
          setRelatedPosts(typed.filter((p) => p.slug !== slug && p.id !== slug).slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // ── Table of contents ────────────────────────────────────────────────────
  useEffect(() => {
    if (!contentRef.current) return;

    const firstChildren = Array.from(contentRef.current.children).slice(0, 8);
    firstChildren.forEach((child) => {
      const text = child.textContent?.trim() || "";
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
      const id = el.id || `heading-${i}`;
      el.id = id;
      items.push({ id, text, level: el.tagName === "H3" ? 3 : 2 });
    });
    setTocItems(items);
  }, [post, isLoading]);

  // ── Active heading tracker ───────────────────────────────────────────────
  useEffect(() => {
    if (tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveHeadingId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 },
    );
    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocItems]);

  // ── Entrance animation ───────────────────────────────────────────────────
  useGSAP(() => {
    if (!isLoading && post) {
      gsap.from(".blog-header-content > *", { y: 24, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" });
      if (post.cover_image) {
        gsap.to(".blog-cover-parallax", {
          y: 40, ease: "none",
          scrollTrigger: { trigger: ".blog-cover-parallax", start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    }
  }, [isLoading, post]);

  // ── Analytics ────────────────────────────────────────────────────────────
  useArticleViewTrack(post?.id);
  useScrollDepthTrack(post?.id);
  useReadingTimeTrack(post?.id);

  // ── Share handler ────────────────────────────────────────────────────────
  const handleShare = useCallback(async (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || "";
    if (platform === "linkedin") {
      trackShareClick(post?.id || "", "linkedin");
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "whatsapp") {
      trackShareClick(post?.id || "", "whatsapp");
      window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, "_blank");
    } else {
      trackShareClick(post?.id || "", "copy");
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Article URL copied to clipboard." });
    }
  }, [post, toast]);

  const handleCtaClick = useCallback(() => {
    if (post?.id) trackCtaClick(post.id, "consultation");
  }, [post]);

  return {
    post,
    isLoading,
    relatedPosts,
    prevPost,
    nextPost,
    tocItems,
    activeHeadingId,
    contentRef,
    handleShare,
    handleCtaClick,
  };
}
