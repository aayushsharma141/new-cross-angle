import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown, Home, Building2, Sofa, UtensilsCrossed, Lamp, MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/config/navigation";
import { SpotlightNavContainer } from "@/components/ui/spotlight-navbar";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";

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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        showTransparent
          ? 'bg-transparent py-5'
          : 'bg-background/95 backdrop-blur-lg shadow-lg py-3 border-b border-border/50'
      )}
    >
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-4 group"
          >
            {/* Logo Icon */}
            <div className="relative">
              <img
                src={logoIcon}
                alt="Cross Angle Interior"
                className={cn(
                  "w-auto transition-all duration-500",
                  isScrolled ? "h-12 md:h-14" : "h-14 md:h-16"
                )}
              />
            </div>
            {/* Brand Text */}
            <AnimatedLogo 
              isScrolled={isScrolled} 
              className="text-xl md:text-2xl lg:text-3xl hidden sm:flex" 
            />
          </Link>

          {/* Desktop Navigation - Increased gaps */}
          <SpotlightNavContainer
            className="hidden lg:flex"
            activeIndex={Math.max(0, navLinks.findIndex(l => location.pathname === l.href))}
          >
            {navLinks.map((link, index) => (
              <div
                key={link.name}
                data-index={index}
                className="relative flex items-center justify-center px-2"
              >
                <Link
                  to={link.href}
                  className={cn(
                    "relative font-medium transition-all duration-300 hover:text-[#FFD700] group flex items-center gap-1 py-4",
                    showTransparent ? 'text-primary-foreground/90' : 'text-muted-foreground',
                    location.pathname === link.href && 'text-[#FFD700]',
                    link.name === "Get Estimate" && "text-[#FFD700] font-bold"
                  )}
                >
                  {link.name}
                  {link.hasMegaMenu && (
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-300",
                    )} />
                  )}

                </Link>
              </div>
            ))}
          </SpotlightNavContainer>


          {/* Phone + CTA - Enhanced */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="https://wa.me/917909041132"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col items-end transition-colors duration-300 hover:text-primary group",
                showTransparent ? 'text-primary-foreground' : 'text-foreground'
              )}
            >
              <span className="text-[10px] uppercase tracking-wider font-medium text-primary mb-0.5">
                Free Site Visit
              </span>
              <span className="flex items-center gap-2 font-medium">
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                +91 7909041132
              </span>
            </a>
            <Link to="/contact-us">
              <Button
                className="px-6 py-5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-500 hover:-translate-y-0.5 font-medium gap-2"
              >
                Book Free Consultation
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              showTransparent
                ? 'text-primary-foreground hover:bg-primary-foreground/10'
                : 'text-foreground hover:bg-accent'
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden mt-6"
            >
              <div className="bg-background/98 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-2xl">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className={cn(
                          "transition-colors duration-300 font-medium text-lg py-3 px-4 rounded-xl block",
                          location.pathname === link.href
                            ? 'text-[#FFD700] bg-[#FFD700]/10'
                            : 'text-foreground hover:text-[#FFD700] hover:bg-accent/50',
                          link.name === "Get Estimate" && "text-[#FFD700] font-bold"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-4">
                    <a
                      href="https://wa.me/917909041132"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground font-medium px-4"
                    >
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-primary block">Free Site Visit</span>
                        <span>+91 7909041132</span>
                      </div>
                    </a>
                    <Link to="/contact-us" onClick={() => setIsOpen(false)} className="w-full">
                      <Button
                        className="w-full shadow-lg py-6 rounded-xl text-base gap-2"
                      >
                        Book Free Consultation
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header >
  );
};

export default Navbar;
