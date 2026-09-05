import { Link } from "react-router-dom";
import { Sparkles, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { Blog } from "@/lib/api";
import { trackTagClick } from "@/hooks/useBlogTracking";
import { cleanTitle, readTime, CRIMSON, GOLD, POPULAR_TAGS } from "../_utils/blogUtils";

interface BlogSidebarProps {
  isLoading: boolean;
  categoryCounts: Record<string, number>;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  setVisibleCount: (count: number) => void;
  setSearchQuery: (q: string) => void;
  blogPosts: Blog[];
}

export function BlogSidebar({
  isLoading,
  categoryCounts,
  activeCategory,
  setActiveCategory,
  setVisibleCount,
  setSearchQuery,
  blogPosts,
}: BlogSidebarProps) {
  return (
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
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all hover:border-[#D4AF37]/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
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
                <h4 className="text-[13px] font-medium text-white/80 group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
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
  );
}
