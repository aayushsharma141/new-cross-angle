import { motion } from "framer-motion";

interface ProjectClientStoryProps {
  quote: string;
  storyParagraphs: string[];
  imageSrc?: string;
}

const ProjectClientStory = ({ quote, storyParagraphs, imageSrc }: ProjectClientStoryProps) => {
  return (
    <section className="py-24 md:py-32 bg-neutral-950 text-stone-100 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          {/* Left: Pull Quote & Text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.blockquote 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-serif leading-[1.2] tracking-tight mb-12 text-white"
            >
              &ldquo;{quote}&rdquo;
            </motion.blockquote>

            <div className="grid md:grid-cols-2 gap-8 text-stone-400 font-light text-base md:text-lg leading-relaxed">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p>{storyParagraphs[0]}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {storyParagraphs.slice(1).map((p, i) => (
                  <p key={i} className="mb-4 last:mb-0">{p}</p>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right: Candid/Detail Image */}
          {imageSrc && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-5 relative aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl rounded-lg"
            >
              <img src={imageSrc} alt="Project detail" className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
};

export default ProjectClientStory;
