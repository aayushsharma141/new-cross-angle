import { motion } from "framer-motion";

interface ProjectBriefProps {
  brief: string;
}

const ProjectBrief = ({ brief }: ProjectBriefProps) => {
  if (!brief) return null;

  return (
    <section id="brief" className="py-24 md:py-32 border-t border-white/5 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-500">
            02. Project Brief
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-white leading-[1.6] font-light">
            {brief}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectBrief;
