import { useState, useEffect, useMemo } from "react";
import { api, Blog } from "@/lib/api";

export function useBlogList() {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "trending">("latest");
  const [visibleCount, setVisibleCount] = useState(5);

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

  return {
    blogPosts,
    isLoading,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    visibleCount,
    setVisibleCount,
    filtered,
    featuredPost,
    paginatedPosts,
    trendingPosts,
    categoryCounts
  };
}
