import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const GalleryCTA = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      {/* Floating accent elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1.2, 1, 1.2]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>

          {/* Text reveal */}
          <motion.h2
            className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {"Ready to Transform".split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Space?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Let's create something extraordinary together. Schedule a free consultation
            and let our expert designers bring your vision to life.
          </motion.p>

          {/* Animated button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden px-8"
            >
              <Link to="/contact-us">
                <span className="relative z-10 flex items-center gap-2">
                  Get Free Consultation
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
                {/* Animated gradient border */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ opacity: 0.1 }}
                />
              </Link>
            </Button>
            <Link to="/services">
              <Button
                size="lg"
                variant="outline"
                className="px-8"
              >
                Explore Services
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Free Consultation
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Expert Designers
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              100% Satisfaction
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryCTA;
