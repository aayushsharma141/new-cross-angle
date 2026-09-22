import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Eye } from "lucide-react";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import { Blog } from "@/lib/api";
import { cleanTitle, readTime, formatViews, CRIMSON } from "../_utils/blogUtils";

interface BlogTrendingSliderProps {
  isLoading: boolean;
  trendingPosts: Blog[];
}

export function BlogTrendingSlider({ isLoading, trendingPosts }: BlogTrendingSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && sliderRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scrollWidth = sliderRef.current.scrollWidth;
        setDragConstraints({ right: 0, left: Math.min(0, -(scrollWidth - containerWidth)) });
      }
    };
    updateConstraints();
    setTimeout(updateConstraints, 300);
    const imgs = sliderRef.current?.querySelectorAll("img");
    imgs?.forEach((img) => img.addEventListener("load", updateConstraints));
    window.addEventListener("resize", updateConstraints);
    return () => {
      imgs?.forEach((img) => img.removeEventListener("load", updateConstraints));
      window.removeEventListener("resize", updateConstraints);
    };
  }, [trendingPosts]);

  if (isLoading || trendingPosts.length === 0) return null;

  return (
    <section className="py-14" style={{ background: "#060606" }}>
      <div className="container mx-auto px-4" ref={containerRef}>
        <div className="flex items-center gap-2.5 mb-8">
          <TrendingUp className="w-4 h-4" style={{ color: CRIMSON }} />
          <h2 className="font-serif text-xl font-bold text-white">Trending Articles</h2>
          <span className="text-[11px] text-white/30 font-sans ml-1">— drag to explore</span>
        </div>

        <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing">
          <motion.div
            ref={sliderRef}
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.15}
            dragTransition={{ power: 0.2, timeConstant: 200 }}
            dragMomentum
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            style={{ touchAction: "pan-y" }}
            className="flex w-max gap-5 pb-3"
          >
            {trendingPosts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug || post.id}`}
                className="flex-shrink-0 w-[280px] group block"
                draggable={false}
                onClick={(e) => { if (isDragging) e.preventDefault(); }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl overflow-hidden border transition-all duration-400 hover:border-[#D4AF37]/40 hover:shadow-[0_8px_32px_rgba(212,175,55,0.1)]"
                  style={{ background: "#111", borderColor: "#1e1e1e" }}
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full pointer-events-none"
                      imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
                      width={400} height={225}
                      draggable={false}
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CRIMSON }}>{post.category}</span>
                    <h3 className="text-[13px] font-semibold text-white/90 line-clamp-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                      {cleanTitle(post.title)}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-white/35">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime(post)} read</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(post.view_count)} views</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
