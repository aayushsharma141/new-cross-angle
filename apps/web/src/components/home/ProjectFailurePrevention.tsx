import { ScrollReveal } from "../ui/enhanced/scroll-reveal";
import { AlertOctagon, CheckCircle2 } from "lucide-react";

const rows = [
  {
    topic: "Budget Control",
    industryProblem: "Artificially low upfront estimates, followed by constant additions and hidden charges mid-build.",
    crossangleSolution: "Fixed-price contracts based on a comprehensive, line-item BOQ. What we quote is what you pay—no hidden fees.",
  },
  {
    topic: "Deadlines & Handover",
    industryProblem: "Unmanaged labor and weak coordination lead to projects dragging months past the agreed date.",
    crossangleSolution: "Dynamic Gantt tracking and custom manufacturing schedules backed by our 45-day penalty-backed delivery guarantee.",
  },
  {
    topic: "Material Integrity",
    industryProblem: "Vague specs lead to cheap plywood, low-grade laminates, and counterfeit hardware that warp within years.",
    crossangleSolution: "100% brand-certified hardware (Hafele, Hettich, etc.) and factory-calibrated boards with a 10-year warranty.",
  },
  {
    topic: "Technical Oversight",
    industryProblem: "Lack of pre-planning leads to incorrect placement of electric sockets, kitchen plumbing, and false ceiling cutouts.",
    crossangleSolution: "Exhaustive 2D CAD layouts and 3D mockups detailing plumbing, electrical, and lighting specs before sourcing materials.",
  }
];

export const ProjectFailurePrevention = () => {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-[#060504] text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -right-64 w-[400px] h-[400px] bg-site-crimson/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10 px-4">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="text-site-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              Our Safeguards
            </span>
          </div>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.1] tracking-tight text-white mb-6">
            Why Interior Projects <br />
            <span className="text-site-crimson italic">Go Wrong</span> — And How We Prevent It
          </h2>
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl font-light">
            We don't claim to be superior designers; we demonstrate a superior understanding of execution risks. Here is how we safeguard your investment:
          </p>
        </div>

        {/* Comparison Matrix */}
        <div className="max-w-6xl mx-auto space-y-6">
          {rows.map((row, index) => (
            <ScrollReveal key={index} animation="fade-up" delay={index * 0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-[#0c0a09] border border-white/[0.04] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06] hover:border-site-gold/10 transition-all duration-300">
                {/* Topic Column */}
                <div className="lg:col-span-3 p-6 md:p-8 flex items-center bg-[#110f0e]">
                  <h3 className="text-base font-semibold tracking-wider uppercase text-site-gold font-display">
                    {row.topic}
                  </h3>
                </div>

                {/* Industry Problem Column */}
                <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-start">
                  <div className="flex items-center gap-2 mb-3 text-white/40">
                    <AlertOctagon className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Typical Builder Route</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-light">
                    {row.industryProblem}
                  </p>
                </div>

                {/* CrossAngle Solution Column */}
                <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-start bg-site-crimson/[0.02] border-l-2 border-l-site-crimson/50">
                  <div className="flex items-center gap-2 mb-3 text-site-crimson">
                    <CheckCircle2 className="w-4 h-4 text-site-crimson shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Our Prevention Protocol</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed font-light">
                    {row.crossangleSolution}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectFailurePrevention;
