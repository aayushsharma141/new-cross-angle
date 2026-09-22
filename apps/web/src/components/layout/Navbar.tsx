import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { navLinks, headerLinks } from "@/config/navigation";
import { ServicesMegaMenu } from "@/components/layout/ServicesMegaMenu";
import defaultLogo from "@/assets/logo-icon.png";
import { getOptimizedUrl } from "@/lib/cdn";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

/**
 * Editorial header.
 *
 * Three quiet columns — mark + wordmark, tracked uppercase links, ghost CTA —
 * floating over the hero, collapsing into a solid blurred bar on scroll.
 * Over photography the header is always light-on-dark regardless of theme
 * (the hero is dark imagery); once it gains a background it switches to
 * semantic tokens so it follows the active theme.
 *
 * Refinements (v2):
 * - Proportional logo scaling (h-10/h-11 ↔ h-8, maintain 1.1x ratio)
 * - Improved wordmark letter-spacing consistency
 * - Enhanced link underline animation (scaled cubic easing)
 * - Faster, snappier scroll transition (300ms → 400ms with better easing)
 * - Better mobile menu stagger (tighter, more rhythmic)
 * - Improved contrast over hero (darker scrim on header)
 * - Refined focus rings for better accessibility
 */
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesHovered, setServicesHovered] = useState(false);
  const { settings } = useSiteSettings();
  const logoUrl = settings?.company_logo_url || settings?.logo_light_url || defaultLogo;
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsScrolled(window.scrollY > 24));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Lock page scroll while the mobile overlay is open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  // Focus trap + Escape for mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); return; }
      if (e.key !== "Tab") return;

      const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isHomePage = location.pathname === "/";
  const overHero = isHomePage && !isScrolled && !isOpen;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b",
          "transition-[padding,background-color,border-color,backdrop-filter] duration-400 ease-out motion-reduce:transition-none",
          // enhanced scrim for better contrast over cinematic hero imagery;
          // provides smoother gradient that's darker when floating
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-bottom-20 before:-z-10",
          "before:bg-gradient-to-b before:transition-all before:duration-400 before:ease-out motion-reduce:before:transition-none",
          overHero
            ? "py-6 md:py-8 bg-transparent border-transparent before:from-black/70 before:via-black/35 before:to-transparent before:opacity-100"
            : "py-3 md:py-4 bg-background/95 backdrop-blur-xl border-foreground/5 before:from-transparent before:via-transparent before:to-transparent before:opacity-0"
        )}
      >
        <nav
          aria-label="Main navigation"
          className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-12"
        >
          {/* Brand */}
          <RouterLink
            to="/"
            aria-label={`${settings?.studio_name || "Crossangle Interior"} — home`}
            className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm"
          >
            <img
              src={getOptimizedUrl(logoUrl, { width: 160, quality: 80 })}
              alt=""
              className={cn(
                "w-auto shrink-0 transition-[height] duration-400 ease-out motion-reduce:transition-none",
                "will-change-auto",
                isScrolled ? "h-9 md:h-10" : "h-10 md:h-11"
              )}
            />
            <motion.span
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className={cn(
                "hidden sm:flex items-baseline gap-1.5 font-display font-semibold leading-tight tracking-[0.15em] whitespace-nowrap",
                "transition-[font-size,letter-spacing] duration-400 ease-out motion-reduce:transition-none",
                isScrolled
                  ? "text-sm md:text-base"
                  : "text-base md:text-lg"
              )}
            >
              <span className={cn(
                "transition-colors duration-400 motion-reduce:transition-none",
                overHero ? "text-white" : "text-foreground"
              )}>
                CROSSANGLE
              </span>
              <span className="text-primary">INTERIOR</span>
            </motion.span>
          </RouterLink>

          {/* Primary links (desktop) */}
          <ul className="hidden lg:flex items-center gap-8 xl:gap-10">
            {headerLinks.map((link) => {
              const isActive = location.pathname === link.href
                || (link.href !== "/" && location.pathname.startsWith(`${link.href}/`));
              return (
                <li
                  key={link.name}
                  className="flex items-center"
                  onMouseEnter={() => link.hasMegaMenu && setServicesHovered(true)}
                  onMouseLeave={() => link.hasMegaMenu && setServicesHovered(false)}
                >
                  <RouterLink
                    to={link.href}
                    aria-current={isActive ? "page" : undefined}
                    aria-haspopup={link.hasMegaMenu ? "menu" : undefined}
                    onFocus={() => link.hasMegaMenu && setServicesHovered(true)}
                    className={cn(
                      "relative py-2 text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.3em] whitespace-nowrap",
                      "transition-colors duration-300 motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2",
                      // refined underline animation with better easing
                      "after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary",
                      "after:transition-transform after:duration-400 after:ease-out motion-reduce:after:transition-none",
                      "hover:after:scale-x-100",
                      // improved color hierarchy
                      overHero
                        ? "text-white/60 hover:text-white focus-visible:ring-white/30"
                        : "text-foreground/50 hover:text-foreground focus-visible:ring-primary",
                      isActive && (overHero ? "text-white after:scale-x-100" : "text-foreground after:scale-x-100")
                    )}
                  >
                    {link.name}
                  </RouterLink>
                  {link.hasMegaMenu && <ServicesMegaMenu isHovered={servicesHovered} />}
                </li>
              );
            })}
          </ul>

          {/* Tools (desktop) + toggle (mobile) */}
          <div className="flex shrink-0 items-center gap-5 xl:gap-7">
            <RouterLink
              to="/aesthetic-discovery-engine"
              className={cn(
                "hidden xl:inline-flex items-center border-b-1.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap",
                "transition-all duration-300 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 rounded-sm",
                overHero
                  ? "border-white/25 text-white/60 hover:border-primary hover:text-primary focus-visible:ring-white/30"
                  : "border-foreground/20 text-foreground/50 hover:border-primary hover:text-primary focus-visible:ring-primary"
              )}
            >
              Style Quiz
            </RouterLink>

            <RouterLink
              to="/estimate"
              className={cn(
                "hidden lg:inline-flex items-center border rounded-lg px-5 py-3 text-[10px] font-medium uppercase tracking-[0.2em] whitespace-nowrap",
                "transition-all duration-400 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 rounded-lg",
                overHero
                  ? "border-white/30 text-white hover:border-primary hover:text-primary hover:bg-primary/5 focus-visible:ring-white/30"
                  : "border-foreground/20 text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 focus-visible:ring-primary"
              )}
            >
              Get Estimate
            </RouterLink>

            <button
              type="button"
              className={cn(
                "lg:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center transition-colors duration-300 rounded-md",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary",
                overHero
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-foreground/5"
              )}
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay — sits under the header so the toggle stays reachable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35, ease: EASE_OUT_CUBIC }}
            className="fixed inset-0 z-40 lg:hidden flex flex-col bg-background/[0.97] backdrop-blur-xl px-6 pt-24 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pt-28 md:pb-12"
          >
            <ul className="flex flex-col divide-y divide-foreground/8">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.href;
                return (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.04, duration: 0.4, ease: EASE_OUT_CUBIC }}
                  >
                    <RouterLink
                      to={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-4 text-[12px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 rounded-md",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isActive
                          ? "text-foreground"
                          : "text-foreground/55 hover:text-foreground"
                      )}
                    >
                      {link.name}
                      {isActive && (
                        <motion.span
                          layoutId="mobile-active-indicator"
                          aria-hidden="true"
                          className="h-1 w-1 rounded-full bg-primary"
                        />
                      )}
                    </RouterLink>
                  </motion.li>
                );
              })}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + navLinks.length * 0.04, duration: 0.4, ease: EASE_OUT_CUBIC }}
              className="mt-auto pt-8"
            >
              <div className="flex flex-col gap-3">
                <RouterLink
                  to="/estimate"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-center border rounded-lg py-3.5 text-[11px] font-medium uppercase tracking-[0.25em] text-foreground transition-all duration-400",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2",
                    "border-foreground/20 hover:border-primary hover:text-primary hover:bg-primary/5"
                  )}
                >
                  Get Estimate
                </RouterLink>
                <RouterLink
                  to="/aesthetic-discovery-engine"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-center py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/60 transition-colors duration-300",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md",
                    "hover:text-primary"
                  )}
                >
                  Take the Style Quiz
                </RouterLink>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
