import { motion } from "framer-motion";
import { processStages } from "@/data/process";

const TimelineGantt = () => {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const stageWeeks = [
    { stage: processStages[0], start: 0, end: 0 },
    { stage: processStages[1], start: 1, end: 1 },
    { stage: processStages[2], start: 2, end: 3 },
    { stage: processStages[3], start: 4, end: 6 },
    { stage: processStages[4], start: 7, end: 7 },
  ];

  const milestones = [
    { week: 1, label: "Site Visit Complete" },
    { week: 2, label: "Floor Plan Approved" },
    { week: 4, label: "Design Signed Off" },
    { week: 6, label: "Installation Starts" },
    { week: 8, label: "Final Handover" },
  ];

  return (
    <section className="relative bg-[#020202] border-t border-white/[0.05] py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">Timeline</span>
            <div className="w-12 h-px bg-site-crimson" />
          </div>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-white">
            What Your Timeline <span className="italic font-medium text-site-crimson">Looks Like</span>
          </h2>
          <p className="text-[1rem] text-white/60 font-light mt-4 max-w-[50ch] mx-auto">
            A typical residential project spans 8 weeks from consultation to handover. Every phase has defined milestones so you always know what&apos;s next.
          </p>
        </motion.div>

        {/* Week Headers */}
        <div className="grid grid-cols-8 gap-1 mb-1" aria-hidden="true">
          {weeks.map((w, i) => (
            <div
              key={i}
              className="text-center text-[9px] font-mono tracking-wider text-stone-500 py-2 border-b border-white/10"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Gantt Bars */}
        <div className="space-y-1">
          {stageWeeks.map((sw, idx) => {
            const barWidth = ((sw.end - sw.start + 1) / 8) * 100;
            const barLeft = (sw.start / 8) * 100;
            const stageColors = [
              "from-blue-500/80 to-blue-500/40",
              "from-indigo-500/80 to-indigo-500/40",
              "from-violet-500/80 to-violet-500/40",
              "from-site-crimson/80 to-site-crimson/40",
              "from-emerald-500/80 to-emerald-500/40",
            ];

            return (
              <motion.div
                key={sw.stage.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="relative h-12 md:h-14"
              >
                {/* Background track */}
                <div className="absolute inset-0 bg-white/[0.02] rounded-lg border border-white/[0.04]" />

                {/* Filled bar */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${barWidth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.08, ease: "easeOut" }}
                  className={`absolute top-0 bottom-0 rounded-lg bg-gradient-to-r ${stageColors[idx]} border border-white/10`}
                  style={{ left: `${barLeft}%` }}
                >
                  <div className="absolute inset-0 bg-white/[0.03] rounded-lg" />
                </motion.div>

                {/* Label */}
                <div
                  className="absolute inset-0 flex items-center px-4 z-10"
                  style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white truncate">
                    {sw.stage.title}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Milestones */}
        <div className="relative mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-5 gap-1">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-2 h-2 rounded-full bg-site-gold mx-auto mb-2 shadow-[0_0_8px_rgba(197,168,128,0.5)]" />
                <div className="text-[8px] font-mono text-site-gold tracking-wider mb-1">{weeks[m.week - 1]}</div>
                <div className="text-[9px] text-stone-400 font-light leading-snug">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-[11px] text-stone-500 font-light">
            Your timeline may vary based on scope, site conditions, and material availability.
            <br />
            <a
              href="https://wa.me/917909041132"
              target="_blank"
              rel="noopener noreferrer"
              className="text-site-gold hover:underline"
            >
              Get a personalized timeline estimate
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimelineGantt;
