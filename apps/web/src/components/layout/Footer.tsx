import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useDynamicCTA } from "@/hooks/useDynamicCTA";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MapPin, Mail, Phone } from "lucide-react";



interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

// Particles
const Particles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * -5,
      });
    }
    setParticles(arr);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-[3px] h-[3px] bg-[#C41230] rounded-full opacity-35"
          style={{ left: `${p.x}vw`, bottom: `${p.y}vh` }}
          animate={{ y: [0, -1000] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

// Magnetic Wrap
const Magnetic = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  function onMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
};

// Clock
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime("IST: " + now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-2.5 text-[12px] font-['Space_Mono']">
      {time}
    </div>
  );
}

const getFooterCopy = (pathname: string, cta: ReturnType<typeof useDynamicCTA>["cta"]) => {
  if (pathname === "/") {
    return cta;
  }

  if (pathname.startsWith("/services/")) {
    return {
      ...cta,
      headlineStart: "Ready to shape this",
      headlineHighlight: "service into a real plan?",
      sub: "Tell us what you need, and we will translate the service scope into a clear design and execution direction.",
    };
  }

  if (pathname.startsWith("/portfolio/")) {
    return {
      ...cta,
      headlineStart: "Want a project with this",
      headlineHighlight: "level of detail?",
      sub: "Share your space, timeline, and ambitions. We will help you define the next practical move.",
    };
  }

  const pageCopy: Record<string, Partial<typeof cta>> = {
    "/about-us": {
      headlineStart: "Meet the studio, then",
      headlineHighlight: "start your brief.",
      sub: "If our approach feels aligned, let us turn the conversation into a precise project direction.",
    },
    "/services": {
      headlineStart: "Choose your service, then",
      headlineHighlight: "build the roadmap.",
      sub: "From residential interiors to commercial execution, we help you understand the scope before you commit.",
    },
    "/portfolio": {
      headlineStart: "Seen the work?",
      headlineHighlight: "Now shape yours.",
      sub: "Use the portfolio as a starting point. We will help adapt the finish language to your own space.",
    },
    "/gallery": {
      headlineStart: "Save the inspiration.",
      headlineHighlight: "Start the plan.",
      sub: "Send us the rooms and moods that stood out, and we will translate them into a practical interior brief.",
    },
    "/blog": {
      headlineStart: "Ideas are useful.",
      headlineHighlight: "Execution makes them real.",
      sub: "If an article sparked a direction, our team can help convert that thinking into a project plan.",
    },
    "/contact-us": {
      headlineStart: "You are already here.",
      headlineHighlight: "Let us respond clearly.",
      sub: "Share your brief once, and we will come back with fit, next steps, and the clearest consultation path.",
    },
    "/estimate": {
      headlineStart: "Have an estimate?",
      headlineHighlight: "Now validate the scope.",
      sub: "Use your estimator result as the first draft. We will help refine it into a realistic execution direction.",
    },
    "/aesthetic-discovery-engine": {
      headlineStart: "Found your style?",
      headlineHighlight: "Turn it into a room.",
      sub: "Your design signals are the beginning. We can translate them into material, lighting, and layout decisions.",
    },
    "/blueprint": {
      headlineStart: "From blueprint to",
      headlineHighlight: "built experience.",
      sub: "Use the strategy as a starting point, then let us shape the physical execution with clarity.",
    },
  };

  return {
    ...cta,
    ...(pageCopy[pathname] || {
      headlineStart: "Ready to begin",
      headlineHighlight: "with clarity?",
      sub: "Share your requirements and we will guide the next step with a practical, premium design process.",
    }),
  };
};

// MAIN COMPONENT
export default function Footer() {

  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { cta } = useDynamicCTA();
  const location = useLocation();
  const footerCopy = getFooterCopy(location.pathname, cta);
  const { settings } = useSiteSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const colStyle = "p-[clamp(30px,5vw,60px)] md:border-r border-white/5 border-b md:border-b-0 last:border-b-0";
  const labelStyle = "font-sans text-[10px] tracking-[0.3em] text-white/50 mb-5";

  return (
    <footer
      className="relative min-h-[100vh] overflow-hidden text-white font-['Space_Mono'] block"
      style={{
        background: "radial-gradient(circle at 72% 28%, rgba(196,18,48,0.20), transparent 58%), radial-gradient(circle at 18% 82%, rgba(128,0,18,0.18), transparent 48%), #000"
      }}
    >
      {/* CSS for CTA Sweep */}
      <style>{`
          .footer-cta {
            margin-top: 40px;
            display: inline-block;
            padding: 16px 32px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.2);
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: border-color 0.3s;
          }
          .footer-cta::before {
            content: "";
            position: absolute;
            left: -100%; top: 0; width: 100%; height: 100%;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: 0.7s;
          }
          .footer-cta:hover::before { left: 100%; }
          .footer-cta:hover { border-color: rgba(255,255,255,0.5); }
        `}</style>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none z-0"
        style={{ backgroundImage: 'url(/noise.svg)' }}
      />

      <Particles />

      {/* Intense dark vignette overlay at the top to merge cleanly with upper sections */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-[#020202] via-[#020202]/70 to-transparent z-10 pointer-events-none" />

      {/* --- HERO --- */}
      <div ref={heroRef} className="py-[150px] px-[6vw] relative z-20">
        <motion.h2
          className="font-serif leading-[1.05] text-[clamp(3.5rem,10vw,8.5rem)] max-w-[90vw] md:max-w-7xl tracking-tighter"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        >
          {footerCopy.headlineStart}<br className="hidden sm:block" />
          <span className="text-[#C41230] italic">{footerCopy.headlineHighlight}</span>
        </motion.h2>

        <motion.p
          className="mt-6 text-white/70 text-lg max-w-2xl font-light leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
        >
          {footerCopy.sub}
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center gap-6"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <Magnetic>
            <Link
              to={footerCopy.btn1Link}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#C41230] text-white rounded-full font-sans text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors duration-300 w-full sm:w-auto text-center"
            >
              {footerCopy.btn1}
            </Link>
          </Magnetic>
          
          <Magnetic>
            <Link
              to={footerCopy.btn2Link}
              className="inline-flex items-center justify-center px-8 py-4 backdrop-blur-xl bg-white/35 border border-white/60 text-white rounded-full font-sans text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto text-center font-bold"
            >
              {footerCopy.btn2}
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      {/* --- GRID --- */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 relative z-20 border-t border-white/5">
        {/* Col 1 */}
        <motion.div
          className={colStyle}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0, ease: "easeOut" }}
        >
          <div className={labelStyle}>// STUDIO</div>
          <div
            className="block mb-3 text-[20px] transition-transform duration-300 hover:translate-x-2 hover:text-[#C41230] cursor-pointer"
          >
            <a href={`mailto:${settings?.email || 'hello@crossangle.com'}`} className="text-inherit no-underline">
              {settings?.email || 'hello@crossangle.com'}
            </a>
          </div>
        </motion.div>

        {/* Col 2 */}
        <motion.div
          className={colStyle}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
        >
          <div className={labelStyle}>// LOCATIONS</div>
          {settings?.address ? (
            <div className="text-[20px] font-serif mb-1 leading-snug max-w-[280px]">{settings.address}</div>
          ) : (
            <>
              <div className="text-[30px] font-serif mb-1">Jamshedpur</div>
              <div className="text-[20px] font-serif text-white/55">Jharkhand, India</div>
            </>
          )}
          <LiveClock />
        </motion.div>

        {/* Col 3: Quick Links — Core Navigation */}
        <motion.div
          className={colStyle}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <div className={labelStyle}>// NAVIGATE</div>
          {[
            { key: 'home', name: 'Home', path: '/' },
            { key: 'services', name: 'Services', path: '/services' },
            { key: 'portfolio', name: 'Portfolio', path: '/portfolio' },
            { key: 'about', name: 'About Us', path: '/about-us' },
            { key: 'blog', name: 'Blog', path: '/blog' },
            { key: 'contact', name: 'Contact Us', path: '/contact-us' },
          ].map(({ key, name, path }) => (
            <Link
              key={key}
              to={path}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="block mb-3 text-[18px] transition-transform duration-300 hover:translate-x-[10px] hover:text-[#C41230] cursor-pointer text-white no-underline"
            >
              {name}
            </Link>
          ))}
        </motion.div>

        {/* Col 4: Quick Links — Tools & Resources */}
        <motion.div
          className={colStyle}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <div className={labelStyle}>// TOOLS</div>
          {[
            { key: 'gallery', name: 'Gallery', path: '/gallery' },
            { key: 'estimate', name: 'Cost Estimator', path: '/estimate' },
            { key: 'discovery', name: 'Style Discovery', path: '/aesthetic-discovery-engine' },
            { key: 'blueprint', name: 'Design Blueprint', path: '/blueprint' },
          ].map(({ key, name, path }) => (
            <Link
              key={key}
              to={path}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="block mb-3 text-[18px] transition-transform duration-300 hover:translate-x-[10px] hover:text-[#C41230] cursor-pointer text-white no-underline"
            >
              {name}
            </Link>
          ))}
        </motion.div>

        {/* Col 5: Socials */}
        <motion.div
          className={colStyle}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <div className={labelStyle}>// SOCIALS</div>
          {[
            { key: 'facebook', name: 'Facebook' },
            { key: 'instagram', name: 'Instagram' },
            { key: 'twitter', name: 'Twitter' },
            { key: 'linkedin', name: 'LinkedIn' },
            { key: 'youtube', name: 'YouTube' },
            { key: 'pinterest', name: 'Pinterest' }
          ].map(({ key, name }) => {
            const url = settings?.social_links?.[key];
            const href = (url && typeof url === 'string' && url.trim().length > 0) ? url : "#";
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-3 text-[20px] transition-transform duration-300 hover:translate-x-[10px] hover:text-[#C41230] cursor-pointer text-white no-underline capitalize"
              >
                {name}
              </a>
            );
          })}
        </motion.div>
      </div>

      {/* --- BOTTOM --- */}
      <div className="flex flex-col md:flex-row items-center justify-between pt-[20px] pb-[80px] md:pb-[20px] px-[6vw] text-[11px] opacity-50 relative z-10 w-full mt-10 md:mt-20">
        <div className="mb-4 md:mb-0 flex flex-wrap gap-4 items-center justify-center">
          <span>(c) 2026 CrossAngle Interior</span>
          <span className="hidden md:inline">|</span>
          <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors duration-300">Privacy & DPDPA Policy</Link>
          <span className="hidden md:inline">|</span>
          <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors duration-300">Terms & Conditions</Link>
        </div>
      </div>

      {/* --- BG TEXT --- */}
      <div className="absolute bottom-[-50px] left-[50%] -translate-x-1/2 text-[clamp(100px,20vw,300px)] opacity-[0.03] font-serif pointer-events-none whitespace-nowrap z-0">
        CROSSANGLE
      </div>

    </footer>
  );
}
