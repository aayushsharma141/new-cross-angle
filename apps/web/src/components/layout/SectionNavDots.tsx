import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

// Must match section IDs present on the Index page
const sections: Section[] = [
  { id: "home", label: "Home" },
  { id: "discovery", label: "Discover" },
  { id: "portfolio", label: "Portfolio" },
  { id: "before-after", label: "Before/After" },
  { id: "process", label: "Process" },
  { id: "testimonials", label: "Testimonials" },
  { id: "estimator", label: "Estimate" },
  { id: "final-cta", label: "CTA" },
];

const SectionNavDots = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show dots after scrolling past hero
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 200);

      // Determine active section
      const sectionElements = sections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, element } = sectionElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "hidden md:block fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50",
        "transition-all duration-500",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
      )}
      aria-label="Section navigation"
    >
      <ul className="flex flex-col gap-4">
        {sections.map((section) => (
          <li key={section.id} className="relative group">
            <button
              onClick={() => scrollToSection(section.id)}
              className="w-8 h-8 -m-2.5 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Navigate to ${section.label}`}
              aria-current={activeSection === section.id ? "true" : undefined}
            >
              <span
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 block",
                  "border-2 border-background/50",
                  "group-hover:scale-125 group-hover:border-primary",
                  activeSection === section.id
                    ? "bg-primary border-primary scale-110"
                    : "bg-transparent"
                )}
              />
            </button>

            {/* Tooltip */}
            <span
              className={cn(
                "absolute right-6 top-1/2 -translate-y-1/2",
                "px-3 py-1 rounded-lg",
                "bg-card text-card-foreground text-xs font-medium",
                "opacity-0 group-hover:opacity-100",
                "translate-x-2 group-hover:translate-x-0",
                "transition-all duration-200 pointer-events-none whitespace-nowrap",
                "shadow-lg border border-border/50"
              )}
            >
              {section.label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SectionNavDots;
