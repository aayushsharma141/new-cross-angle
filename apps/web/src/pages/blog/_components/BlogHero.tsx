import { Link } from "react-router-dom";
import { Clock, Eye, ArrowRight } from "lucide-react";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { Blog } from "@/lib/api";
import { cleanTitle, readTime, formatViews, CRIMSON } from "../_utils/blogUtils";

interface BlogHeroProps {
  featuredPost?: Blog;
  isLoading: boolean;
}

export function BlogHero({ featuredPost, isLoading }: BlogHeroProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (!featuredPost) return null;

  return (
    <section className="relative pt-24 pb-0 overflow-hidden" style={{ minHeight: "80vh" }}>
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
  );
}
