import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play, ChevronDown } from "lucide-react";
import { useState } from "react";
import { KineticText } from "@/components/ui/kinetic-text";

interface AboutHeroProps {
  onPlayVideo?: () => void;
  videoUrl?: string;
}

const AboutHero = ({ onPlayVideo, videoUrl = "https://www.youtube.com/embed/gJMCIaI7nKg" }: AboutHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoHovered, setIsVideoHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(209,175,110,0.08) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(209,175,110,0.06) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] bg-noise"
      />

      <motion.div style={{ y, opacity, scale }} className="relative z-10 container mx-auto px-4">
        {/* Background Kinetic Text Marquee */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] select-none flex flex-col justify-around overflow-hidden">
          {[1, -1, 1].map((dir, i) => (
            <motion.div
              key={i}
              className="whitespace-nowrap font-serif text-[10vh] font-bold"
              animate={{ x: dir > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              CROSS ANGLE INTERIOR • CINEMATIC SPATIAL ELEGANCE • ESTD 2010 • CROSS ANGLE INTERIOR • CINEMATIC SPATIAL ELEGANCE • ESTD 2010 •
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d1af6e]/10 border border-[#d1af6e]/20 text-[#d1af6e] text-sm font-medium tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#d1af6e] animate-[pulse_2s_ease-in-out_Infinity]" />
                ABOUT THE STUDIO
              </span>
            </motion.div>

            {/* Kinetic Title */}
            <div className="mb-6 overflow-hidden">
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.1]">
                <KineticText preset="char-reveal" stagger={0.03} duration={0.8}>
                  Cross Angle
                </KineticText>
                <div className="text-[#d1af6e] italic mt-2">
                  <KineticText preset="char-reveal" stagger={0.03} delay={0.4} duration={0.8}>
                    Interior
                  </KineticText>
                </div>
              </h1>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-6"
            >
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-lg">
                We believe true design transcends the ornamental; it is the <span className="text-foreground font-semibold italic">curation of atmosphere</span>.
              </p>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                For over <span className="text-foreground font-semibold">15 years</span>, our studio has been the silent architect of Jamshedpur's most prestigious environments—dedicated to the <span className="text-[#d1af6e] font-medium tracking-wide">Architecture of Anticipation</span>.
              </p>
            </motion.div>

            {/* Glassmorphism Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] grid grid-cols-3 gap-8 relative overflow-hidden"
            >
              {/* Internal subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#d1af6e]/5 via-transparent to-transparent opacity-50 pointer-events-none" />
              
              {[
                { value: "15+", label: "Years" },
                { value: "500+", label: "Projects" },
                { value: "98%", label: "Clients" },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <p className="text-3xl md:text-4xl font-serif font-bold text-[#d1af6e] drop-shadow-[0_0_10px_rgba(209,175,110,0.3)] group-hover:scale-110 transition-transform duration-500">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Video Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div
              className="relative aspect-video rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-white/10 group backdrop-blur-3xl bg-black/50"
            >
              <iframe
                src={videoUrl}
                title="Cross Angle Interior Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 border-2 border-[#d1af6e]/20 rounded-3xl -z-10 transition-transform duration-700 group-hover:rotate-[5deg] group-hover:border-[#d1af6e]/40" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-white/10 rounded-3xl -z-10 transition-transform duration-700 group-hover:-rotate-[5deg]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest text-muted-foreground uppercase">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#d1af6e]/80" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutHero;
