import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import { Blog } from "@/lib/api";
import { cleanTitle, cleanExcerpt, readTime, formatViews } from "../_utils/blogUtils";
import { Body, EASE_OUT_EXPO, textLinkClass } from "@/components/editorial";

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
  setActiveCategory,
  setSearchQuery,
  filteredLength,
  paginatedPosts,
  visibleCount,
  setVisibleCount,
}: BlogGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-[4/3] w-full animate-pulse bg-white/[0.03]" />
        ))}
      </div>
    );
  }

  if (paginatedPosts.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="mb-6 font-display text-xl font-light italic text-white/40">No articles match that search.</p>
        <button
          type="button"
          onClick={() => { setActiveCategory("All"); setSearchQuery(""); setVisibleCount(5); }}
          className={textLinkClass}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {paginatedPosts.map((post, i) => (
            <motion.li
              key={post.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: Math.min(i, 5) * 0.05, ease: EASE_OUT_EXPO }}
            >
              <Link to={`/blog/${post.slug}`} className="group block focus-visible:outline-none">
                <div className="mb-6 aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                  <Image
                    src={post.image}
                    alt={cleanTitle(post.title)}
                    className="h-full w-full"
                    imageClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    width={900}
                    height={675}
                  />
                </div>

                <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                  <span>{post.category || "Interior Design"}</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                  <span>{readTime(post)} read</span>
                  {post.view_count > 0 && (
                    <>
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                      <span>{formatViews(post.view_count)} views</span>
                    </>
                  )}
                </p>

                <h3 className="font-display text-2xl leading-snug text-white transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary">
                  {cleanTitle(post.title)}
                </h3>

                {cleanExcerpt(post.excerpt, post.category) && (
                  <Body className="mt-3 line-clamp-3 text-sm">{cleanExcerpt(post.excerpt, post.category)}</Body>
                )}
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {visibleCount < filteredLength && (
        <div className="mt-16 border-t border-white/10 pt-10 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 6)}
            className={textLinkClass}
          >
            Load more articles <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
