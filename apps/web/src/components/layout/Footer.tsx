import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useDynamicCTA } from "@/hooks/useDynamicCTA";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";



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
    for (let i = 0; i < 8; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 10 + Math.random() * 10,
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
          className="absolute w-[1.5px] h-[1.5px] bg-[#C41230] rounded-full opacity-10"
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
      headlineStart: "Ready to",
      headlineHighlight: "start planning?",
      sub: "Tell us what you need, and we'll translate it into a clear design and execution plan.",
    };
  }

  if (pathname.startsWith("/portfolio/")) {
    return {
      ...cta,
      headlineStart: "Want a space",
      headlineHighlight: "like this?",
      sub: "Share your space and timeline. We'll help you figure out the next practical move.",
    };
  }

  const pageCopy: Record<string, Partial<typeof cta>> = {
    "/about-us": {
      headlineStart: "Like what you see?",
      headlineHighlight: "Let's talk.",
      sub: "If you like our approach, let's turn the conversation into a precise project plan.",
    },
    "/services": {
      headlineStart: "Choose your service,",
      headlineHighlight: "then build the plan.",
      sub: "From home interiors to office designs, we help you understand everything before you commit.",
    },
    "/portfolio": {
      headlineStart: "Seen the work?",
      headlineHighlight: "Now shape yours.",
      sub: "Use our past work as a starting point. We'll help bring that same luxury to your own space.",
    },
    "/gallery": {
      headlineStart: "Save the inspiration.",
      headlineHighlight: "Start the plan.",
      sub: "Send us the rooms and moods you love, and we'll turn them into a practical plan for your home.",
    },
    "/blog": {
      headlineStart: "Ideas are useful.",
      headlineHighlight: "Execution makes them real.",
      sub: "If an article sparked an idea, our team can help turn that thought into a real project.",
    },
    "/contact-us": {
      headlineStart: "You are already here.",
      headlineHighlight: "Let's connect.",
      sub: "Share your needs once, and we'll come back with clear next steps and a consultation path.",
    },
    "/estimate": {
      headlineStart: "Have an estimate?",
      headlineHighlight: "Let's make it real.",
      sub: "Use your estimate as the first draft. We'll help refine it into a realistic plan of action.",
    },
    "/aesthetic-discovery-engine": {
      headlineStart: "Found your style?",
      headlineHighlight: "Let's build it.",
      sub: "Your design choices are the beginning. We can translate them into materials, lighting, and layout.",
    },
    "/blueprint": {
      headlineStart: "From blueprint to",
      headlineHighlight: "built experience.",
      sub: "Use our strategy as a starting point, then let us handle the hard work of building it.",
    },
  };

  return {
    ...cta,
    ...(pageCopy[pathname] || {
      headlineStart: "Ready to",
      headlineHighlight: "get started?",
      sub: "Tell us what you need, and we'll help you take the next step.",
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

  const colStyle = "p-[clamp(16px,2vw,32px)] md:border-r border-white/5 border-b md:border-b-0 last:border-b-0";
  const labelStyle = "font-sans text-[10px] tracking-[0.3em] text-white/50 mb-5";

  return (
    <footer
      className="relative overflow-hidden text-white font-['Space_Mono'] block"
      style={{
        background: "radial-gradient(circle at 72% 28%, rgba(196,18,48,0.06), transparent 40%), radial-gradient(circle at 18% 82%, rgba(128,0,18,0.04), transparent 35%), #000"
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
      <div ref={heroRef} className="pt-[80px] pb-[48px] px-[6vw] relative z-20 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
        <div className="max-w-[90vw] lg:max-w-[55%]">
          <motion.h2
            className="font-serif leading-[1.05] text-[clamp(2.8rem,6.5vw,5.8rem)] tracking-tighter animate-in fade-in slide-in-from-bottom duration-1000"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          >
            {footerCopy.headlineStart}<br className="hidden sm:block" />
            <span className="text-[#C41230] italic">{footerCopy.headlineHighlight}</span>
          </motion.h2>
        </div>

        <motion.div
          className="flex flex-col gap-6 lg:max-w-[38%] xl:max-w-[35%]"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
        >
          {footerCopy.sub && (
            <p className="text-white/60 text-[clamp(0.9rem,1vw,1.15rem)] font-sans leading-relaxed tracking-wide max-w-[420px] m-0">
              {footerCopy.sub}
            </p>
          )}

          <div className="flex flex-wrap gap-4 w-full">
            <Magnetic>
              <Link
                to={footerCopy.btn1Link}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#C41230] text-white rounded-full font-sans text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 w-full sm:w-auto text-center"
              >
                <span>{footerCopy.btn1}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>

            {footerCopy.btn2 && (
              <Magnetic>
                <Link
                  to={footerCopy.btn2Link}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-sans text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 w-full sm:w-auto text-center"
                >
                  <span>{footerCopy.btn2}</span>
                </Link>
              </Magnetic>
            )}
          </div>
        </motion.div>
      </div>

      {/* --- GRID --- */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 relative z-20 border-t border-white/5 px-[6vw] w-full">
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
      <div className="flex flex-col md:flex-row items-center justify-between pt-[24px] pb-[24px] px-[6vw] text-[10px] md:text-[11px] text-white/50 relative z-10 w-full mt-8 border-t border-white/10 uppercase tracking-[0.15em] font-sans">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 mb-4 md:mb-0 text-center md:text-left">
          <span className="text-white/80">© {new Date().getFullYear()} CrossAngle Interior</span>
          <span className="hidden md:inline text-[#C41230]/70">✦</span>
          <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white hover:text-[#C41230] transition-colors duration-300">Privacy & DPDPA Policy</Link>
          <span className="hidden md:inline text-[#C41230]/70">✦</span>
          <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-white hover:text-[#C41230] transition-colors duration-300">Terms & Conditions</Link>
        </div>
        <div className="flex items-center gap-2 tracking-[0.2em] text-white/40">
          <span>Design is in the Details</span>
        </div>
      </div>

      {/* --- BG TEXT --- */}
      <div className="absolute bottom-[-80px] left-[50%] -translate-x-1/2 text-[clamp(100px,20vw,300px)] opacity-[0.03] font-serif pointer-events-none whitespace-nowrap z-0 select-none">
        CROSSANGLE
      </div>

    </footer>
  );
}
