import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  hoverColor: string;
  hoverBg: string;
}

const buildLinks = (settings: ReturnType<typeof useSiteSettings>["settings"]): SocialLink[] => {
  const sl = settings?.social_links;
  const wp = settings?.whatsapp || "917909041132";
  return [
    {
      href: sl?.instagram || "https://www.instagram.com/crossangleinterior/",
      label: "Instagram",
      hoverColor: "#fff",
      hoverBg: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      href: sl?.youtube || "https://www.youtube.com/",
      label: "YouTube",
      hoverColor: "#fff",
      hoverBg: "#FF0000",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
    },
    {
      href: `https://wa.me/${wp}`,
      label: "WhatsApp",
      hoverColor: "#fff",
      hoverBg: "#25D366",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      href: sl?.facebook || "https://www.facebook.com/crossangleinteriors/",
      label: "Facebook",
      hoverColor: "#fff",
      hoverBg: "#1877F2",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      ),
    },
    {
      href: sl?.pinterest || "https://in.pinterest.com/crossangleinterior/",
      label: "Pinterest",
      hoverColor: "#fff",
      hoverBg: "#E60023",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
    },
  ];
};

const FixedSocialBar: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const { settings } = useSiteSettings();
  const links = buildLinks(settings);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <>
      {/* Desktop left sticky bar - positioned slightly inward */}
      <aside className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col">
        <ul className="flex flex-col space-y-3">
          {links.map((link, idx) => (
            <li key={idx}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                style={{
                  background: hoveredIndex === idx ? link.hoverBg : 'hsl(var(--card) / 0.95)',
                  color: hoveredIndex === idx ? link.hoverColor : 'hsl(var(--foreground))',
                  transform: hoveredIndex === idx ? 'scale(1.15) translateX(4px)' : 'scale(1)',
                  boxShadow: hoveredIndex === idx
                    ? '0 8px 25px -5px hsl(var(--primary) / 0.3)'
                    : '0 4px 15px -3px hsl(var(--foreground) / 0.15)',
                }}
              >
                <span className="sr-only">{link.label}</span>
                {link.icon}

                {/* Tooltip label on hover */}
                <span
                  className="absolute left-full ml-3 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap pointer-events-none transition-all duration-300"
                  style={{
                    opacity: hoveredIndex === idx ? 1 : 0,
                    transform: hoveredIndex === idx ? 'translateX(0)' : 'translateX(-8px)',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 4px 12px -2px hsl(var(--foreground) / 0.1)',
                  }}
                >
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile bottom bar - auto-hides on scroll down */}
      <motion.nav
        className="md:hidden fixed bottom-6 left-1/2 z-50 w-max"
        initial={{ x: "-50%", y: 0, opacity: 1 }}
        animate={{ x: "-50%", y: isHidden ? 150 : 0, opacity: isHidden ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <ul className="flex items-center gap-3 rounded-full px-5 py-3 backdrop-blur-md bg-card/90 shadow-xl border border-border/30">
          {links.map((link, idx) => (
            <li key={idx}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                onMouseEnter={() => setHoveredIndex(idx + 100)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(idx + 100)}
                onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 150)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ease-out active:scale-95"
                style={{
                  background: hoveredIndex === idx + 100 ? link.hoverBg : 'hsl(var(--muted))',
                  color: hoveredIndex === idx + 100 ? link.hoverColor : 'hsl(var(--foreground))',
                  transform: hoveredIndex === idx + 100 ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span className="sr-only">{link.label}</span>
                {link.icon}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>
    </>
  );
};

export default FixedSocialBar;
