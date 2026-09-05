import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, Eye, ArrowRight, ArrowDown } from "lucide-react";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { Blog } from "@/lib/api";
import { cleanTitle, readTime, formatViews, CRIMSON } from "../_utils/blogUtils";

interface BlogGridProps {
  isLoading: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  filteredLength: number;
  paginatedPosts: Blog[];
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
}

export function BlogGrid({
  isLoading,
  activeCategory,
  setActiveCategory,
  setSearchQuery,
  filteredLength,
  paginatedPosts,
  visibleCount,
  setVisibleCount,
}: BlogGridProps) {
  return (
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
                className={`rounded-2xl overflow-hidden border group transition-all duration-400 hover:border-[#D4AF37]/30 hover:shadow-[0_12px_40px_rgba(212,175,55,0.07)] ${i === 0 ? "md:col-span-2" : ""}`}
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
                    <h3 className={`font-serif font-semibold text-white group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2 ${i === 0 ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
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
      {filteredLength > visibleCount && (
        <div className="flex items-center justify-center mt-16 w-full relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "#1A1A1A" }}></div>
          </div>
          <button
            onClick={() => setVisibleCount(prev => prev + 2)}
            className="group relative z-10 flex items-center gap-2.5 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-[#D4AF37]"
            style={{ background: "#000", color: "#666" }}
          >
            <span>Load More</span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
