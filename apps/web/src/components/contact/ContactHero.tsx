import { useRef, useState, useEffect } from "react";
import { Sparkles, Home } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { KineticText } from "../ui/kinetic-text";
import { Link } from "react-router-dom";

const ContactHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const headline = "Let's Create Something";
  const headline2 = "Beautiful Together";

  return (
    <section
      ref={containerRef}
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-28 pb-16 bg-site-bg"
    >
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, var(--site-crimson) 0%, transparent 70%)',
            top: '20%',
            left: '30%',
          }}
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
            scale: [1, 1.1, 1],
          }}
          transition={{
            x: { duration: 0.3 },
            y: { duration: 0.3 },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
          animate={{
            background: 'radial-gradient(circle, var(--site-crimson) 0%, transparent 70%)',
            bottom: '10%',
            right: '20%',
            x: mousePosition.x * -1,
            y: mousePosition.y * -1,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            x: { duration: 0.3 },
            y: { duration: 0.3 },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10" ref={textRef}>
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-site-crimson font-medium tracking-[0.2em] uppercase text-sm mb-6 border border-site-crimson/30 px-5 py-2.5 rounded-none backdrop-blur-sm bg-site-crimson/5">
              <Sparkles className="w-4 h-4" />
              Get In Touch
              <Sparkles className="w-4 h-4" />
            </span>
          </motion.div>

          {/* Kinetic Typography headline */}
          <div className="mb-6 px-2">
            <KineticText className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-site-text-heading leading-tight">
              Ready to Transform
            </KineticText>
            <KineticText className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-site-crimson leading-tight mt-2">
              Your Space?
            </KineticText>
          </div>

          <motion.p
            className="text-site-text-muted text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Get a free consultation and 3D design visualization.
            <span className="block mt-2 text-site-crimson font-medium">
              No obligation. No hidden costs.
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
