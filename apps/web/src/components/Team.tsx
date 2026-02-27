import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Linkedin, Instagram, Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Rahul Sharma",
    role: "Founder & Principal Designer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
    bio: "15+ years transforming spaces into experiences",
    social: {
      linkedin: "#",
      instagram: "#",
      email: "rahul@crossangleinterior.com"
    }
  },
  {
    name: "Priya Patel",
    role: "Senior Interior Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face",
    bio: "Specialist in residential luxury interiors",
    social: {
      linkedin: "#",
      instagram: "#",
      email: "priya@crossangleinterior.com"
    }
  },
  {
    name: "Amit Kumar",
    role: "Commercial Design Lead",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    bio: "Expert in modern office & retail spaces",
    social: {
      linkedin: "#",
      instagram: "#",
      email: "amit@crossangleinterior.com"
    }
  },
  {
    name: "Sneha Gupta",
    role: "3D Visualization Artist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
    bio: "Bringing designs to life with stunning renders",
    social: {
      linkedin: "#",
      instagram: "#",
      email: "sneha@crossangleinterior.com"
    }
  },
];

const Team = () => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      id="team"
      className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-background to-accent/5"
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Our Team
          </motion.span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            <span className="block overflow-hidden">
              {"Meet The Experts".split("").map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ y: 60, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + index * 0.02,
                    ease: [0.215, 0.61, 0.355, 1]
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
          </h2>
          <motion.p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            A passionate team of designers, architects, and artists dedicated to creating exceptional spaces.
          </motion.p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
    linkedin: string;
    instagram: string;
    email: string;
  };
}

const TeamCard = ({ member, index, isInView }: { member: TeamMember; index: number; isInView: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={member.image}
            alt={member.name}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-700"
            style={{
              filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
              scale: isHovered ? 1.1 : 1,
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />

          {/* Social Links - Slide up on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4"
            initial={{ y: 60, opacity: 0 }}
            animate={isHovered ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <a
              href={member.social.linkedin}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${member.name} LinkedIn`}
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={member.social.instagram}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${member.name} Instagram`}
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${member.social.email}`}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Email ${member.name}`}
            >
              <Mail className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          <motion.h3
            className="font-serif text-xl font-bold text-foreground mb-1"
            layout
          >
            {member.name}
          </motion.h3>
          <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
          <motion.p
            className="text-muted-foreground text-sm overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={isHovered ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {member.bio}
          </motion.p>
        </div>

        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: isHovered
              ? '0 0 40px hsl(var(--primary) / 0.2), inset 0 0 0 1px hsl(var(--primary) / 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default Team;
