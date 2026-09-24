import React from "react";
import { motion } from "framer-motion";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Instagram, Youtube, Linkedin, Twitter, Facebook } from "lucide-react";
import { useDynamicCTA } from "@/hooks/useDynamicCTA";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { navLinks } from "@/config/navigation";
import { SERVICE_BANDS } from "@/config/service-area";

const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

/**
 * Footer enhancements (v3 - Mobile-First + Immersive):
 *
 * Scroll-Triggered Animations:
 * - Content reveals as user scrolls (whileInView)
 * - Staggered delays for natural flow (0.04s per item)
 * - Better viewport detection (once: true, amount: 0.2)
 *
 * Micro-Interactions (Mobile-First):
 * - Column items have hover lift effect (active:scale-95 for touch feedback)
 * - Social icons scale + color shift on hover
 * - Better touch target sizing (min-h-12 for mobile)
 * - Active state feedback for mobile users
 *
 * Visual Depth & Hierarchy:
 * - Accent colors per section (primary for cta, secondary tints for columns)
 * - Better color transitions on hover
 * - Improved spacing ratio (1.5x rhythm: 6→9→12→16)
 * - Visual separators between sections
 *
 * Footer refinements (v2):
 * - Faster reveal animations (900ms → 700ms)
 * - Improved CTA button with better hover and focus states
 * - Enhanced link styling with underline animations
 * - Better social icon hover effects with smooth color transitions
 * - Improved column spacing and visual hierarchy
 * - Refined legal section with better visual separation
 * - Better mobile responsive spacing
 * - Consistent focus ring styling
 * - Enhanced reveal delay timing for staggered entrance
 */
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

// Local-SEO landing pages; kept as a single quiet line rather than a column
/** Jamshedpur's own districts — every one is an anchor on /locations. */
const FOOTER_AREAS = SERVICE_BANDS.find((b) => b.id === "jamshedpur")?.areas ?? [];

const SOCIALS: { key: string; name: string; Icon: React.ElementType }[] = [
  { key: "instagram", name: "Instagram", Icon: Instagram },
  { key: "facebook", name: "Facebook", Icon: Facebook },
  { key: "youtube", name: "YouTube", Icon: Youtube },
  { key: "linkedin", name: "LinkedIn", Icon: Linkedin },
  { key: "twitter", name: "Twitter / X", Icon: Twitter },
];

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const columnHeading = "text-[9px] font-bold uppercase tracking-[0.3em] text-white/35 mb-7";
const columnLink =
  "group relative inline-flex items-center text-sm font-light text-white/65 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] rounded-sm active:scale-95 min-h-10 md:min-h-auto";
const legalLink =
  "group relative inline-flex items-center text-white/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] active:scale-95 min-h-10 md:min-h-auto";

/**
 * Editorial footer.
 *
 * Two bands on a fixed dark surface: a brand statement with the page-aware
 * CTA on the left and three quiet link columns on the right, then a hairline
 * legal strip. Always light-on-dark regardless of theme — like the hero, it is
 * a photographic/dark surface by design, so it uses `white` and the gold
 * `primary` token rather than theme-following foreground tokens.
 */
