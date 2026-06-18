import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping helper
const IconMap: Record<string, LucideIcon> = {
  Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed
};

export function ServicesMegaMenu({ isHovered, isScrolled }: { isHovered: boolean; isScrolled?: boolean }) {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
    staleTime: 5 * 60 * 1000,
  });

  const categories = [
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
    { id: "specialized", label: "Specialized" },
  ];

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed left-1/2 -translate-x-1/2 w-[860px] max-w-[95vw] z-50 cursor-default transition-all duration-300 ${isScrolled ? 'top-[68px]' : 'top-[84px]'}`}
        >
          <div className="bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-site-crimson/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-site-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
            
            <div className="relative z-10 grid grid-cols-3 gap-8">
              {categories.map((cat) => {
                const catServices = services?.filter((s) => s.category_id === cat.id) || [];
                
                return (
                  <div key={cat.id} className="space-y-4">
                    <h3 className="font-serif text-site-gold border-b border-white/10 pb-2 text-lg">
                      {cat.label}
                    </h3>
                    
                    {catServices.length > 0 ? (
                      <ul className="space-y-3">
                        {catServices.slice(0, 5).map((service) => {
                          const Icon = service.icon ? IconMap[service.icon] : null;
                          return (
                            <li key={service.id}>
                              <Link 
                                to={`/services/${service.category_id}/${service.slug}`}
                                className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                              >
                                {Icon && (
                                  <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-site-crimson/20 group-hover:text-site-crimson transition-colors">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                )}
                                <span className="text-sm font-medium">{service.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                        {catServices.length > 5 && (
                          <li>
                            <Link 
                              to={`/services#${cat.id}`}
                              className="text-xs text-site-crimson hover:text-site-crimson/80 transition-colors uppercase tracking-wider font-semibold"
                            >
                              View All {cat.label}
                            </Link>
                          </li>
                        )}
                      </ul>
                    ) : (
                      <div className="text-xs text-white/40 italic py-2">
                        No services available yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Not sure where to start?</h4>
                <p className="text-sm text-white/50">Take our interactive style quiz.</p>
              </div>
              <Link 
                to="/quiz" 
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10"
              >
                Start Discovery Engine
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
