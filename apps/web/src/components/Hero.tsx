import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import WaterRippleEffect from "./WaterRippleEffect";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogoAnimation } from "./LogoAnimation";
import { GridDistortion } from "./ReactBits";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(() => setIsVisible(true), 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const parallaxBg = isMobile ? 0 : scrollY * 0.3;
  const parallaxContent = isMobile ? 0 : scrollY * 0.15;
  const opacity = isMobile ? 1 : Math.max(0, 1 - scrollY / 600);

  const handleScrollToStudio = () => {
    document.getElementById('services')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-site-bg">
      {/* Water Ripple Mouse Effect - Desktop only */}
      {!isMobile && <WaterRippleEffect />}

      {/* Background Layer */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: isMobile ? 0 : parallaxBg }}
      >
        {/* Dark Video / Atmospheric Base */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 opacity-40"
          poster="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920"
        >
          <source src="https://videos.pexels.com/video-files/7578546/7578546-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>

        {/* Grid Distortion Overlay */}
        <div className="absolute inset-0 w-full h-full scale-105 z-10 hidden md:block mix-blend-screen opacity-30">
          <GridDistortion
            amplitude={0.1}
            speed={0.1}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradients - Subtle left fade + bottom text protection */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[70%] bg-gradient-to-r from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />
      </motion.div>

      {/* Content Layout */}
      <div className="container mx-auto px-4 relative z-30 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Messaging */}
          <motion.div
            className="lg:col-span-7 xl:col-span-8"
            style={{
              y: isMobile ? 0 : -parallaxContent,
              opacity: opacity
            }}
          >
            <div className={isVisible ? "opacity-100 translate-y-0 transition-all duration-1000" : "opacity-0 translate-y-10"}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-bold text-white leading-[1.1] mb-8">
                Design Your <br />
                <em>Dream</em> Home.
              </h1>

              <p className="text-[#A3A09C] text-lg md:text-xl lg:text-2xl mb-10 leading-relaxed font-light max-w-2xl">
                From concept to completion, we create beautiful spaces that reflect 
                your lifestyle and inspire your everyday.
              </p>

              {/* Action Area */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/gallery">
                  <Button
                    size="lg"
                    className="bg-site-crimson hover:bg-[#A30E28] text-white uppercase tracking-[0.2em] text-xs font-bold px-10 h-14 rounded-none group"
                  >
                    Check Our Works
                    <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link to="/spatial-identity-os">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[rgba(237,234,230,0.1)] hover:border-[rgba(237,234,230,0.35)] text-white uppercase tracking-[0.2em] text-xs font-medium px-10 h-14 rounded-none"
                  >
                    Discover Your Aesthetic
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Logo Only */}
          <motion.div
            className="hidden lg:flex lg:col-span-5 xl:col-span-4 justify-center relative"
            initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
            animate={isVisible ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ perspective: 1000 }}
          >
            <LogoAnimation size={isMobile ? 300 : 450} />
          </motion.div>
        </div>
      </div>


    </section>
  );
};

export default Hero;