export default function Footer() {
  const { cta } = useDynamicCTA();
  const location = useLocation();
  const footerCopy = getFooterCopy(location.pathname, cta);
  const { settings } = useSiteSettings();

  const email = settings?.email || "info@crossangleinterior.com";
  const phone = settings?.phone;
  const address = settings?.address || "Jamshedpur, Jharkhand 831012, India";
  const studioName = settings?.studio_name || "Crossangle Interior";

  const socials = SOCIALS.filter(({ key }) => {
    const url = settings?.social_links?.[key];
    return typeof url === "string" && url.trim().length > 0;
  });

  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.7, delay, ease: EASE_OUT_CUBIC },
  });

  return (
    <footer className="relative bg-[#0A0A0A] text-white pt-24 pb-32 md:pt-40 md:pb-24 overflow-hidden">
      {/* Subtle architectural grid pattern - connects to interior design theme */}
      <div className="absolute inset-0 -z-10 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(201,168,92,0.3) 1px, transparent 1px),
          linear-gradient(rgba(201,168,92,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />
      {/* Subtle gradient for connection - fades from transparent to dark */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0A0A0A]/0 via-[#0A0A0A]/20 to-[#0A0A0A]" />

      {/* Large brand text background (PlayFolly style) */}
      <div className="absolute bottom-0 right-0 -z-[5] text-[12vw] md:text-[20vw] font-display font-bold leading-none text-white/5 pointer-events-none whitespace-nowrap select-none">
        CROSSANGLE
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-12 relative z-10">
        {/* ── Statement + columns ─────────────────────────────── */}
        <div className="flex flex-col gap-20 md:flex-row md:justify-between md:gap-24 md:items-start mb-24 md:mb-36">
          {/* Statement */}
          <motion.div {...reveal()} className="w-full md:w-[38%] lg:w-1/3">
            <h2 className="font-display text-[2rem] md:text-[2.5rem] leading-[1.08] text-white mb-8">
              {footerCopy.headlineStart}{" "}
              <span className="italic text-primary">{footerCopy.headlineHighlight}</span>
            </h2>
            <p className="max-w-xs text-[15px] font-light leading-relaxed text-white/55 mb-12">
              {footerCopy.sub}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <RouterLink
                to={footerCopy.btn1Link}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-primary/40 px-6 py-3.5 md:px-7 md:py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-all duration-400 hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0A0A] motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-primary transition-transform duration-400 ease-out group-hover:translate-x-0 motion-reduce:transition-none"
                />
                <span className="relative z-10 flex items-center gap-2.5">
                  {footerCopy.btn1}
                  <span className="transition-transform duration-400 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">→</span>
                </span>
              </RouterLink>

              <RouterLink
                to={footerCopy.btn2Link}
                className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
              >
                {footerCopy.btn2}
              </RouterLink>
            </div>
          </motion.div>

          {/* Columns */}
          <div className="grid w-full grid-cols-2 gap-x-8 gap-y-12 md:w-[58%] md:grid-cols-4 md:gap-x-6 md:gap-y-0 lg:w-2/3">
            {/* Explore Part 1 */}
            <motion.div {...reveal(0.04)}>
              <h4 className={columnHeading}>Explore</h4>
              <ul className="space-y-3.5">
                {navLinks.filter((l) => l.href !== "/" && l.href !== "/about-us" && l.href !== "/our-process" && l.href !== "/blog").map((link) => (
                  <li key={link.href}>
                    <RouterLink
                      to={link.href}
                      onClick={scrollTop}
                      className={`${columnLink} hover:text-white hover:translate-x-1 md:hover:translate-x-0.5`}
                    >
                      {link.name}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Explore Part 2 */}
            <motion.div {...reveal(0.06)}>
              <h4 className={columnHeading}>&nbsp;</h4>
              <ul className="space-y-3.5">
                {navLinks.filter((l) => (l.href === "/about-us" || l.href === "/our-process" || l.href === "/blog")).map((link) => (
                  <li key={link.href}>
                    <RouterLink
                      to={link.href}
                      onClick={scrollTop}
                      className={`${columnLink} hover:text-white hover:translate-x-1 md:hover:translate-x-0.5`}
                    >
                      {link.name}
                    </RouterLink>
                  </li>
                ))}
                <li>
                  <RouterLink
                    to="/aesthetic-discovery-engine"
                    onClick={scrollTop}
                    className={`${columnLink} hover:text-white hover:translate-x-1 md:hover:translate-x-0.5`}
                  >
                    Style Quiz
                  </RouterLink>
                </li>
              </ul>
            </motion.div>

            <motion.div {...reveal(0.08)}>
              <h4 className={columnHeading}>Studio</h4>
              <ul className="space-y-4 text-sm font-light text-white/65">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className={`${columnLink} hover:text-white hover:translate-x-1 md:hover:translate-x-0.5`}
                    >
                      {phone}
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href={`mailto:${email}`}
                    className={`${columnLink} break-all hover:text-white hover:translate-x-1 md:hover:translate-x-0.5`}
                  >
                    {email}
                  </a>
                </li>
                <li className="leading-relaxed">
                  <span className="block text-white font-medium mt-1">{studioName}</span>
                  <address className="not-italic text-white/60 text-[13px] mt-2">{address}</address>
                </li>
              </ul>
            </motion.div>

            <motion.div {...reveal(0.12)} className="col-span-2 md:col-span-1">
              <h4 className={columnHeading}>Social</h4>
              {socials.length > 0 ? (
                <ul className="flex flex-wrap gap-x-6 gap-y-3 md:flex-col md:gap-y-3.5">
                  {socials.map(({ key, name, Icon }) => (
                    <li key={key}>
                      <a
                        href={settings?.social_links?.[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${columnLink} hover:text-primary group hover:translate-x-1 md:hover:translate-x-0.5 active:scale-90`}
                      >
                        <Icon className="h-4 w-4 text-white/45 transition-all duration-300 group-hover:text-primary group-hover:scale-125 group-active:scale-100 flex-shrink-0" aria-hidden="true" />
                        <span className="ml-2">{name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-light text-white/40">Coming soon.</p>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Service areas (local-SEO links, kept deliberately quiet) ── */}
        <motion.div
          {...reveal(0.08)}
          className="mb-16 pt-16 border-t border-white/8 flex flex-wrap items-baseline gap-x-3 gap-y-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30"
        >
          <span className="mr-2 text-white/35">Serving</span>
          {FOOTER_AREAS.map((area, i) => (
            <React.Fragment key={area.slug}>
              <RouterLink
                to={`/locations#${area.slug}`}
                className="group relative inline-flex py-1.5 px-1 text-white/25 hover:text-white/70 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] active:scale-95 rounded-sm"
              >
                {area.name}
              </RouterLink>
              {i < FOOTER_AREAS.length - 1 && (
                <span aria-hidden="true" className="h-0.5 w-0.5 self-center rounded-full bg-white/15" />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* ── Legal strip ────────────────────────────────────── */}
        <motion.div
          {...reveal(0.06)}
          className="flex flex-col items-center gap-6 border-t border-white/8 pt-16 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-white/40 md:flex-row md:justify-between md:text-left"
        >
          <p>© {new Date().getFullYear()} {studioName}</p>
          <div className="flex items-center gap-4">
            <RouterLink to="/privacy" onClick={scrollTop} className={`${legalLink} hover:text-white active:scale-95`}>Privacy Policy</RouterLink>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-white/15" />
            <RouterLink to="/terms" onClick={scrollTop} className={`${legalLink} hover:text-white active:scale-95`}>Terms of Service</RouterLink>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
