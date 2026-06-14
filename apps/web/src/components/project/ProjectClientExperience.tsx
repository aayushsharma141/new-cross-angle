import { motion } from "framer-motion";

interface ProjectClientExperienceProps {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  clientName: string;
  clientRole: string;
}

const ProjectClientExperience = ({ 
  question1, 
  answer1, 
  question2, 
  answer2, 
  clientName, 
  clientRole 
}: ProjectClientExperienceProps) => {
  return (
    <section className="py-24 md:py-32 bg-neutral-950 text-white border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-site-gold block mb-4">Client Experience</span>
          <h2 className="text-3xl md:text-5xl font-serif font-normal text-white">
            The <span className="italic text-site-crimson font-light">Verdict</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h3 className="text-lg md:text-xl font-medium mb-4 text-stone-200">{question1}</h3>
            <p className="text-stone-400 font-light leading-relaxed text-base md:text-lg">&ldquo;{answer1}&rdquo;</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-lg md:text-xl font-medium mb-4 text-stone-200">{question2}</h3>
            <p className="text-stone-400 font-light leading-relaxed text-base md:text-lg">&ldquo;{answer2}&rdquo;</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center gap-4 justify-between"
        >
          <div className="text-center md:text-left">
            <p className="font-serif text-lg font-medium text-white">{clientName}</p>
            <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">{clientRole}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectClientExperience;
