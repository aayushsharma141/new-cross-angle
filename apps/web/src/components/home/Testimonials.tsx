import { useState, useEffect, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedUrl } from "@/lib/cdn";
import { Image } from "@/components/ui/enhanced/image";

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
  featured,
  index,
}: {
  item: Testimonial;
  featured: boolean;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative p-7 rounded-2xl border flex flex-col h-full group overflow-hidden transition-all duration-500",
        featured
          ? "bg-[#151412] border-site-gold/25 shadow-[0_0_50px_rgba(209,175,110,0.10)] md:-translate-y-3 z-10 ring-1 ring-site-gold/10"
          : "bg-[#0d0d0c] border-white/[0.06] hover:border-site-gold/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
      )}
    >
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(209,175,110,0.06)] via-transparent to-[rgba(180,40,40,0.02)] pointer-events-none" />
      )}

      <Quote
        className={cn(
          "absolute -top-1 right-4 w-16 h-16 transition-all duration-500 pointer-events-none",
          featured ? "opacity-10 text-site-gold" : "opacity-[0.04] text-white group-hover:opacity-[0.08]"
        )}
      />

      {/* Stars */}
      <div className="mb-5 relative z-10">
        <StarRating rating={item.rating ?? 5} />
      </div>

      {/* Content */}
      <p
        className={cn(
          "leading-relaxed font-light italic flex-grow relative z-10 mb-7",
          featured
            ? "text-white/85 text-[1.0rem] md:text-[1.1rem]"
            : "text-white/60 text-[0.93rem] md:text-[1.0rem] group-hover:text-white/75 transition-colors duration-300"
        )}
      >
        &ldquo;{item.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3.5 mt-auto pt-5 border-t border-white/[0.06] relative z-10">
        {item.avatar_url ? (
          <Image
            src={item.avatar_url}
            alt={item.author_name}
            className="w-10 h-10 rounded-full flex-shrink-0"
            imageClassName="object-cover border border-white/10"
            width={80}
            height={80}
          />
        ) : (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors duration-300",
              featured
                ? "bg-site-gold/15 border-site-gold/30"
                : "bg-white/[0.05] border-white/10 group-hover:bg-site-gold/10 group-hover:border-site-gold/20"
            )}
          >
            <span
              className={cn(
                "font-bold font-serif text-sm",
                featured ? "text-site-gold" : "text-white/60 group-hover:text-site-gold/70 transition-colors duration-300"
              )}
            >
              {item.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{item.author_name}</h4>
          <p className="text-white/35 text-xs mt-0.5 truncate">
            {[item.author_role, item.city].filter(Boolean).join(" · ")}
          </p>
        </div>
        {featured && (
          <div className="ml-auto">
            <span className="text-[9px] uppercase tracking-[0.2em] text-site-gold/70 font-bold bg-site-gold/8 border border-site-gold/20 px-2 py-0.5 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [page, setPage] = useState(0);
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

  const PER_PAGE = 3;
  const totalPages = testimonials.length > 0 ? Math.ceil(testimonials.length / PER_PAGE) : 0;
  const safePage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0;
  const visibleCards = testimonials.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) setPage(0);
  }, [totalPages, page]);

  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalPages]);

  if (!isLoading && testimonials.length === 0) return null;

  const avgRating =
    testimonials.length > 0
      ? (testimonials.reduce((s, t) => s + (t.rating ?? 5), 0) / testimonials.length).toFixed(1)
      : "5.0";

  return (
    <section id="testimonials" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#080807]" />
      {/* Top rule */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-site-gold/25 to-transparent" />
      {/* Bottom rule */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">

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
          ref={containerRef}
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Glow behind featured */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[65%] bg-site-gold/6 blur-[90px] rounded-full pointer-events-none hidden md:block" />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border bg-[#0d0d0c] p-7 h-[300px] flex flex-col ${
                    i === 1
                      ? "border-site-gold/15 shadow-[0_0_40px_rgba(209,175,110,0.06)]"
                      : "border-white/[0.06]"
                  }`}
                >
                  {/* Star placeholders */}
                  <div className="flex gap-1.5 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="skeleton-shimmer w-3.5 h-3.5 rounded"
                        style={{ animationDelay: `${i * 120 + j * 50}ms` }}
                      />
                    ))}
                  </div>
                  {/* Quote text lines */}
                  <div className="space-y-2.5 mb-7 flex-1">
                    {[100, 83, 67, 50].map((w, k) => (
                      <div
                        key={k}
                        className="skeleton-shimmer h-3.5 rounded-lg"
                        style={{ width: `${w}%`, animationDelay: `${i * 120 + 250 + k * 70}ms` }}
                      />
                    ))}
                  </div>
                  {/* Author row */}
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05]">
                    <div
                      className="skeleton-shimmer w-10 h-10 rounded-full flex-shrink-0"
                      style={{ animationDelay: `${i * 120 + 600}ms` }}
                    />
                    <div className="space-y-2 flex-1">
                      <div
                        className="skeleton-shimmer h-3 w-28 rounded-lg"
                        style={{ animationDelay: `${i * 120 + 680}ms` }}
                      />
                      <div
                        className="skeleton-shimmer h-2 w-20 rounded-lg"
                        style={{ animationDelay: `${i * 120 + 760}ms` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={safePage}
                className={cn(
                  "grid grid-cols-1 gap-5 md:gap-6",
                  visibleCards.length >= 3
                    ? "md:grid-cols-3"
                    : visibleCards.length === 2
                    ? "md:grid-cols-2 max-w-4xl mx-auto"
                    : "max-w-lg mx-auto"
                )}
              >
                {visibleCards.map((item, i) => (
                  <TestimonialCard
                    key={item.id}
                    item={item}
                    featured={visibleCards.length === 3 && i === 1}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-5 mt-10">
              <button
                onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/35 hover:border-site-gold/40 hover:text-site-gold hover:bg-site-gold/5 transition-all duration-300"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1.5 items-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === safePage
                        ? "w-8 bg-site-gold"
                        : "w-1.5 bg-white/15 hover:bg-site-gold/40"
                    )}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setPage((p) => (p + 1) % totalPages)}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/35 hover:border-site-gold/40 hover:text-site-gold hover:bg-site-gold/5 transition-all duration-300"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {testimonials.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Crossangle Interior",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: avgRating,
                reviewCount: testimonials.length,
              },
            }).replace(/<\/script/gi, '<\\/script'),
          }}
        />
      )}
    </section>
  );
};

export default Testimonials;
