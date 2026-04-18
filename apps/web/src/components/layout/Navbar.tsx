import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/config/navigation";
import { SpotlightNavContainer } from "@/components/ui/enhanced/spotlight-navbar";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";

const GOLD = "text-[#FFD700]";
const GOLD_BG = "bg-[#FFD700]/10";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = location.pathname === "/";
  const showTransparent = isHomePage && !isScrolled;
  const navLinkClass = showTransparent ? "text-primary-foreground/90" : "text-muted-foreground";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        showTransparent
          ? "bg-transparent py-4"
          : "bg-background/95 backdrop-blur-lg shadow-lg py-3 border-b border-border/50"
      )}
    >
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoIcon}
              alt="Cross Angle Interior"
              className={cn(
                "w-auto transition-all duration-500",
                isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"
              )}
            />
            <AnimatedLogo
              isScrolled={isScrolled}
              className="text-xl md:text-2xl lg:text-3xl hidden sm:flex"
            />
          </Link>

          <SpotlightNavContainer
            className="hidden lg:flex"
            activeIndex={navLinks.findIndex((l) => location.pathname === l.href)}
          >
            {navLinks.map((link, index) => (
              <div key={link.name} data-index={index} className="relative flex items-center px-3">
                <Link
                  to={link.href}
                  className={cn(
                    "relative font-medium transition-all duration-300 hover:text-[#FFD700] group flex items-center gap-1",
                    navLinkClass,
                    location.pathname === link.href && GOLD,
                    link.name === "Get Estimate" && "font-bold"
                  )}
                >
                  {link.name}
                  {link.hasMegaMenu && (
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                  )}
                </Link>
              </div>
            ))}
          </SpotlightNavContainer>

          <Link to="/contact-us" className="hidden lg:block">
            <Button className="px-5 py-2.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 font-medium">
              Book Free Consultation
            </Button>
          </Link>

          <button
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              showTransparent
                ? "text-primary-foreground hover:bg-primary-foreground/10"
                : "text-foreground hover:bg-accent"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden mt-4"
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
                            : "text-foreground hover:text-[#FFD700] hover:bg-accent/50",
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
                  <Link to="/contact-us" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full py-5 rounded-xl font-medium">
                      Book Free Consultation
                    </Button>
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
