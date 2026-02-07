import { ArrowRight, Calculator, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaterRippleEffect from "./WaterRippleEffect";
import { CostCalculator as CostCalculatorModal } from "./CostCalculator";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, HeroContent } from "@/lib/api";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroContent, setHeroContent] = useState<HeroContent>({
    badgeText: "Premier Interior Design Studio",
    headlineLine1: "Elevate Your Space",
    headlineLine2: "Into Luxury",
    subtitle:
      "Transforming your vision into exquisite living spaces with innovative and personalized interior design solutions.",
  });

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

  useEffect(() => {
    let isMounted = true;
    api
      .getHeroContent()
      .then((data) => {
        if (isMounted) {
          setHeroContent(data);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  // Simplified parallax values for mobile
  const parallaxBg = isMobile ? 0 : scrollY * 0.3;
  const parallaxContent = isMobile ? 0 : scrollY * 0.15;
  const opacity = isMobile ? 1 : Math.max(0, 1 - scrollY / 600);

  const handleScrollToServices = () => {
    document.getElementById('about')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Water Ripple Mouse Effect - Desktop only */}
      <WaterRippleEffect />

      {/* Background Video with optimized Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: isMobile ? 'none' : `translateY(${parallaxBg}px)`,
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
          poster="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920"
        >
          <source src="https://videos.pexels.com/video-files/7578546/7578546-uhd_2560_1440_30fps.mp4" type="video/mp4" />
          <source src="https://cdn.coverr.co/videos/coverr-interior-design-of-a-living-room-2679/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/95 via-[#0A0A0A]/70 to-[#0A0A0A]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/30" />
        {/* Subtle wine tint overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(352_78%_31%/0.08)_0%,transparent_60%)]" />
      </div>

      {/* Content */}
      <div
        className="container mx-auto px-4 relative z-10 pt-20"
        style={{
          transform: isMobile ? 'none' : `translateY(${-parallaxContent}px)`,
          opacity
        }}
      >
        <div className="max-w-4xl mx-4 md:mx-[20px] px-4 md:px-[30px]">
          <div
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <span className="inline-flex items-center gap-2 text-primary font-medium mb-6 tracking-[0.15em] uppercase text-xs md:text-sm border border-primary/30 px-3 md:px-4 py-2 rounded-full backdrop-blur-sm bg-primary/5">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              {heroContent.badgeText}
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            </span>
          </div>

          <h1
            className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary-foreground leading-[1.05] mb-6 md:mb-8 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            {heroContent.headlineLine1}
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]">
              {heroContent.headlineLine2}
            </span>
          </h1>

          <p
            className={`text-primary-foreground/85 text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 leading-relaxed font-light max-w-2xl transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            {heroContent.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-3 md:gap-4 mb-10 md:mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Link to="/contact-us">
              <Button size="lg" className="group text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 w-full sm:w-auto">
                Book Free Consultation
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsCalculatorOpen(true)}
              className="bg-primary-foreground/5 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground text-base md:text-lg px-6 md:px-8 py-5 md:py-6 group transition-all duration-300"
            >
              <Calculator className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Estimate Your Cost
            </Button>
          </div>

          {/* Trust Badges - Social Proof Bar */}
          <div className={`flex flex-wrap items-center gap-6 md:gap-8 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 border-2 border-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground/70 text-sm font-medium"
                >
                  {i === 4 ? "98%" : "★"}
                </div>
              ))}
            </div>
            <div className="text-primary-foreground/80">
              <div className="font-semibold text-base md:text-lg">Trusted by 500+ Families</div>
              <div className="text-xs md:text-sm text-primary-foreground/60">4.9/5 Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scroll Indicator */}
      <button
        onClick={handleScrollToServices}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 group cursor-pointer"
        style={{ opacity }}
      >
        <div className={`flex flex-col items-center gap-2 text-primary-foreground/50 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs tracking-widest uppercase font-medium group-hover:text-primary transition-colors">Discover More</span>
          <div className="w-8 h-12 md:w-10 md:h-14 border-2 border-primary-foreground/30 rounded-full flex flex-col items-center justify-start pt-2 backdrop-blur-sm group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
            <div className="w-1.5 h-2.5 md:h-3 bg-primary rounded-full animate-bounce" />
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-primary mt-1 animate-pulse" />
          </div>
        </div>
      </button>

      {/* Cost Calculator Modal */}
      <CostCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </section>
  );
};

export default Hero;
