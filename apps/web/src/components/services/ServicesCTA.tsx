import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ServicesCTA = () => {
  return (
    <section className="bg-[#000000] border-y border-white/10 text-center" style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,80px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[800px] mx-auto"
      >
        <h2 className="font-display font-normal text-[clamp(2.5rem,5vw,4.5rem)] text-[#EDEDED] mb-6">
          Ready to build your legacy?
        </h2>
        
        <p className="text-[1.05rem] text-[#EDEDED]/55 leading-[1.8] font-light mb-10 max-w-[60ch] mx-auto">
          Book a consultation with our design intelligence team to discuss your residential or commercial requirements.
        </p>
        
        <Link 
          to="/contact" 
          className="inline-flex items-center justify-center h-[50px] px-8 bg-[#FF2A2A] text-white font-label text-[10px] font-bold tracking-[0.15em] uppercase rounded-[2px] transition-colors duration-300 hover:bg-[#E62020]"
        >
          Start Your Project
        </Link>
      </motion.div>
    </section>
  );
};

export default ServicesCTA;
