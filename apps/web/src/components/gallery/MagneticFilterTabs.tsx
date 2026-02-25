import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagneticFilterTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  counts?: Record<string, number>;
}

const MagneticFilterTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
  counts
}: MagneticFilterTabsProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [magneticPosition, setMagneticPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent, category: string) => {
    const button = tabRefs.current.get(category);
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setMagneticPosition({
      x: (e.clientX - centerX) * 0.2,
      y: (e.clientY - centerY) * 0.2
    });
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
    setMagneticPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "py-6 transition-all duration-300 z-40",
        isSticky
          ? "sticky top-20 bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-nowrap overflow-x-auto scrollbar-hide justify-start md:justify-center gap-3 md:gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const isHovered = hoveredTab === category;

            return (
              <motion.button
                key={category}
                ref={(el) => {
                  if (el) tabRefs.current.set(category, el);
                }}
                onClick={() => onCategoryChange(category)}
                onMouseEnter={() => setHoveredTab(category)}
                onMouseMove={(e) => handleMouseMove(e, category)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-300",
                  "border backdrop-blur-sm",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-card/50 text-foreground border-border/50 hover:border-primary/50"
                )}
                style={{
                  transform: isHovered
                    ? `translate(${magneticPosition.x}px, ${magneticPosition.y}px)`
                    : 'translate(0, 0)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect on hover */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <span className="relative z-10 flex items-center gap-2">
                  {category.replace(/-/g, " ")}
                  {counts && counts[category] !== undefined && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {counts[category]}
                    </span>
                  )}
                </span>

                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 w-8 h-1 bg-primary rounded-full"
                    style={{ x: '-50%' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MagneticFilterTabs;
