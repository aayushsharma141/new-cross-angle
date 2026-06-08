import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { services } from "@/config/site-content";
import { ArrowRight, Sparkles } from "lucide-react";
import { Image } from "@/components/ui/enhanced/image";

interface ProjectServicesProps {
  category: string;
  type: string;
}

const ProjectServices = ({ category, type }: ProjectServicesProps) => {
  // Try to find a matching service based on category or type
  const matchedServices = services.filter((s) => {
    const sTitle = s.title.toLowerCase();
    const sSlug = s.slug.toLowerCase();
    const cat = category?.toLowerCase() || "";
    return (
      cat.includes(sSlug) || 
      cat.includes(sTitle) || 
      sTitle.includes(cat) ||
      (cat === "residential" && s.categoryId === "residential") ||
      (cat === "commercial" && s.categoryId === "commercial")
    );
  }).slice(0, 2); // Show top 2 matches max

  // Fallback if no direct match is found (e.g. show general residential/commercial links)
  const displayServices = matchedServices.length > 0 ? matchedServices : services.filter(s => s.categoryId === (type === 'commercial' ? 'commercial' : 'residential')).slice(0, 2);

  if (displayServices.length === 0) return null;

  return (
    <div className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary flex items-center gap-4 mb-4">
              <span className="w-8 h-px bg-primary/50" /> Services Rendered
            </span>
            <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-normal">
              How We Achieved This
            </h2>
          </div>
          <p className="text-stone-400 max-w-md font-light text-lg">
            Discover the specialized services and design methodologies we applied to bring this vision to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {displayServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                to={`/services/${service.categoryId}/${service.slug}`}
                className="group relative flex overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 hover:border-primary/30 transition-all duration-500 h-full"
              >
                <div className="w-1/3 aspect-[3/4] relative overflow-hidden">
                  <Image 
                    src={service.heroImage} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                    imageClassName="transition-transform duration-700 group-hover:scale-110"
                    width={400}
                    height={533}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="w-2/3 p-8 flex flex-col justify-center relative">
                  <Sparkles className="w-5 h-5 text-primary/50 mb-4" />
                  <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-stone-400 font-light mb-6 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center text-xs font-medium uppercase tracking-[0.1em] text-primary mt-auto">
                    Explore Service <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectServices;
