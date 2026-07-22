import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed, LucideIcon } from "lucide-react";
import { Surface, Grid, Text, Stack } from "@/components/primitives/foundation";
import { Link, Button } from "@/components/primitives/interactive";

// Icon mapping helper
const IconMap: Record<string, LucideIcon> = {
  Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed
};

export function ServicesMegaMenu({ isHovered }: { isHovered: boolean }) {
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
          className="absolute top-full left-0 pt-6 w-[800px] z-50 cursor-default"
        >
          <Surface variant="glass" border radius="lg" shadow="xl" className="p-8 overflow-hidden relative bg-background/95">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
            
            <Grid cols={3} gap="xl" className="relative z-10">
              {categories.map((cat) => {
                const catServices = services?.filter((s) => s.category_id === cat.id) || [];
                
                return (
                  <Stack key={cat.id} gap="md">
                    <h3 className="font-serif text-primary border-b border-border pb-2 text-lg">
                      {cat.label}
                    </h3>
                    
                    {catServices.length > 0 ? (
                      <Stack as="ul" gap="sm">
                        {catServices.slice(0, 5).map((service) => {
                          const Icon = service.icon ? IconMap[service.icon] : null;
                          return (
                            <li key={service.id}>
                              <Link 
                                as={RouterLink}
                                to={`/services/${service.category_id}/${service.slug}`}
                                variant="muted"
                                underline="none"
                                className="group flex items-center gap-3 transition-colors"
                              >
                                {Icon && (
                                  <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
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
                              as={RouterLink}
                              to={`/services#${cat.id}`}
                              variant="primary"
                              underline="none"
                              className="text-xs uppercase tracking-wider font-semibold"
                            >
                              View All {cat.label}
                            </Link>
                          </li>
                        )}
                      </Stack>
                    ) : (
                      <Text variant="caption" color="muted" className="italic py-2">
                        No services available yet.
                      </Text>
                    )}
                  </Stack>
                );
              })}
            </Grid>
            
            <div className="relative z-10 mt-8 pt-6 border-t border-border flex items-center justify-between">
              <div>
                <Text variant="body" className="font-medium mb-1">Not sure where to start?</Text>
                <Text variant="caption" color="muted">Take our interactive style quiz.</Text>
              </div>
              <Link 
                as={RouterLink}
                to="/aesthetic-discovery-engine" 
                underline="none"
              >
                <Button variant="outline" size="sm" className="rounded-full">
                  Start Discovery Engine
                </Button>
              </Link>
            </div>
          </Surface>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
