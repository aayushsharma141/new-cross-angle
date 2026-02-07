import { useState, useEffect, useRef } from "react";
import { Home, Ruler, Palette, Hammer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Home,
    title: "Consult",
    subtitle: "Free Meeting",
    duration: "1-2 days",
    description: "Share your vision with our expert designers",
    details: [
      "Understanding your lifestyle & space usage",
      "Budget & timeline alignment discussion",
      "On-site or virtual meeting options",
      "Initial concept sketches shared"
    ]
  },
  {
    icon: Ruler,
    title: "Measure & Plan",
    subtitle: "Blueprint",
    duration: "3-5 days",
    description: "Precise measurements and detailed planning",
    details: [
      "Professional site survey & measurements",
      "Structural assessment & feasibility",
      "Space optimization strategies",
      "Material selection guidance"
    ]
  },
  {
    icon: Palette,
    title: "Design Approval",
    subtitle: "3D Views",
    duration: "7-10 days",
    description: "Review realistic 3D visualizations before execution",
    details: [
      "Photorealistic 3D renders of your space",
      "Multiple design options to choose from",
      "Material & finish samples provided",
      "Revisions until you're satisfied"
    ]
  },
  {
    icon: Hammer,
    title: "Execute",
    subtitle: "Quality Craftsmanship",
    duration: "30-45 days",
    description: "Expert craftsmen bring your design to life",
    details: [
      "Skilled craftsmen & quality materials",
      "Regular progress updates & site visits",
      "Strict quality control checkpoints",
      "Timeline adherence & milestone reviews"
    ]
  },
  {
    icon: CheckCircle2,
    title: "Handover",
    subtitle: "Final Reveal",
    duration: "1 day",
    description: "Walk through your transformed space",
    details: [
      "Complete walkthrough of finished space",
      "Quality assurance inspection",
      "Warranty documentation provided",
      "Post-project support available"
    ]
  },
];

const Process = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps(prev => new Set([...prev, index]));
            setActiveStep(index);
          }
        },
        { threshold: 0.4 }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden bg-muted/5"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <span className="text-primary text-sm uppercase tracking-[0.3em] font-medium">
            How We Work
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mt-4">
            Our Design Process
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">
            From concept to completion, we guide you through every step
          </p>
        </div>

        {/* Timeline - Works on both mobile and desktop */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isVisible = visibleSteps.has(index);
              const isActive = activeStep === index;

              return (
                <div
                  key={index}
                  ref={el => stepRefs.current[index] = el}
                  className={cn(
                    "flex gap-4 md:gap-6 transition-all duration-500",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Icon & Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg shrink-0 transition-all duration-500",
                        isActive
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-primary/80 text-primary-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-2 min-h-[40px] md:min-h-[60px] transition-colors duration-500",
                          isVisible ? "bg-primary/50" : "bg-primary/20"
                        )}
                      />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pb-4">
                    <div
                      className={cn(
                        "p-4 md:p-6 rounded-xl border shadow-sm transition-all duration-500",
                        isActive
                          ? "bg-background border-primary/30 shadow-md"
                          : "bg-background/50 border-border"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground text-base md:text-lg">{step.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium border border-primary/20">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                      {/* Details - Show on active or always on larger screens */}
                      <ul
                        className={cn(
                          "space-y-2 transition-all duration-500 overflow-hidden",
                          isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0 md:max-h-40 md:opacity-70"
                        )}
                      >
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs md:text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-foreground/80">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
