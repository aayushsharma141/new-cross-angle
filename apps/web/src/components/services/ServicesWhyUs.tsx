import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const comparisonRows = [
  {
    label: "Project Management",
    others: "Fragmented / Multiple vendors",
    us: "Single contract / One accountability",
  },
  {
    label: "Timeline",
    others: "Uncertain / Delays common",
    us: "Guaranteed / Weekly updates",
  },
  {
    label: "Pricing",
    others: "Hidden costs / Scope creep",
    us: "Transparent pricing / Real-time calibration",
  },
  {
    label: "Quality Control",
    others: "Inconsistent / Third-party dependent",
    us: "In-house manufacturing / Precision fabrication",
  },
  {
    label: "Communication",
    others: "Chase multiple contacts",
    us: "Dedicated PM / Single point of contact",
  },
  {
    label: "Handover",
    others: "Unresolved punch list",
    us: "Zero-deficit walkthrough / White-glove handover",
  },
];

const ServicesWhyUs = () => {
  return (
    <section className="relative bg-black py-24 lg:py-48 overflow-hidden px-6">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-site-crimson/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-12 h-px bg-site-crimson" />
          <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">The Distinction</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-normal text-[clamp(2.2rem,3.8vw,3.8rem)] leading-[1.1] tracking-tight text-white mb-4"
        >
          Others promise.{" "}
          <span className="italic text-site-crimson font-medium">We deliver.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[1.15rem] text-white/60 font-light leading-relaxed max-w-[48ch] mb-16"
        >
          See how the CrossAngle interior experience compares to working with traditional firms.
        </motion.p>

        {/* Comparison Table */}
        <div className="w-full overflow-x-auto">
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full border-collapse"
          >
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-5 pr-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 w-[30%]">
                  Aspect
                </th>
                <th className="text-left py-5 px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 w-[35%]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    Other Firms
                  </div>
                </th>
                <th className="text-left py-5 px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-site-crimson w-[35%]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-site-crimson/10 border border-site-crimson/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-site-crimson" />
                    </div>
                    CrossAngle
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="border-b border-white/[0.04] group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-5 pr-6 text-[0.95rem] text-white font-medium">
                    {row.label}
                  </td>
                  <td className="py-5 px-6 text-[0.9rem] text-white/40 font-light">
                    {row.others}
                  </td>
                  <td className="py-5 px-6 text-[0.9rem] text-white/90 font-light group-hover:text-site-gold transition-colors">
                    {row.us}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono">
            Clear scope. Clear pricing. Clear delivery.
          </span>
          <div className="w-8 h-px bg-site-crimson/50" />
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesWhyUs;
