import React from "react";
import { Instagram, Linkedin, Youtube, Facebook, Twitter } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const socialMeta: Record<string, { icon: React.ReactNode; name: string; hoverClass: string; iconHoverClass: string }> = {
  instagram: {
    name: "Instagram",
    hoverClass: "hover:border-[#E1306C]/40 hover:bg-[#E1306C]/[0.06] hover:text-[#E1306C]",
    iconHoverClass: "group-hover:text-[#E1306C]",
    icon: <Instagram size={18} strokeWidth={1.5} />,
  },
  pinterest: {
    name: "Pinterest",
    hoverClass: "hover:border-[#E60023]/40 hover:bg-[#E60023]/[0.06] hover:text-[#E60023]",
    iconHoverClass: "group-hover:text-[#E60023]",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.087-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.78.744 2.282a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.78 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.622.935.29 1.93.446 2.958.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
      </svg>
    ),
  },
  linkedin: {
    name: "LinkedIn",
    hoverClass: "hover:border-[#0077B5]/40 hover:bg-[#0077B5]/[0.06] hover:text-[#0077B5]",
    iconHoverClass: "group-hover:text-[#0077B5]",
    icon: <Linkedin size={18} strokeWidth={1.5} />,
  },
  youtube: {
    name: "YouTube",
    hoverClass: "hover:border-[#FF0000]/40 hover:bg-[#FF0000]/[0.06] hover:text-[#FF0000]",
    iconHoverClass: "group-hover:text-[#FF0000]",
    icon: <Youtube size={18} strokeWidth={1.5} />,
  },
  facebook: {
    name: "Facebook",
    hoverClass: "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/[0.06] hover:text-[#1877F2]",
    iconHoverClass: "group-hover:text-[#1877F2]",
    icon: <Facebook size={18} strokeWidth={1.5} />,
  },
  twitter: {
    name: "Twitter / X",
    hoverClass: "hover:border-white/40 hover:bg-white/[0.06] hover:text-white",
    iconHoverClass: "group-hover:text-white",
    icon: <Twitter size={18} strokeWidth={1.5} />,
  },
};

const SocialBar = () => {
  const { settings } = useSiteSettings();

  const socialLinks = Object.keys(socialMeta)
    .map((key) => {
      const meta = socialMeta[key];
      const url = settings?.social_links?.[key];
      const href = url && typeof url === "string" && url.trim().length > 0 ? url : "#";
      return { ...meta, key, href };
    })
    .filter((s) => s.href !== "#");

  if (socialLinks.length === 0) return null;

  return (
    <section className="relative z-10 px-4 pb-20 md:pb-28">
      <div className="container mx-auto max-w-5xl">
        {/* Thin separator line */}
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.05]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">Follow Our Work</span>
          <div className="h-px flex-1 bg-white/[0.05]" />
        </div>

        {/* Slim social pill strip */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.key}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit our ${social.name}`}
              className={`contact-social-link group flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 backdrop-blur-sm transition-all duration-300 ${social.hoverClass}`}
            >
              <span className={`text-white/30 transition-colors ${social.iconHoverClass}`}>
                {social.icon}
              </span>
              {social.name}
            </a>
          ))}
        </div>

        {/* Micro caption */}
        <p className="mt-6 text-center text-[10px] text-white/20 leading-relaxed">
          Daily site moments, moodboards, walkthroughs &amp; studio updates.
        </p>
      </div>
    </section>
  );
};

export default SocialBar;
