import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    id: "essential",
    label: "Essential",
    tagline: "For focused transformations",
    description:
      "Single-room or select-space upgrades. Ideal for homeowners wanting targeted improvements without a full overhaul.",
    includes: [
      "Space planning",
      "Material selection",
      "Custom furniture",
      "Supervision",
    ],
    accent: "border-white/12 hover:border-white/28",
    bg: "bg-[var(--s-canvas-secondary)]",
    labelColor: "text-white/70",
    featured: false,
  },
  {
    id: "signature",
    label: "Signature",
    tagline: "For complete home interiors",
    description:
      "Full-home design and execution. Our most chosen engagement — covers every room, every detail, under one contract.",
    includes: [
      "Everything in Essential",
      "3D visualization",
      "Electrical & lighting design",
      "False ceiling & civil work",
      "Turnkey execution",
      "Dedicated project manager",
    ],
    accent: "border-primary/40 hover:border-primary/70 ring-1 ring-primary/15",
    bg: "bg-[var(--s-canvas-secondary)]",
    labelColor: "text-primary",
    featured: true,
  },
  {
    id: "bespoke",
    label: "Bespoke",
    tagline: "For one-of-a-kind residences",
    description:
      "Fully customised from concept to completion. In-house manufacturing, imported materials, white-glove project management.",
    includes: [
      "Everything in Signature",
      "Bespoke in-house manufacturing",
      "Premium material sourcing",
      "Weekly progress reports",
      "Styling & final decor dressing",
    ],
    accent: "border-primary/30 hover:border-primary/55",
    bg: "bg-[var(--s-canvas-secondary)]",
    labelColor: "text-primary",
    featured: false,
  },
];

const ServicesInvestmentTiers = () => (
  <section className="relative bg-[var(--s-canvas-primary)] py-24 lg:py-36 px-6 overflow-hidden border-b border-[var(--s-border-subtle)]">
    {/* Subtle radial glow */}
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(209,175,110,0.05),transparent)]" />

    <div className="max-w-[1400px] mx-auto relative z-10">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-7"
      >
        <div className="w-10 h-px bg-primary" />
        <span className="font-bold text-[9px] uppercase tracking-[0.45em] text-primary">
          Project Investment
        </span>
      </motion.div>

      {/* Heading */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif font-normal text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.1] tracking-tight text-white"
        >
          Choose Your{" "}
          <em className="italic text-primary font-light underline underline-offset-[10px] decoration-white/10 decoration-[3px]">
            Engagement Level
          </em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="text-[0.95rem] text-white/45 max-w-[42ch] font-light leading-relaxed lg:text-right"
        >
          Investment varies based on scope, materials and execution complexity.
          Use the estimator to get a personalised number.
        </motion.p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative flex flex-col ${tier.bg} border ${tier.accent} transition-all duration-500 p-9 lg:p-11`}
          >
            {tier.featured && (
              <div className="absolute -top-px left-8 bg-primary px-4 py-1 text-[8px] font-bold uppercase tracking-[0.3em] text-black">
                Most Popular
              </div>
            )}

            {/* Label */}
            <div className={`text-[0.75rem] font-bold uppercase tracking-[0.3em] mb-4 ${tier.labelColor}`}>
              {tier.label}
            </div>

            {/* Tagline */}
            <div className="font-serif text-[1.4rem] text-white font-light leading-snug mb-5">
              {tier.tagline}
            </div>

            {/* Description */}
            <p className="text-[0.85rem] text-white/45 leading-relaxed font-light mb-8 flex-1">
              {tier.description}
            </p>

            {/* Includes */}
            <ul className="space-y-2.5 mb-0">
              {tier.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.8rem] text-white/55 font-light">
                  <div className={`mt-[0.45em] w-[5px] h-[5px] rounded-full shrink-0 ${tier.featured ? "bg-primary" : "bg-white/30"}`} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-6 border border-[var(--s-border-subtle)] bg-white/[0.02] px-8 py-6"
      >
        <p className="text-[0.9rem] text-white/55 font-light">
          Not sure which level fits your project?{" "}
          <span className="text-white/80">Our estimator takes 2 minutes.</span>
        </p>
        <Link
          to="/estimate"
          className="home-button-sweep group shrink-0 inline-flex items-center gap-3 bg-primary text-black font-bold uppercase tracking-[0.18em] text-[10px] px-8 py-4 transition-all duration-300 hover:opacity-90 hover:shadow-[0_10px_30px_rgba(209,175,110,0.3)] rounded-sm"
        >
          Get Personalised Estimate
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default ServicesInvestmentTiers;
