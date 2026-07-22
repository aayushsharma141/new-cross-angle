import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/config/navigation";
import { SpotlightNavContainer } from "@/components/ui/enhanced/spotlight-navbar";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";
import { ServicesMegaMenu } from "@/components/layout/ServicesMegaMenu";
import { Surface, Container, Cluster } from "@/components/primitives/foundation";
import { Link, Button } from "@/components/primitives/interactive";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesHovered, setServicesHovered] = useState(false);
  const { settings } = useSiteSettings();
  const logoUrl = settings?.company_logo_url || settings?.logo_light_url || '/logo-icon.png';
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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Surface
        as="header"
        variant={showTransparent ? "transparent" : "glass"}
        border={!showTransparent}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          showTransparent ? "py-4 md:py-5" : "py-2 md:py-2.5"
        )}
      >
        <Container size="full" as="nav" aria-label="Main navigation">
          <Cluster justify="between" align="center" gap="sm" wrap={false} className={cn(
            "relative transition-all duration-500",
            isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
          )}>
            {/* Logo Area (Left) */}
            <div className="flex justify-start items-center min-w-0">
              <Link as={RouterLink} to="/" underline="none" variant="inherit" className="flex items-center gap-2 sm:gap-3 z-10 shrink-0 group min-w-0">
                <img
                  src={logoUrl}
                  alt={settings?.studio_name || "Cross Angle Interior"}
                  style={{ imageRendering: "auto" }}
                  className={cn(
                    "w-auto transition-all duration-500 shrink-0 drop-shadow-md",
                    isScrolled ? "h-10 md:h-14" : "h-12 md:h-20"
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
                    <div
                      key={link.name}
                      data-index={index}
                      className="flex items-center px-4"
                      onMouseEnter={() => link.hasMegaMenu && setServicesHovered(true)}
                      onMouseLeave={() => link.hasMegaMenu && setServicesHovered(false)}
                    >
                      <Link
                        as={RouterLink}
                        to={link.href}
                        variant={location.pathname === link.href ? "primary" : showTransparent ? "inherit" : "muted"}
                        underline="none"
                        className={cn(
                          "relative font-medium transition-all duration-300 group flex items-center gap-1.5 whitespace-nowrap",
                          showTransparent && location.pathname !== link.href ? "text-primary-foreground/90" : "",
                          link.name === "Get Estimate" && "font-bold"
                        )}
                      >
                        {link.name}
                        {link.hasMegaMenu && (
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-300 opacity-60 group-hover:opacity-100",
                            servicesHovered && "rotate-180 opacity-100"
                          )} />
                        )}
                      </Link>
                      {link.hasMegaMenu && (
                        <ServicesMegaMenu isHovered={servicesHovered} />
                      )}
                    </div>
                  ))}
                </SpotlightNavContainer>
              </div>
            </div>

            {/* Right CTA / Mobile Toggle */}
            <Cluster gap="md" className="z-10 justify-end" wrap={false}>
              <div className="hidden lg:block">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group"
                >
                  <Link as={RouterLink} to="/estimate" underline="none">
                    <Button variant="primary" className="rounded-full shadow-lg px-7">
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
                        className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                </motion.div>
              </div>

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
            </Cluster>
          </Cluster>

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
                <Surface variant="glass" border radius="lg" shadow="xl" className="p-5">
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Link
                          as={RouterLink}
                          to={link.href}
                          variant={location.pathname === link.href ? "primary" : "muted"}
                          underline="none"
                          className={cn(
                            "font-medium text-base py-2.5 px-4 rounded-xl block",
                            location.pathname === link.href && "bg-primary/10",
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
                    <Link as={RouterLink} to="/estimate" underline="none" onClick={() => setIsOpen(false)} className="block w-full">
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="relative group w-full"
                      >
                        <Button variant="primary" className="w-full py-4 rounded-xl shadow-lg">
                          <span className="relative">Get Free Estimate</span>
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </Surface>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Surface>
    </>
  );
};

export default Navbar;
