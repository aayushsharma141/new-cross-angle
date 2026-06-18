import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, Calculator, PhoneCall, ArrowRight } from "lucide-react";

const CTA_CARDS = [
  {
    icon: Compass,
    title: "Discover Your Style",
    description: "Not sure what you want? Take our 3-minute style quiz and get matched with a design archetype.",
    label: "Take the Quiz",
    href: "/aesthetic-discovery-engine",
  },
  {
    icon: Calculator,
    title: "Estimate Your Project",
    description: "Get a ballpark price for your renovation or new build based on size and scope.",

    label: "Get an Estimate",
    href: "/estimate",
  },
  {
    icon: PhoneCall,
    title: "Book a Consultation",
    description: "Ready to start? Schedule a call with our design team to discuss your project.",
    label: "Book a Call",
    href: "/contact-us",
  },
];

const HomeFinalCTA = () => {
  return (
    <section className="bg-gradient-to-b from-neutral-950 via-neutral-900/50 to-neutral-950 py-24 md:py-32 relative overflow-hidden border-t border-white/[0.05]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-site-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight mb-4">
            Ready to transform your space?
          </h2>
          <p className="text-stone-400 text-lg font-light max-w-2xl mx-auto">
            Whether you&apos;re just exploring or ready to build, we have a path for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CTA_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  to={card.href}
                  className="block group h-full"
                >
                  <div className="h-full p-8 rounded-2xl border border-white/[0.06] bg-neutral-900/40 backdrop-blur-sm hover:bg-neutral-800/40 hover:border-site-gold/30 transition-all duration-500">
                    <div className="w-12 h-12 rounded-xl bg-site-gold/10 flex items-center justify-center mb-6 group-hover:bg-site-gold/20 transition-colors">
                      <Icon className="w-5 h-5 text-site-gold" />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-3">{card.title}</h3>
                    <p className="text-sm text-stone-400 font-light leading-relaxed mb-6">
                      {card.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-semibold text-site-gold group-hover:gap-3 transition-all">
                      {card.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeFinalCTA;