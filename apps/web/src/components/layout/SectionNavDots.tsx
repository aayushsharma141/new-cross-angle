import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "portfolio", label: "Portfolio" },
  { id: "trust", label: "Why Us" },
  { id: "testimonials", label: "Testimonials" },
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
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                "border-2 border-background/50",
                "hover:scale-125 hover:border-primary",
                activeSection === section.id
                  ? "bg-primary border-primary scale-110"
                  : "bg-transparent"
              )}
              aria-label={`Navigate to ${section.label}`}
              aria-current={activeSection === section.id ? "true" : undefined}
            />

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
