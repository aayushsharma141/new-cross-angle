import { Search } from "lucide-react";
import { CATEGORIES, CRIMSON } from "../_utils/blogUtils";

interface BlogFilterBarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: "latest" | "trending";
  setSortBy: (sort: "latest" | "trending") => void;
  setVisibleCount: (count: number) => void;
}

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
    <section className="sticky top-0 z-30 py-4 border-b" style={{ borderColor: "#1f1f1f", background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <label className="relative">
              <span className="sr-only">Search articles</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#555" }} />
              <input
                type="search"
                placeholder="Search articles…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setVisibleCount(5); }}
                className="pl-9 pr-4 py-2.5 text-[13px] rounded-full border focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 w-48"
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
  );
}
