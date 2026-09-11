import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link } from "@/components/primitives/interactive";
import { useDynamicCTA } from "@/hooks/useDynamicCTA";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MapPin, Mail, Phone, Plus, Minus, Instagram, Youtube, Linkedin, Twitter, Facebook } from "lucide-react";






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
    <div className="mt-2.5 text-[12px] font-['Space_Mono'] text-white/50">
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
      btn1: "Book 15-Min Discovery Call",
      btn1Link: "/contact-us",
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
  const contentId = `footer-${id}-content`;
  const buttonId = `footer-${id}-btn`;
  return (
    <motion.div
      className={`flex-1 min-w-[150px] p-0 ${className}`}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    >
      <div
        id={buttonId}
        role="button"
        tabIndex={0}
        {...{"aria-expanded": isOpen}}
        aria-controls={contentId}
        className="font-sans text-[11px] md:text-[12px] tracking-[0.3em] text-white/60 mb-0 md:mb-5 flex justify-between items-center cursor-pointer md:cursor-default py-3 md:py-0 min-h-[44px] md:min-h-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 rounded"
        onClick={() => toggleSection(id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection(id); } }}
      >
        <span className="text-white/30 mr-1.5" aria-hidden="true">—</span>{title}
        <span className="md:hidden">
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </div>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] mt-5 opacity-100' : 'max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100 md:mt-0'}`}
      >
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

  const renderSocialLink = (key: string, name: string, Icon: React.ElementType): React.ReactNode | null => {
    const url = settings?.social_links?.[key];
    if (!url || typeof url !== 'string' || url.trim().length === 0) return null;
    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={name}
        className="inline-flex items-center gap-3 text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-sans group py-1.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
      >
        <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/20 transition-all duration-200" aria-hidden="true">
          <Icon className="w-3.5 h-3.5" />
        </span>
        {name}
      </a>
    );
  };

  return (
    <footer
      className="relative overflow-hidden text-white font-['Space_Mono'] block border-t border-[#D4AF37]/30"
      style={{
        background: "radial-gradient(circle at 72% 28%, rgba(212,175,55,0.03), transparent 40%), #000"
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
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
        style={{ backgroundImage: 'url(/noise.svg)' }}
      />

      {/* Intense dark vignette overlay at the top */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-[#020202] via-[#020202]/70 to-transparent z-10 pointer-events-none" />

      {/* --- HERO --- */}
      <div ref={heroRef} className="pt-[100px] pb-[64px] container-wide mx-auto px-4 sm:px-6 lg:px-10 relative z-20 flex flex-col items-center justify-center text-center gap-8 overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#D4AF37]/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />
        
        {/* Editorial eyebrow — replaces pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-2 relative z-10"
        >
          <div className="w-8 h-px bg-[#C9A85C]/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A85C]/70">Next Steps</span>
          <div className="w-8 h-px bg-[#C9A85C]/40" />
        </motion.div>

        <div className="w-full max-w-[1400px] mx-auto relative z-10">
          <motion.h2
            className="font-serif leading-[1.1] text-[clamp(2rem,3.5vw,3.8rem)] tracking-tight text-white mb-2 text-center"
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          >
            {footerCopy.headlineStart}{" "}
            <span className="text-[#C9A85C] italic font-medium">{footerCopy.headlineHighlight}</span>
          </motion.h2>
        </div>

        <motion.div
          className="flex flex-col items-center gap-6 w-full relative z-10 mt-4"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className="text-white/65 max-w-lg mx-auto text-[14px] md:text-[15px] font-sans tracking-wide leading-relaxed">
            {footerCopy.sub}
          </p>
        </motion.div>
      </div>

      {/* --- GRID --- */}
      <div ref={gridRef} className="w-full relative z-20 border-t border-white/[0.09] container-wide mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 py-12 md:py-14 divide-y md:divide-y-0 md:divide-x divide-white/[0.09]">

          {/* Col 1 — Studio Contact */}
          <FooterSection title="STUDIO" id="studio" openSection={openSection} toggleSection={toggleSection} delay={0} className="pr-0 md:pr-10 pb-8 md:pb-0">
            <p className="text-white/50 text-[12px] leading-relaxed font-sans mb-5 max-w-[220px]">
              Premium turnkey interior design studio headquartered in Jamshedpur, India.
            </p>
            <a
              href={`mailto:${settings?.email || 'info@crossangleinterior.com'}`}
              className="flex items-center gap-2.5 text-[13px] text-white/70 hover:text-[#D4AF37] transition-colors duration-300 font-sans mb-3 group"
            >
              <Mail className="w-3.5 h-3.5 shrink-0 text-white/30 group-hover:text-[#D4AF37] transition-colors" />
              {settings?.email || 'info@crossangleinterior.com'}
            </a>
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2.5 text-[13px] text-white/70 hover:text-[#D4AF37] transition-colors duration-300 font-sans group"
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-white/30 group-hover:text-[#D4AF37] transition-colors" />
                {settings.phone}
              </a>
            )}
            <LiveClock />
          </FooterSection>

          {/* Col 2 — Location */}
          <FooterSection title="LOCATIONS" id="locations" openSection={openSection} toggleSection={toggleSection} delay={0.1} className="px-0 md:px-10 py-8 md:py-0">
            <div className="flex flex-col gap-5 mb-5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#D4AF37]" />
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
                <p className="font-sans text-[11px] tracking-[0.3em] text-white/50 mb-3">SERVICING REGIONS</p>
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
                              as={RouterLink}
                              to={`/locations/${city.id}`}
                              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                              variant="inherit"
                              underline="none"
                              className="text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-sans whitespace-nowrap"
                            >
                              {city.name}
                            </Link>
                            {cIndex < arr.length - 1 && (
                              <span className="text-white/40 text-[12px] select-none">|</span>
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
                  as={RouterLink}
                  to={path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  variant="inherit"
                  underline="none"
                  className="block mb-3 text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-sans"
                >
                  {name}
                </Link>
              ))}
            </div>
          </FooterSection>

          {/* Col 4 — Socials as labelled icon pills */}
          <FooterSection title="CONNECT" id="socials" openSection={openSection} toggleSection={toggleSection} delay={0.3} className="pl-0 md:pl-10 pt-8 md:pt-0">
            <p className="text-white/50 text-[12px] font-sans mb-5">Follow us on social media</p>
            <div className="flex flex-col gap-2.5">
              {([
                { key: 'instagram', name: 'Instagram', Icon: Instagram },
                { key: 'facebook', name: 'Facebook', Icon: Facebook },
                { key: 'youtube', name: 'YouTube', Icon: Youtube },
                { key: 'linkedin', name: 'LinkedIn', Icon: Linkedin },
                { key: 'twitter', name: 'Twitter / X', Icon: Twitter },
              ] as { key: string; name: string; Icon: React.ElementType }[]).map(({ key, name, Icon }) =>
                renderSocialLink(key, name, Icon)
              )}
            </div>
          </FooterSection>
        </div>
      </div>

      {/* --- BOTTOM --- */}
      <div className="border-t border-white/[0.09] container-wide mx-auto px-4 sm:px-6 lg:px-10 relative z-10 w-full">
        {/* Thin gold rule above bottom bar */}
        <div className="w-8 h-px bg-[#C9A85C]/30 mx-auto mt-5" aria-hidden="true" />
        <div className="flex flex-col md:flex-row items-center justify-between py-5 gap-3 text-[10px] md:text-[11px] text-white/40 uppercase tracking-[0.2em] font-sans">
          <span className="text-white/60 font-medium tracking-[0.2em]">© {new Date().getFullYear()} Cross Angle Interior. All Rights Reserved.</span>
          <div className="flex items-center gap-6">
            <Link as={RouterLink} to="/privacy" onClick={() => window.scrollTo(0, 0)} variant="inherit" underline="none" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link as={RouterLink} to="/terms" onClick={() => window.scrollTo(0, 0)} variant="inherit" underline="none" className="hover:text-white transition-colors duration-200">Terms</Link>
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
