import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutCTA = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden border-t border-white/5">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />

      {/* Gold Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(209,175,110,0.1),transparent_50%)]" />

      {/* Animated shapes */}
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-background/5 blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-background/5 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(rgba(209,175,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(209,175,110,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Let's Create Something
            <br />
            <span className="text-[#d1af6e]">Beautiful Together</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Ready to transform your space? Schedule a free consultation
            and let's discuss how we can bring your vision to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="group h-14 px-8 text-base rounded-full bg-[#d1af6e] text-black hover:bg-[#b09258] transition-all duration-300 shadow-[0_0_20px_rgba(209,175,110,0.3)] hover:shadow-[0_0_30px_rgba(209,175,110,0.5)] border-none"
            >
              <Link to="/contact" className="flex items-center gap-2">
                Get In Touch
                <motion.span className="inline-block" whileHover={{ x: 4 }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="group h-14 px-8 text-base rounded-full border-[#d1af6e]/30 text-white bg-transparent hover:bg-[#d1af6e]/10 hover:text-[#d1af6e] transition-all duration-300"
            >
              <a href="tel:+919304XXXXXX" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-[#d1af6e]/80 text-sm tracking-wider uppercase font-medium">
              Free consultation • Personalized designs • Trusted by 500+ clients
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCTA;
