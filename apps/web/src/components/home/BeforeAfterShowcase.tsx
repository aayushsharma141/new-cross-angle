import { useState } from "react";
import { Compare } from "@/components/ui/enhanced/compare";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { transformationStories as fallbackStories } from "@/data/transformationStories";
import { ArrowRight, Quote, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedUrl } from "@/lib/cdn";
import { Image } from "@/components/ui/enhanced/image";

export const BeforeAfterShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  interface DBStory {
    id: string;
    title: string;
    location: string;
    before_media: string;
    after_media: string;
    challenge: string;
    design_moves: string[] | null;
    products_used: { name: string; brand: string; spec: string }[] | null;
    outcome_metric: string;
    testimonial_quote?: string | null;
    testimonial_client_name?: string | null;
  }

  const { data: dbStories } = useQuery({
    queryKey: ["transformation-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transformation_stories")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      
      if (error || !data?.length) return null;
      
      return (data as unknown as DBStory[]).map((s) => ({
        id: s.id,
        title: s.title,
        location: s.location,
        beforeMedia: s.before_media,
        afterMedia: s.after_media,
        challenge: s.challenge,
        designMoves: s.design_moves || [],
        productsUsed: s.products_used || [],
        outcomeMetric: s.outcome_metric,
        testimonial: s.testimonial_quote
          ? { quote: s.testimonial_quote, clientName: s.testimonial_client_name || "Client" }
          : undefined,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const stories = dbStories && dbStories.length > 0 ? dbStories : fallbackStories;
  const current = stories[activeIndex] || stories[0];

  const goNext = () => setActiveIndex((i) => (i + 1) % stories.length);
  const goPrev = () => setActiveIndex((i) => (i - 1 + stories.length) % stories.length);

  return (
    <section className="py-20 lg:py-28 bg-[#060504] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-[40rem] h-[40rem] bg-site-crimson/4 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-32 w-[40rem] h-[40rem] bg-site-gold/4 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              Real Transformations
            </span>
          </div>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] leading-[1] tracking-[-0.02em] mb-4">
            <span className="text-site-gold block mb-2">See the Difference</span>
            <span className="text-white">We Make</span>
          </h2>
          <p className="text-white/45 text-base leading-relaxed max-w-xl">
            Every project starts with a vision and ends with a space that transforms how you live. 
            Slide to reveal the before and after.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Slider + Controls */}
          <div className="lg:col-span-7">
            {/* Compare Slider */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/8 shadow-2xl bg-[#0a0a09]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  <Compare
                    firstImage={current.beforeMedia}
                    secondImage={current.afterMedia}
                    firstImageClassName="object-cover"
                    secondImageClassname="object-cover"
                    className="w-full h-full"
                    slideMode="hover"
                    autoplay={false}
                    showHandlebar={true}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Before/After labels */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-[10px] uppercase tracking-wider text-white/80 font-medium">
                Before
              </div>
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-[10px] uppercase tracking-wider text-site-gold font-medium">
                After
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center justify-between mt-5">
              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                {stories.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`View ${item.title}`}
                    title={`View ${item.title}`}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-300",
                      activeIndex === index
                        ? "ring-2 ring-site-gold ring-offset-1 ring-offset-[#060504]"
                        : "opacity-40 grayscale hover:opacity-80 hover:grayscale-0"
                    )}
                  >
                    <Image 
                      src={item.afterMedia} 
                      alt={item.title} 
                      className="w-full h-full" 
                      imageClassName="object-cover"
                      width={128}
                      height={96}
                      quality={75}
                    />
                  </button>
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2 ml-4 shrink-0">
                <button 
                  onClick={goPrev} 
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={goNext} 
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Project Details Panel */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="h-full flex flex-col"
              >
                {/* Project Title & Location */}
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-3xl font-display text-white tracking-tight mb-2">
                    {current.title}
                  </h3>
                  <div className="flex items-center gap-4 text-white/60 text-xs">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {current.location}
                    </span>
                    {current.outcomeMetric && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {current.outcomeMetric.split("—")[0]?.trim()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Challenge */}
                <div className="mb-6 pb-6 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-site-crimson font-semibold mb-2 block">The Challenge</span>
                  <p className="text-white/60 text-sm leading-relaxed">{current.challenge}</p>
                </div>

                {/* Design Moves */}
                <div className="mb-6 pb-6 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-site-gold font-semibold mb-3 block">Our Design Moves</span>
                  <ul className="space-y-2">
                    {current.designMoves.slice(0, 3).map((move, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/55 leading-relaxed">
                        <span className="text-site-gold/70 font-mono text-xs mt-0.5 shrink-0">0{i + 1}</span>
                        <span>{move}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Testimonial */}
                {current.testimonial && (
                  <div className="mb-6 relative">
                    <Quote className="absolute -top-2 -left-1 w-8 h-8 text-white/5" />
                    <p className="text-white/70 text-sm italic leading-relaxed pl-4 border-l-2 border-site-gold/30">
                      "{current.testimonial.quote.length > 120
                        ? current.testimonial.quote.slice(0, 120) + "..."
                        : current.testimonial.quote}"
                    </p>
                    <span className="text-[11px] text-white/60 mt-2 block pl-4">
                      — {current.testimonial.clientName}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-4">
                  <a
                    href="/contact-us"
                    className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold text-site-gold hover:text-white transition-colors duration-300 group"
                  >
                    <span>Get a Similar Transformation</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
