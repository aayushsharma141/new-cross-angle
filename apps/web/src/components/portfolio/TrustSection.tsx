import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const TrustSection = () => {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: api.getTestimonials,
  });

  if (isLoading) {
    return (
      <div className="container px-6 flex justify-center items-center h-48">
        <div className="w-8 h-8 rounded-full border-t-2 border-site-gold animate-spin"></div>
      </div>
    );
  }

  // Fallback if no testimonials
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="container px-6">
      <div className="mx-auto max-w-4xl space-y-32">
        {testimonials.slice(0, 3).map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: i * 0.3 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-site-gold to-transparent" />
            
            <h3 className="text-2xl font-light italic leading-relaxed text-white md:text-4xl">
              “{t.quote}”
            </h3>

            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white">
                {t.author}
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                {t.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrustSection;
