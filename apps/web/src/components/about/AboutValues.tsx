import { motion } from "framer-motion";
import { Target, Lightbulb, Award, Users, LucideIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const values = [
  {
    icon: Target,
    title: "Client-Centric Approach",
    description: "Your vision drives everything we do. We listen, understand, and deliver spaces that exceed expectations.",
  },
  {
    icon: Lightbulb,
    title: "Innovation & Creativity",
    description: "We blend cutting-edge design trends with timeless aesthetics to create unique, inspiring spaces.",
  },
  {
    icon: Award,
    title: "Excellence in Execution",
    description: "Meticulous attention to detail and premium craftsmanship define every project we undertake.",
  },
  {
    icon: Users,
    title: "Collaborative Partnership",
    description: "We work closely with you throughout the journey, ensuring transparency and seamless communication.",
  },
];

const ValueCard = ({ icon: Icon, title, description, index }: ValueCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer perspective-1000"
    >
      <div className="relative h-full p-8 rounded-[2rem] bg-white/[0.02] backdrop-blur-3xl border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(209,175,110,0.12)] hover:border-primary/30 transition-all duration-700 overflow-hidden group-hover:bg-white/[0.04]">
        {/* Internal reflection */}
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/5 pointer-events-none" />
        
        {/* Spotlight gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(400px circle at ${(mouseX.get() + 0.5) * 100}% ${(mouseY.get() + 0.5) * 100}%, rgba(209, 175, 110, 0.1), transparent 40%)`
              : "none",
          }}
        />

        {/* Icon */}
        <motion.div
          className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 group-hover:border-[#d1af6e]/40 group-hover:bg-[#d1af6e]/10 flex items-center justify-center mb-6 transition-all duration-700 shadow-inner group-hover:shadow-[0_0_15px_rgba(209,175,110,0.2)]"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="w-7 h-7 text-muted-foreground group-hover:text-[#d1af6e] transition-colors duration-500 drop-shadow-[0_0_8px_rgba(209,175,110,0)] group-hover:drop-shadow-[0_0_8px_rgba(209,175,110,0.5)]" />
        </motion.div>

        {/* Content */}
        <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-[#d1af6e] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const AboutValues = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#d1af6e]/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
        >
          <span className="text-[#d1af6e] font-medium tracking-widest uppercase text-sm mb-4 block">
            Our Values
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Who We <span className="text-[#d1af6e]">Are</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Founded with a passion for design and a commitment to excellence, 
            our team combines innovative concepts with meticulous attention to detail.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <ValueCard
              key={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutValues;
