import { Award, Users, Clock, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { Link } from "react-router-dom";

const stats = [
  { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
  { icon: Users, value: 500, suffix: "+", label: "Happy Clients" },
  { icon: Clock, value: 750, suffix: "+", label: "Projects Completed" },
  { icon: Sparkles, value: 25, suffix: "+", label: "Design Awards" },
];

const features = [
  "Personalized Design Approach",
  "Premium Material Selection",
  "On-Time Project Delivery",
  "Post-Completion Support",
];

const StatCard = ({
  stat,
  index
}: {
  stat: typeof stats[0];
  index: number;
}) => {
  const { count, ref } = useCountUp(stat.value, { duration: 2000, delay: index * 150 });

  return (
    <div
      ref={ref}
      className="text-center px-4 md:px-6 py-4"
    >
      <div className="flex items-center justify-center mb-2">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <stat.icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
        {count}{stat.suffix}
      </div>
      <div className="text-primary-foreground/60 text-xs md:text-sm font-medium uppercase tracking-wider mt-1">
        {stat.label}
      </div>
    </div>
  );
};

const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-muted/5">
      {/* Dark overlay matching hero */}
      <div className="absolute inset-0 bg-background/95 z-0" />

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-wine-500/10 to-transparent z-[1]" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-wine-500/5 rounded-full blur-3xl z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Horizontal Stats Bar */}
        <div className="mb-16">
          <div className="relative bg-card/40 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden">
            {/* Stats Grid - Horizontal on all screens */}
            <div className="flex overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-4 divide-x divide-white/5">
              {stats.map((stat, index) => (
                <div key={index} className="min-w-[50%] md:min-w-0 snap-center">
                  <StatCard stat={stat} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <span className="inline-block text-primary font-medium tracking-[0.2em] uppercase text-sm mb-4 border-b-2 border-primary/30 pb-2">
              About Us
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight">
              Creating Spaces <br />
              <span className="text-primary">That Inspire</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
              Welcome to Crossangle Interior, a premier interior design studio
              where creativity meets craftsmanship. Our team of passionate designers
              brings together diverse expertise in residential, commercial, and
              hospitality design.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
              We believe that great design is about more than aesthetics—it's
              about creating environments that enhance how you live, work, and
              feel.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                    <CheckCircle className="w-3 h-3 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-foreground/90 text-sm md:text-base font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link to="/about-us">
              <button className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-full font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:bg-wine-600 active:bg-wine-700">
                Learn More About Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Visual Element */}
          <div className="relative hidden lg:block">
            {/* Background Shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-3xl transform rotate-3 z-0" />

            <div className="relative p-8 z-10">
              <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                    Award-Winning Design
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Recognized for excellence in interior design across Jharkhand and Kolkata.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="font-bold text-3xl">25+</span>
                    <span className="text-muted-foreground/80 text-sm">Awards Won</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl z-20">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <div>
                  <div className="font-bold text-lg">Certified</div>
                  <div className="text-primary-foreground/90 text-sm">Design Experts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
