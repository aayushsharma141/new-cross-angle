import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";

const assetKeyForMilestone = (year: string): string => {
  const map: Record<string, string> = {
    "2012": "about_timeline_2012",
    "2016": "about_timeline_2016",
    "2020": "about_timeline_2020",
    "2024": "about_timeline_2024",
  };
  return map[year] || "about_timeline_2012";
};

interface Milestone {
  year: string;
  title: string;
  event: string;
  image?: string;
  id?: string;
}

const fallbackMilestones: Milestone[] = [
  { 
    year: "2012", 
    title: "The Foundation",
    event: "Aayush Sharma established Cross Angle with a vision to bring architectural rigor to interior styling in Jamshedpur.",
    image: "/blueprint_shell.jpg"
  },
  { 
    year: "2016", 
    title: "Scaling the Vision",
    event: "Expanded the studio's capacity to handle end-to-end commercial projects, introducing turnkey delivery to ensure uncompromised quality.",
    image: "/reality_render.jpg"
  },
  { 
    year: "2020", 
    title: "A New Standard",
    event: "Redefined luxury living in Jharkhand through a series of landmark residential projects that emphasized tactile materials and spatial clarity.",
    image: "/hero_reality_render_1775299733746.png"
  },
  { 
    year: "2024", 
    title: "Present Day",
    event: "Today, the studio stands as a premier design house, leading a team of specialists to craft environments that age beautifully.",
    image: "/reality_render.jpg"
  },
];

const AboutTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: milestones = fallbackMilestones } = useQuery<Milestone[]>({
    queryKey: ['studioMilestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('studio_milestones')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((m) => {
          const milestoneRow = m as Record<string, unknown>;
          return {
            ...m,
            image: (milestoneRow.image_url as string) || "/reality_render.jpg"
          };
        });
      }
      return fallbackMilestones;
    }
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 bg-background overflow-hidden"
    >
      {/* Background cinematic gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,175,110,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">The Legacy</span>
          </div>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-foreground mb-6 leading-tight tracking-tight">
            Founder's <span className="text-site-gold italic font-light">Journey</span>
          </h2>
          <p className="text-muted-foreground text-[clamp(1rem,2vw,1.1rem)] font-light leading-relaxed max-w-2xl mx-auto">
            A decade of dedication, precision, and a relentless pursuit of architectural elegance led by Aayush Sharma.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Animated vertical line - centered on desktop */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/5">
            <motion.div
              className="w-full bg-gradient-to-b from-site-gold via-site-gold to-transparent shadow-[0_0_15px_rgba(209,175,110,0.8)]"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Milestones */}
          <div className="space-y-12 md:space-y-0">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={`relative flex items-start gap-8 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 md:w-1/2 ${index % 2 === 0 ? "md:pr-20 md:text-right" : "md:pl-20"}`}>
                  <motion.div
                    className="group relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-site-gold/30 rounded-3xl transition-all duration-700 hover:shadow-[0_20px_50px_rgba(209,175,110,0.1)] hover:bg-white/[0.04]"
                    whileHover={{ y: -8 }}
                  >
                    {/* Image Header */}
                    <div className="relative h-48 w-full overflow-hidden border-b border-white/5">
                      <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-colors duration-500" />
                      <MediaSlot
                        assetKey={assetKeyForMilestone(milestone.year)}
                        fallbackUrl={milestone.image}
                        alt={milestone.title}
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute top-4 left-6 z-20">
                        <span className="inline-block text-site-gold font-serif text-[clamp(2rem,3vw,3rem)] font-bold leading-none drop-shadow-lg">
                          {milestone.year}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 relative">
                      <h3 className="font-serif text-[clamp(1.2rem,2vw,1.5rem)] font-semibold text-foreground mb-3 group-hover:text-site-gold transition-colors duration-300">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                        {milestone.event}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Center dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <motion.div
                    className="relative w-4 h-4 rounded-full bg-black border-[3px] border-site-gold z-10"
                    whileInView={{ scale: [0, 1.2, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                  >
                    <div className="absolute inset-0 rounded-full bg-site-gold/40 animate-pulse" />
                  </motion.div>
                  {/* Glow effect */}
                  <div className="absolute w-10 h-10 rounded-full bg-site-gold/20 blur-xl -z-10" />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1 md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTimeline;
