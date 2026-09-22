/**
 * TableOfContents.tsx — Sticky left sidebar TOC with active heading highlight.
 * Hidden on mobile (xl breakpoint and above only).
 */

import { useEffect, useState } from "react";
import { List } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  items: TocItem[];
  activeId: string;
}

const TableOfContents = ({ items, activeId }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const hideThreshold = Math.max(docH - 1500, docH * 0.75);
      setVisible(scrollY > 700 && scrollY < hideThreshold);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={`w-full transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
    >
      <div className="py-2 pr-2">
        <div className="flex items-center gap-2 mb-5">
          <List className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">In This Article</span>
        </div>
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`block py-1 text-[12.5px] leading-snug transition-all duration-200 border-l-2 ${
                item.level === 3 ? "pl-5" : "pl-3.5"
              } ${
                activeId === item.id
                  ? "text-white/90 border-primary font-medium"
                  : "text-white/35 border-transparent hover:text-white/60 hover:border-white/10"
              }`}
            >
              {item.text}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TableOfContents;
