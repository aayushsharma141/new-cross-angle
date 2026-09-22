/**
 * StickyArticleBar.tsx — Fixed top bar with back link, title, and read time.
 * Slides in after user scrolls 350px. Renders via createPortal.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  title: string;
  read_time_minutes?: number;
}

interface Props {
  post: BlogPost;
  cleanTitle: (title: string) => string;
}

const StickyArticleBar = ({ post, cleanTitle }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 350);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return createPortal(
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: visible ? 0 : -48, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      className="fixed top-[3px] left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-12 border-b"
      style={{ background: "rgba(6,6,6,0.97)", borderColor: "#1c1c1c", backdropFilter: "blur(16px)" }}
    >
      <Link to="/blog" className="flex items-center gap-2 text-[12px] text-white/50 hover:text-white transition-colors font-sans">
        <ArrowLeft className="w-3.5 h-3.5" />
        Articles
      </Link>
      <span className="text-[12px] text-white/40 font-sans line-clamp-1 max-w-sm hidden md:block">
        {cleanTitle(post.title)}
      </span>
      <div className="flex items-center gap-3 text-[11px] text-white/30 font-sans">
        {post.read_time_minutes && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.read_time_minutes} min
          </span>
        )}
      </div>
    </motion.div>,
    document.body,
  );
};

export default StickyArticleBar;
