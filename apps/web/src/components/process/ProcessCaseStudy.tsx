import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const caseStudy = {
  title: "Serene Master Suite",
  location: "Jamshedpur",
  type: "Residential",
  timeline: "30 Days",
  budget: "₹8–10 Lakhs",
  area: "450 sq.ft",
  stages: [
    { stage: "Consult", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop" },
    { stage: "Measure & Plan", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop" },
    { stage: "Design", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" },
    { stage: "Execute", image: "https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=600&auto=format&fit=crop" },
    { stage: "Handover", image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop" },
  ],
  slug: "serene-master-suite"
};

const ProcessCaseStudy = () => {
  return (
    <section className="relative bg-[#050505] border-t border-white/[0.05] py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-kiro-accent" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-kiro-accent">In Action</span>
            <div className="w-12 h-px bg-kiro-accent" />
          </div>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight text-white">
            See the Process <span className="italic font-medium text-kiro-accent">In Action</span>
          </h2>
          <p className="text-[1rem] text-white/60 font-light mt-4 max-w-[50ch] mx-auto">
            Every stage of our process applied to a real project — the Sharma family&apos;s 450 sq.ft master suite in Jamshedpur.
          </p>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 text-center"
        >
          <div>
            <div className="text-[9px] uppercase tracking-widest text-stone-500">Project</div>
            <div className="text-sm font-medium text-white">{caseStudy.title}</div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-stone-500">Location</div>
            <div className="text-sm font-medium text-white">{caseStudy.location}</div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-stone-500">Timeline</div>
            <div className="text-sm font-medium text-white">{caseStudy.timeline}</div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-stone-500">Budget</div>
            <div className="text-sm font-medium text-white">{caseStudy.budget}</div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-stone-500">Area</div>
            <div className="text-sm font-medium text-white">{caseStudy.area}</div>
          </div>
        </motion.div>

        {/* Stage Image Row */}
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {caseStudy.stages.map((s, idx) => (
            <motion.div
              key={s.stage}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900"
            >
              <img
                src={s.image}
                alt={`${s.stage} stage`}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[8px] font-mono tracking-wider text-kiro-accent mb-0.5">
                  0{idx + 1}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white">
                  {s.stage}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to={`/portfolio/${caseStudy.slug}`}
            className="group inline-flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors font-light"
          >
            View Full Project Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessCaseStudy;
