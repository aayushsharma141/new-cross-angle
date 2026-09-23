import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../_utils/blogUtils";
import { Container, EASE_OUT_EXPO } from "@/components/editorial";
import { cn } from "@/lib/utils";

interface BlogFilterBarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: "latest" | "trending";
  setSortBy: (sort: "latest" | "trending") => void;
  setVisibleCount: (count: number) => void;
}

const tab =
  "relative shrink-0 py-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 focus-visible:outline-none focus-visible:text-primary";

/** Category row, search and sort — one hairline band, sticky under the header. */
export function BlogFilterBar({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  setVisibleCount,
}: BlogFilterBarProps) {
  return (
    <Container>
      <div className="sticky top-[72px] z-30 flex flex-col gap-4 border-b border-white/10 bg-[var(--s-canvas-primary)]/90 py-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div
          role="tablist"
          aria-label="Filter articles by category"
          className="-mx-6 flex items-center gap-x-8 overflow-x-auto whitespace-nowrap px-6 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                type="button"
                id={`tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                aria-selected={isActive}
                aria-label={`Filter by ${cat}`}
                onClick={() => { setActiveCategory(cat); setVisibleCount(5); }}
                className={cn(tab, isActive ? "text-white" : "text-white/40 hover:text-white")}
              >
                {cat}
                {isActive && (
                  <motion.span
                    layoutId="blogFilterUnderline"
                    aria-hidden="true"
                    className="absolute -bottom-[21px] left-0 h-px w-full bg-primary"
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-8">
          <div className="relative flex items-center">
            <Search aria-hidden="true" className="absolute left-0 h-3.5 w-3.5 text-white/30" />
            <label htmlFor="blog-search" className="sr-only">Search articles</label>
            <input
              id="blog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(5); }}
              placeholder="Search"
              className="w-32 rounded-none border-0 border-b border-white/15 bg-transparent py-1 pl-6 text-[13px] font-light text-white placeholder:text-white/30 transition-colors focus:border-primary focus:outline-none lg:w-40"
            />
          </div>

          <div className="flex items-center gap-4">
            {(["latest", "trending"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sortBy === option}
                onClick={() => { setSortBy(option); setVisibleCount(5); }}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-none focus-visible:text-primary",
                  sortBy === option ? "text-primary" : "text-white/40 hover:text-white",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
