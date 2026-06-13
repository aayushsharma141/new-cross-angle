import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useDynamicCTA } from "@/hooks/useDynamicCTA";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MapPin, Mail, Phone, ArrowRight, Plus, Minus, Instagram, Youtube, Linkedin, Twitter, Facebook, ExternalLink } from "lucide-react";



interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
  wobble: number;
}

// Particles (Ocean Bubbles)
const Particles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 250; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 10 + Math.random() * 30,
        delay: Math.random() * -20,
        size: 1 + Math.random() * 6,
        wobble: Math.random() * 40 - 20,
      });
    }
    setParticles(arr);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full border border-white/30 bg-white/20"
          style={{ 
            left: `${p.x}vw`, 
            top: `100%`, 
            width: `${p.size}px`, 
            height: `${p.size}px` 
          }}
          animate={{ 
            y: [0, -3000],
            x: [0, p.wobble, -p.wobble, 0]
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            x: { duration: p.duration / 2, repeat: Infinity, ease: "easeInOut", delay: p.delay }
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

interface FooterSectionProps {
  title: string;
  id: string;
  openSection: string | null;
  toggleSection: (id: string) => void;
  children: React.ReactNode;
  delay: number;
  className?: string;
}

// MAIN COMPONENT
const FooterSection = ({ title, id, openSection, toggleSection, children, delay, className = "" }: FooterSectionProps) => {
  const isOpen = openSection === id;
  return (
    <motion.div
      className={`flex-1 min-w-[150px] p-0 ${className}`}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    >
      <div 
        className="font-sans text-[10px] tracking-[0.3em] text-white/50 mb-0 md:mb-5 flex justify-between items-center cursor-pointer md:cursor-default"
        onClick={() => toggleSection(id)}
      >
        <span>// {title}</span>
        <span className="md:hidden">
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </div>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] mt-5 opacity-100' : 'max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100 md:mt-0'}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

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
      <div ref={heroRef} className="pt-[100px] pb-[64px] container-wide mx-auto px-4 sm:px-6 lg:px-10 relative z-20 flex flex-col items-center justify-center text-center gap-8 overflow-hidden">
        {/* Ambient Red Glow for premium look */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C41230]/[0.06] rounded-full blur-[100px] pointer-events-none z-0" />
        
        {/* Subtle Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/[0.03] border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-bold tracking-[0.3em] uppercase mb-2 relative z-10 select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          The Next Step
        </motion.div>

        <div className="w-full max-w-[1400px] mx-auto relative z-10">
          <motion.h2
            className="font-serif leading-[1.1] text-[clamp(2.2rem,4.2vw,4.5rem)] tracking-tight text-white mb-2 text-center whitespace-normal md:whitespace-nowrap"
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          >
            {footerCopy.headlineStart}{" "}
            <span className="text-[#C41230] italic font-medium">{footerCopy.headlineHighlight}</span>
          </motion.h2>
        </div>

        <motion.div
          className="flex flex-col items-center gap-6 w-full relative z-10"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="flex flex-wrap justify-center gap-4 w-full">
            <Magnetic>
              <Link
                to={footerCopy.btn1Link}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#C41230] text-white rounded-full font-sans text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto text-center font-semibold border border-transparent shadow-[0_4px_20px_rgba(196,18,48,0.25)] hover:shadow-none"
              >
                <span>{footerCopy.btn1}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>

            {footerCopy.btn2 && (
              <Magnetic>
                <Link
                  to={footerCopy.btn2Link}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/15 text-white rounded-full font-sans text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto text-center font-semibold"
                >
                  <span>{footerCopy.btn2}</span>
                </Link>
              </Magnetic>
            )}
          </div>
        </motion.div>
      </div>

      {/* --- GRID --- */}
      <div ref={gridRef} className="w-full relative z-20 border-t border-white/[0.06] container-wide mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 py-12 md:py-14 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">

          {/* Col 1 — Studio Contact */}
          <FooterSection title="STUDIO" id="studio" openSection={openSection} toggleSection={toggleSection} delay={0} className="pr-0 md:pr-10 pb-8 md:pb-0">
            <p className="text-white/40 text-[11px] leading-relaxed font-sans mb-5 max-w-[220px]">
              Premium turnkey interior design studio headquartered in Jamshedpur, India.
            </p>
            <a
              href={`mailto:${settings?.email || 'info@crossangleinterior.com'}`}
              className="flex items-center gap-2.5 text-[13px] text-white/70 hover:text-[#C41230] transition-colors duration-300 font-sans mb-3 group"
            >
              <Mail className="w-3.5 h-3.5 shrink-0 text-white/30 group-hover:text-[#C41230] transition-colors" />
              {settings?.email || 'info@crossangleinterior.com'}
            </a>
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2.5 text-[13px] text-white/70 hover:text-[#C41230] transition-colors duration-300 font-sans group"
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-white/30 group-hover:text-[#C41230] transition-colors" />
                {settings.phone}
              </a>
            )}
            <LiveClock />
          </FooterSection>

          {/* Col 2 — Location */}
          <FooterSection title="LOCATIONS" id="locations" openSection={openSection} toggleSection={toggleSection} delay={0.1} className="px-0 md:px-10 py-8 md:py-0">
            <div className="flex flex-col gap-5 mb-5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C41230]" />
                {settings?.address ? (
                  <p className="text-[13px] text-white/70 font-sans leading-relaxed">{settings.address}</p>
                ) : (
                  <div>
                    <span className="text-[14px] text-white font-sans font-medium">Headquarters</span>
                    <p className="text-[13px] text-white/50 font-sans mt-0.5">Jamshedpur, Jharkhand 831012, India</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="font-sans text-[10px] tracking-[0.3em] text-white/30 mb-3">SERVICING REGIONS</p>
                <div className="flex flex-col gap-2.5">
                  {(() => {
                    const cities = [
                      { id: 'jamshedpur', name: 'Jamshedpur' },
                      { id: 'bistupur', name: 'Bistupur' },
                      { id: 'adityapur', name: 'Adityapur' },
                      { id: 'kadma', name: 'Kadma' },
                      { id: 'mango', name: 'Mango' },
                      { id: 'sakchi', name: 'Sakchi' },
                      { id: 'sonari', name: 'Sonari' },
                      { id: 'telco', name: 'Telco' },
                      { id: 'golmuri', name: 'Golmuri' },
                      { id: 'baridih', name: 'Baridih' },
                      { id: 'dimna', name: 'Dimna' },
                    ];
                    
                    const rows = [];
                    for (let i = 0; i < cities.length; i += 3) {
                      rows.push(cities.slice(i, i + 3));
                    }
                    
                    return rows.map((row, rIndex) => (
                      <div key={rIndex} className="flex items-center gap-x-2.5 flex-wrap">
                        {row.map((city, cIndex, arr) => (
                          <React.Fragment key={city.id}>
                            <Link
                              to={`/locations/${city.id}`}
                              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                              className="text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-sans whitespace-nowrap"
                            >
                              {city.name}
                            </Link>
                            {cIndex < arr.length - 1 && (
                              <span className="text-white/20 text-[12px] select-none">|</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </FooterSection>

          {/* Col 3 — All Links (merged) */}
          <FooterSection title="NAVIGATE" id="navigate" openSection={openSection} toggleSection={toggleSection} delay={0.2} className="px-0 md:px-10 py-8 md:py-0">
            <div className="grid grid-cols-2 gap-x-6 gap-y-0">
              {[
                { key: 'home', name: 'Home', path: '/' },
                { key: 'gallery', name: 'Gallery', path: '/gallery' },
                { key: 'services', name: 'Services', path: '/services' },
                { key: 'estimate', name: 'Estimator', path: '/estimate' },
                { key: 'portfolio', name: 'Portfolio', path: '/portfolio' },
                { key: 'discovery', name: 'Discovery', path: '/aesthetic-discovery-engine' },
                { key: 'about', name: 'About Us', path: '/about-us' },
                { key: 'blog', name: 'Blog', path: '/blog' },
                { key: 'contact', name: 'Contact', path: '/contact-us' },
              ].map(({ key, name, path }) => (
                <Link
                  key={key}
                  to={path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="block mb-3 text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-sans"
                >
                  {name}
                </Link>
              ))}
            </div>
          </FooterSection>

          {/* Col 4 — Socials as labelled icon pills */}
          <FooterSection title="CONNECT" id="socials" openSection={openSection} toggleSection={toggleSection} delay={0.3} className="pl-0 md:pl-10 pt-8 md:pt-0">
            <p className="text-white/40 text-[11px] font-sans mb-5">Follow us on social media</p>
            <div className="flex flex-col gap-2.5">
              {([
                { key: 'instagram', name: 'Instagram', Icon: Instagram },
                { key: 'facebook', name: 'Facebook', Icon: Facebook },
                { key: 'youtube', name: 'YouTube', Icon: Youtube },
                { key: 'linkedin', name: 'LinkedIn', Icon: Linkedin },
                { key: 'twitter', name: 'Twitter / X', Icon: Twitter },
              ] as { key: string; name: string; Icon: React.ElementType }[]).map(({ key, name, Icon }) => {
                const url = settings?.social_links?.[key];
                const href = (url && typeof url === 'string' && url.trim().length > 0) ? url : "#";
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-sans group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-[#C41230]/10 group-hover:border-[#C41230]/20 transition-all duration-200">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    {name}
                  </a>
                );
              })}
            </div>
          </FooterSection>
        </div>
      </div>

      {/* --- BOTTOM --- */}
      <div className="border-t border-white/[0.06] container-wide mx-auto px-4 sm:px-6 lg:px-10 relative z-10 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between py-5 gap-3 text-[10px] md:text-[11px] text-white/40 uppercase tracking-[0.2em] font-sans">
          <span className="text-white/60 font-medium tracking-[0.2em]">© {new Date().getFullYear()} Crossangle Studio. All Rights Reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors duration-200">Terms</Link>
          </div>
        </div>
      </div>

      {/* --- BG TEXT --- */}
      <div className="absolute bottom-[-110px] left-[50%] -translate-x-1/2 text-[clamp(100px,20vw,300px)] opacity-[0.03] font-serif pointer-events-none whitespace-nowrap z-0 select-none">
        CROSSANGLE
      </div>

    </footer>
  );
}
