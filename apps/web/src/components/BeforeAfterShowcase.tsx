import { useState } from "react";
import { Compare } from "@/components/ui/compare";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { transformationStories } from "@/data/transformationStories";
import { Image } from "@/components/ui/image";
import { Star, ArrowRight, Quote } from "lucide-react";

export const BeforeAfterShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = transformationStories[activeIndex];

  return (
    <section className="py-24 lg:py-32 bg-[#0a0a09] relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-site-crimson/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-site-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-site-gold/50" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-site-gold font-bold">
                The Transformation
              </span>
            </div>
            <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              Before & After
            </h2>
          </div>
          <p className="text-white/40 text-sm md:text-base max-w-sm leading-relaxed font-light italic">
            Drag the interactive slider to experience the measured, visceral change we bring to actual spaces. A shift from the mundane to the extraordinary.
          </p>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Slider Column */}
          <div className="lg:col-span-8 group/slider">
            <div className="relative aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#111]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
            </div>
            
            {/* Metadata Footer */}
            <div className="mt-8 flex items-baseline justify-between border-t border-white/5 pt-6">
              <div>
                <h3 className="text-xl text-white font-display tracking-tight mb-1">
                  {current.title}
                </h3>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] uppercase tracking-[0.2em] text-site-gold font-bold">Location:</span>
                   <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">{current.location}</span>
                </div>
              </div>
              <div className="text-right">
                 <span className="text-[10px] text-white/30 font-mono tracking-tighter">PROJECT_ID // {current.id.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Testimonial & Details Column */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-8 h-full flex flex-col justify-center">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-site-gold text-site-gold" />
                ))}
              </div>

              {/* Quote Block */}
              <div className="relative">
                <Quote className="absolute -top-8 -left-6 text-white/5 w-20 h-20 -z-10" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light italic mb-6">
                      "{current.testimonial?.quote || "Transformation that exceeds expectations. Every detail was meticulously planned and executed."}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-px w-6 bg-site-crimson" />
                      <span className="text-xs uppercase tracking-[0.2em] text-white font-bold">
                        — {current.testimonial?.clientName || "VALUED CLIENT"}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Consultation Button */}
              <div className="pt-8">
                <button className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-bold text-white border border-white/10 px-8 py-4 rounded-sm hover:bg-white hover:text-black transition-all duration-300">
                  Get a Similar Consultation
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center gap-6 mt-12 overflow-x-auto pb-4 no-scrollbar">
          {transformationStories.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${item.title} transformation`}
              title={item.title}
              className={cn(
                "relative flex-shrink-0 w-24 md:w-32 aspect-video rounded-lg overflow-hidden transition-all duration-500",
                activeIndex === index 
                  ? "ring-2 ring-site-gold ring-offset-4 ring-offset-[#0a0a09] scale-105" 
                  : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
              )}
            >
              <Image
                src={item.afterMedia}
                alt={item.title}
                className="w-full h-full object-cover"
                width={200}
                height={120}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
