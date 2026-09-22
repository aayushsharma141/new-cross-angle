import { motion } from "framer-motion";
import { Home, RefreshCw, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const archetypes = [
  {
    icon: Home,
    tag: "New Possession",
    title: "New Home Owners",
    situation:
      "You just received possession of a new apartment or villa. Empty shell. Full possibilities. You need someone who can take it from raw concrete to move-in ready.",
    outcomes: [
      "Complete design from scratch",
      "Vendor coordination included",
      "Move-in ready in 90–120 days",
    ],
    accentClass: "text-kiro-accent border-kiro-accent/30 hover:border-kiro-accent/60",
    glowClass: "from-site-gold/8",
    dotClass: "bg-kiro-accent",
    href: "/services/residential",
  },
  {
    icon: RefreshCw,
    tag: "Existing Home",
    title: "Renovating Families",
    situation:
      "Your current home no longer reflects who you are. Space isn't working. Or you're upgrading before a milestone. You want transformation, not disruption.",
    outcomes: [
      "Selective or complete renovation",
      "Minimal daily disruption",
      "Structural + aesthetic upgrade",
    ],
    accentClass: "text-kiro-accent border-kiro-accent/30 hover:border-kiro-accent/55",
    glowClass: "from-site-crimson/7",
    dotClass: "bg-kiro-accent",
    href: "/services/residential",
  },
  {
    icon: Briefcase,
    tag: "Office · Clinic · Cafe",
    title: "Business Owners",
    situation:
      "Your space has to do more than look good — it has to perform. For offices, clinics, showrooms and cafes that need to communicate brand and function simultaneously.",
    outcomes: [
      "Brand-aligned environments",
      "Functional floor planning",
      "Minimum operational disruption",
    ],
    accentClass: "text-white/80 border-white/15 hover:border-white/35",
    glowClass: "from-white/[0.03]",
    dotClass: "bg-white/60",
    href: "/services/commercial",
  },
];

const ServiceArchetypes = () => (
  <section className="relative bg-[#030303] py-24 lg:py-36 px-6 overflow-hidden border-b border-white/[0.04]">
    {/* Grid lines */}
    <div className="absolute inset-0 opacity-[0.022] pointer-events-none select-none">
      <div className="absolute top-0 left-1/3 w-px h-full bg-white" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-white" />
    </div>

    <div className="max-w-[1400px] mx-auto relative z-10">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-7"
      >
        <div className="w-10 h-px bg-kiro-accent" />
        <span className="font-bold text-[9px] uppercase tracking-[0.45em] text-kiro-accent">
          Who We Work Best With
        </span>
      </motion.div>

      {/* Heading row */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-16 lg:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif font-normal text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.1] tracking-tight text-white"
        >
          Find Your{" "}
          <em className="italic text-kiro-accent font-light underline underline-offset-[10px] decoration-white/10 decoration-[3px]">
            Situation
          </em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-[0.95rem] text-white/45 max-w-[44ch] font-light leading-relaxed lg:text-right"
        >
          Every project starts with a different context. We've built frameworks
          for each one — pick the path that matches where you are.
        </motion.p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {archetypes.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={a.href}
                className={`group flex flex-col h-full bg-gradient-to-b ${a.glowClass} to-transparent border ${a.accentClass} transition-all duration-500 relative overflow-hidden p-9 lg:p-11`}
                style={{ minHeight: 400 }}
              >
                {/* Tag row */}
                <div className="flex items-center justify-between mb-10">
                  <span className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/35">
                    {a.tag}
                  </span>
                  <Icon className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-[1.65rem] lg:text-[1.8rem] text-white font-light leading-[1.15] mb-6">
                  {a.title}
                </h3>

                {/* Situation */}
                <p className="text-[0.88rem] text-white/48 leading-[1.75] font-light mb-9 flex-1">
                  {a.situation}
                </p>

                {/* Outcomes */}
                <ul className="space-y-2.5">
                  {a.outcomes.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2.5 text-[0.82rem] text-white/55 font-light"
                    >
                      <div
                        className={`mt-[0.45em] w-[5px] h-[5px] rounded-full ${a.dotClass} shrink-0 opacity-50`}
                      />
                      {o}
                    </li>
                  ))}
                </ul>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default ServiceArchetypes;
