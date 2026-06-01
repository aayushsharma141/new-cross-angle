import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/config/navigation";
import { SpotlightNavContainer } from "@/components/ui/enhanced/spotlight-navbar";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";

const GOLD = "text-[#D1AF6E]";
const GOLD_BG = "bg-[#D1AF6E]/10";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

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
  const showTransparent = isHomePage && !isScrolled;
  const navLinkClass = showTransparent ? "text-primary-foreground/90" : "text-muted-foreground";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        showTransparent
          ? "bg-transparent py-4 md:py-5"
          : "bg-background/95 backdrop-blur-xl shadow-xl py-2 md:py-2.5 border-b border-border/40"
      )}
    >
      <nav className="container-wide mx-auto px-4 sm:px-6 lg:px-10" aria-label="Main navigation">
        <div className={cn(
          "flex justify-between items-center relative gap-2 sm:gap-4 transition-all duration-500",
          isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
        )}>
          {/* Logo Area (Left) */}
          <div className="flex justify-start items-center min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 z-10 shrink-0 group min-w-0">
              <img
                src={logoIcon}
                alt="Cross Angle Interior"
                style={{ imageRendering: "auto" }}
                className={cn(
                  "w-auto transition-all duration-500 shrink-0 drop-shadow-[0_0_1px_rgba(255,255,255,0.1)]",
                  isScrolled ? "h-9 md:h-12" : "h-11 md:h-16"
                )}
              />
              <AnimatedLogo
                isScrolled={isScrolled}
                className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0"
              />
            </Link>
          </div>

          {/* Centered Pill Menu (Desktop) */}
          <div className="hidden lg:flex justify-center items-center h-full">
            <div className="pointer-events-auto">
              <SpotlightNavContainer
                activeIndex={navLinks.findIndex((l) => location.pathname === l.href)}
                className="px-1"
              >
                {navLinks.map((link, index) => (
                  <div key={link.name} data-index={index} className="relative flex items-center px-4">
                    <Link
                      to={link.href}
                      className={cn(
                        "relative font-medium transition-all duration-300 hover:text-[#D1AF6E] group flex items-center gap-1.5 whitespace-nowrap",
                        navLinkClass,
                        location.pathname === link.href && GOLD,
                        link.name === "Get Estimate" && "font-bold"
                      )}
                    >
                      {link.name}
                      {link.hasMegaMenu && (
                        <ChevronDown className="w-4 h-4 transition-transform duration-300 opacity-60 group-hover:opacity-100" />
                      )}
                    </Link>
                  </div>
                ))}
              </SpotlightNavContainer>
            </div>
          </div>

          {/* Right CTA / Mobile Toggle */}
          <div className="flex items-center justify-end gap-4 z-10">
            <Link to="/estimate" className="hidden lg:block">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative group"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-site-crimson via-[#b5132b] to-site-crimson blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-[pulse_3s_ease-in-out_infinite]" />
                <Button className="relative px-7 py-2.5 rounded-full font-semibold bg-gradient-to-r from-site-crimson to-[#b5132b] text-white border border-white/20 shadow-[0_4px_20px_rgba(227,24,55,0.4)] hover:shadow-[0_6px_30px_rgba(227,24,55,0.6)] transition-all duration-300 overflow-hidden group/btn flex items-center gap-2">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative">Get Free Estimate</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover/btn:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </motion.div>
            </Link>

            <button
              className={cn(
                "lg:hidden p-2.5 rounded-xl transition-colors",
                showTransparent
                  ? "text-primary-foreground hover:bg-primary-foreground/10"
                  : "text-foreground hover:bg-accent"
              )}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden mt-4"
              role="menu"
            >
              <div className="bg-background/98 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-2xl">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        to={link.href}
                        className={cn(
                          "transition-colors duration-200 font-medium text-base py-2.5 px-4 rounded-xl block",
                          location.pathname === link.href
                            ? `${GOLD} ${GOLD_BG}`
                            : "text-foreground hover:text-[#D1AF6E] hover:bg-accent/50",
                          link.name === "Get Estimate" && "font-bold"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link to="/estimate" onClick={() => setIsOpen(false)} className="block">
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      className="relative group w-full"
                    >
                      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-site-crimson to-[#b5132b] blur-sm opacity-50" />
                      <Button className="relative w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-site-crimson to-[#b5132b] text-white border border-white/20 shadow-[0_4px_20px_rgba(227,24,55,0.35)] overflow-hidden group/btn flex items-center justify-center gap-2">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                        <span className="relative">Get Free Estimate</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="relative w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover/btn:translate-x-1"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
