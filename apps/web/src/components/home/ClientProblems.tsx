import { HelpCircle, Clock, Image, Heart, Users, ArrowRight } from "lucide-react";
import { ScrollReveal } from "../ui/enhanced/scroll-reveal";

const problems = [
  {
    icon: HelpCircle,
    question: "Not sure what it should cost?",
    description: "Vague estimates lead to unexpected bills. We replace guesswork with a complete, line-item BOQ (Bill of Quantities) before you commit.",
  },
  {
    icon: Clock,
    question: "Worried about endless contractor delays?",
    description: "Projects that drag on for months disrupt your family. We coordinate all custom manufacturing and labor under a penalty-backed 45-day delivery guarantee.",
  },
  {
    icon: Image,
    question: "Overwhelmed by Pinterest inspiration?",
    description: "What looks stunning online might not translate to your actual room dimensions. We design layouts customized specifically to your lifestyle and floor plan.",
  },
  {
    icon: Heart,
    question: "Unsure which style fits your family?",
    description: "Choosing colors, veneers, and layout configurations can feel like a gamble. Our aesthetic discovery process matches materials to your daily routine.",
  },
  {
    icon: Users,
    question: "Afraid of choosing the wrong designer?",
    description: "Committing your hard-earned money requires deep trust. We walk you through full 3D models and technical layouts so you know exactly what you get.",
  }
];

export const ClientProblems = () => {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-[#050505] text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-site-crimson/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-site-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 px-4">
          <ScrollReveal animation="fade-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-site-crimson" />
              <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
                The Reality Check
              </span>
            </div>
            
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Planning a Home <span className="text-site-crimson italic font-light serif">Interior Project?</span>
            </h2>
            
            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-light">
              Before hiring any studio, most homeowners face the same set of unspoken worries and risks. Here is the reality of building a premium space in Jamshedpur:
            </p>
          </ScrollReveal>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-14">
          {problems.map((prob, index) => (
            <ScrollReveal key={index} animation="fade-up" delay={index * 0.1}>
              <div className="h-full p-6 md:p-8 rounded-2xl bg-[#0d0d0c] border border-white/[0.04] hover:border-site-crimson/30 hover:bg-[#121211] transition-all duration-500 flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-site-crimson/10 border border-site-crimson/20 flex items-center justify-center mb-6 group-hover:bg-site-crimson/20 transition-colors">
                    <prob.icon className="w-5 h-5 text-site-crimson" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-3 font-display group-hover:text-site-gold transition-colors">
                    {prob.question}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-light">
                    {prob.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Empathy-to-Process Conclusion */}
        <div className="text-center px-4">
          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="inline-flex items-center gap-3 text-sm font-sans font-semibold text-site-gold">
              <span>That’s exactly why we built our structured process</span>
              <ArrowRight className="w-4 h-4 text-site-crimson animate-pulse" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ClientProblems;
