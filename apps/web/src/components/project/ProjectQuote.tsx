import { motion } from "framer-motion";
import { Quote, MessageCircle } from "lucide-react";

interface ProjectQuoteProps {
  quote: string;
  attribution?: string;
  whatsappNumber?: string;
}

const ProjectQuote = ({
  quote = "Now this room feels like peace. We close the door, and the rest of the world simply drops away.",
  attribution = "— Rahul & Charu, Homeowners",
  whatsappNumber = "917909041132",
}: ProjectQuoteProps) => {
  return (
    <section className="px-6 max-w-4xl mx-auto w-full text-center flex flex-col items-center gap-16 py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <Quote className="w-12 h-12 text-primary/40 mb-16" />
        
        <h3 className="text-3xl md:text-5xl text-white font-serif font-normal tracking-tight leading-[1.3] mb-16">
          "{quote.replace(/^"|"$/g, '')}"
        </h3>
        
        {attribution && (
          <p className="text-sm tracking-widest text-stone-500 uppercase font-light">
            {attribution.startsWith('—') ? attribution : `— ${attribution}`}
          </p>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="w-full max-w-lg mt-12 p-10 rounded-[2rem] bg-neutral-900/50 border border-white/5 backdrop-blur-sm flex flex-col items-center gap-6"
      >
        <h4 className="text-xl text-white font-serif tracking-tight">Want this feeling in your home?</h4>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button className="flex-1 bg-white text-black hover:bg-stone-200 px-6 py-3.5 rounded-full text-[10px] font-medium tracking-[0.2em] uppercase transition-colors">
            Book Free Consultation
          </button>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer" 
            className="flex-1 border border-white/20 hover:bg-white/5 text-white px-6 py-3.5 rounded-full text-[10px] font-medium tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default ProjectQuote;
