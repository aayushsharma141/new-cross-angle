import { useState, useEffect, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedUrl } from "@/lib/cdn";
import { Image } from "@/components/ui/enhanced/image";
import { serializeJsonLd } from "@/components/shared/SchemaMarkup";

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  avatar_url: string | null;
  content: string;
  rating: number | null;
  project_id: string | null;
  display_order: number;
  active: boolean;
  city: string | null;
}

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const sz = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            sz,
            i < rating
              ? "fill-site-gold text-site-gold drop-shadow-[0_0_5px_rgba(209,175,110,0.7)]"
              : "fill-white/10 text-white/10"
          )}
        />
      ))}
    </div>
  );
};

const TestimonialCard = ({
  item,
  index,
}: {
  item: Testimonial;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = item.content.length > 160;

  const getPreviewText = (text: string) => {
    if (isExpanded || !needsTruncation) return text;
    const maxLength = 160;
    const substr = text.slice(0, maxLength);
    const lastPunctuation = Math.max(substr.lastIndexOf('.'), substr.lastIndexOf('!'), substr.lastIndexOf('?'));
    if (lastPunctuation > maxLength * 0.6) {
      return text.slice(0, lastPunctuation + 1);
    }
    return substr.slice(0, substr.lastIndexOf(' ')) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5), ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative p-6 md:p-8 rounded-2xl border flex flex-col group overflow-hidden transition-all duration-500",
        "w-[300px] md:w-[380px] snap-center shrink-0",
        "h-auto min-h-[280px] md:min-h-[320px]",
        "bg-[#0d0d0c] border-white/[0.06] hover:border-site-gold/20 hover:shadow-[0_12px_40px_rgba(209,175,110,0.06)]"
      )}
    >
      <Quote
        className="absolute -top-1 right-4 w-16 h-16 transition-all duration-500 pointer-events-none opacity-[0.03] text-white group-hover:opacity-10 group-hover:text-site-gold"
      />

      {/* Stars */}
      <div className="mb-5 relative z-10">
        <StarRating rating={item.rating ?? 5} />
      </div>

      {/* Content */}
      <div className="flex-grow relative z-10 mb-6 flex flex-col items-start justify-start">
        <p 
          className={cn(
            "leading-relaxed font-light italic text-white/70 text-[0.9rem] md:text-[1rem] group-hover:text-white/90 transition-colors duration-300"
          )}
        >
          &ldquo;{getPreviewText(item.content)}&rdquo;
        </p>
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-site-gold/80 hover:text-site-gold text-[0.75rem] md:text-[0.8rem] font-medium tracking-widest uppercase mt-3 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-site-gold rounded px-1 -mx-1"
          >
            {isExpanded ? "Read less" : "Read more..."}
          </button>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-4 mt-auto pt-5 border-t border-white/[0.06] relative z-10">
        {item.avatar_url ? (
          <Image
            src={item.avatar_url}
            alt={item.author_name}
            className="w-11 h-11 rounded-full flex-shrink-0"
            imageClassName="object-cover border border-white/10"
            width={80}
            height={80}
          />
        ) : (
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors duration-300 bg-white/[0.05] border-white/10 group-hover:bg-site-gold/15 group-hover:border-site-gold/30">
            <span className="font-bold font-serif text-sm text-white/60 group-hover:text-site-gold transition-colors duration-300">
              {item.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-white font-medium text-[0.9rem] truncate">{item.author_name}</h4>
          <p className="text-white/40 text-[0.75rem] mt-0.5 truncate uppercase tracking-widest font-sans">
            {[item.author_role, item.city].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("active", true)
        .is("project_id", null)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching testimonials:", error);
        return [];
      }
      return data as Testimonial[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const getScrollAmount = () => {
    if (typeof window === "undefined") return 404;
    return window.innerWidth < 768 ? 320 : 404; // Card width + gap
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          containerRef.current.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  if (!isLoading && testimonials.length === 0) return null;

  const avgRating =
    testimonials.length > 0
      ? (testimonials.reduce((s, t) => s + (t.rating ?? 5), 0) / testimonials.length).toFixed(1)
      : "5.0";

  return (
    <section id="testimonials" className="py-section-y relative overflow-hidden">
      <div className="absolute inset-0 bg-[#080807]" />
      {/* Top rule */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-site-gold/25 to-transparent" />
      {/* Bottom rule */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="container mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              Client Reviews
            </span>
          </div>

          {/* Heading — using site-gold color directly, no gradient clip */}
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-white mb-6">
            What Our{" "}
            <em className="not-italic text-site-gold">Clients</em>{" "}
            Say
          </h2>

          {/* Rating summary */}
          {!isLoading && testimonials.length > 0 && (
            <div className="flex items-center justify-center gap-2.5 mt-4">
              <StarRating rating={5} size="md" />
              <span className="text-site-gold font-bold text-lg font-display">{avgRating}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/60 text-sm">
                {testimonials.length} verified review{testimonials.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Cards ── */}
        <div
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Glow behind the carousel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-site-gold/5 blur-[100px] rounded-full pointer-events-none hidden md:block" />

          {isLoading ? (
            <div className="flex overflow-hidden gap-5 md:gap-6 px-4 md:px-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-[#0d0d0c] border-white/[0.06] p-6 md:p-8 h-auto min-h-[280px] md:min-h-[320px] flex flex-col w-[300px] md:w-[380px] shrink-0"
                >
                  <div className="flex gap-1.5 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="skeleton-shimmer w-3.5 h-3.5 rounded"
                        style={{ animationDelay: `${i * 120 + j * 50}ms` }}
                      />
                    ))}
                  </div>
                  <div className="space-y-2.5 mb-7 flex-1">
                    {[100, 83, 67, 50].map((w, k) => (
                      <div
                        key={k}
                        className="skeleton-shimmer h-3.5 rounded-lg"
                        style={{ width: `${w}%`, animationDelay: `${i * 120 + 250 + k * 70}ms` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05]">
                    <div
                      className="skeleton-shimmer w-10 h-10 rounded-full flex-shrink-0"
                      style={{ animationDelay: `${i * 120 + 600}ms` }}
                    />
                    <div className="space-y-2 flex-1">
                      <div className="skeleton-shimmer h-3 w-28 rounded-lg" style={{ animationDelay: `${i * 120 + 680}ms` }} />
                      <div className="skeleton-shimmer h-2 w-20 rounded-lg" style={{ animationDelay: `${i * 120 + 760}ms` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              ref={containerRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-5 md:gap-6 pb-12 hide-scrollbar px-4 md:px-12 -mx-4 md:-mx-12 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {testimonials.map((item, i) => (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* Slider Navigation */}
          {!isLoading && testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-2">
              <button
                onClick={scrollLeft}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-site-gold/50 hover:text-site-gold hover:bg-site-gold/10 transition-all duration-300"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={scrollRight}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-site-gold/50 hover:text-site-gold hover:bg-site-gold/10 transition-all duration-300"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {testimonials.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Crossangle Interior",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: avgRating,
                reviewCount: testimonials.length,
              },
            }),
          }}
        />
      )}
    </section>
  );
};

export default Testimonials;
