import { useState, useEffect, useRef } from "react";
import { Home, Ruler, Palette, Hammer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Pinning the left section
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top+=100",
        end: "bottom bottom-=200",
        pin: leftRef.current,
        pinSpacing: false,
        scrub: true,
      });

      // Update active step based on scroll
      steps.forEach((_, index) => {
        ScrollTrigger.create({
          trigger: `#step-content-${index}`,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActiveStep(index);
          },
        });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      mm.revert();
    };
  }, []);

  return (
    <section id="process" className="py-20 md:py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 md:mb-24">
          <span className="text-primary font-mono text-sm tracking-[0.3em] uppercase block mb-4">
            How We Work
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white max-w-2xl">
            A Journey of <span className="text-primary italic">Transformation</span>
          </h2>
        </div>

        <div ref={containerRef} className="flex flex-col md:flex-row gap-0 md:gap-20 relative">
          {/* Left Side: Pinned Visuals (Desktop) */}
          <div ref={leftRef} className="hidden md:block w-1/3 h-[400px]">
            <div className="relative h-full flex items-center justify-center">
              {/* Progress Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
              <div
                className="absolute left-1/2 top-0 w-px bg-primary -translate-x-1/2 transition-all duration-700 ease-out"
                style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />

              {/* Step Icons Ring */}
              <div className="relative z-10 space-y-12">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = activeStep === index;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-700",
                        isActive
                          ? "bg-primary border-primary scale-125 shadow-[0_0_30px_rgba(200,65,42,0.4)]"
                          : "bg-black/50 border-white/10 text-white/40"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", isActive ? "text-white" : "text-white/20")} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Step Contents */}
          <div className="flex-1 space-y-32 md:space-y-[40vh] pb-32 md:pb-[20vh]">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  id={`step-content-${index}`}
                  className={cn(
                    "transition-all duration-700 transform",
                    isActive ? "opacity-100 translate-y-0" : "opacity-30 translate-y-10"
                  )}
                >
                  <div className="max-w-xl">
                    <span className="text-primary font-mono text-xs tracking-widest uppercase mb-4 block">
                      Step 0{index + 1}
                    </span>
                    <h3 className="text-2xl md:text-5xl font-serif font-bold text-white mb-6">
                      {step.title}
                    </h3>
                    <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-8">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.details.map((detail, dIndex) => (
                        <div key={dIndex} className="flex items-center gap-3 text-white/50 bg-white/5 p-4 rounded-xl border border-white/5">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm">{detail}</span>
                        </div>
                      ))}
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
