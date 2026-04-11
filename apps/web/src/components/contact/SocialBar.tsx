import React from "react";
import { Instagram, Linkedin, Youtube, Facebook, Twitter } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SpotlightCard from "@/components/ReactBits/SpotlightCard";

const socialDetails: Record<string, { icon: React.ReactNode, detail: string, name: string }> = {
  instagram: {
    name: "Instagram",
    icon: <Instagram size={24} />,
    detail: "Daily site moments and finished reveals",
  },
  pinterest: {
    name: "Pinterest",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="12" x2="12" y2="22" />
        <path d="M12 2C6.5 2 2 6.5 2 12c0 4.3 2.7 8 6.5 9.5" />
        <path d="M12 12c.5-1.5 1.5-2.5 2.5-2.5" />
        <path d="M14.5 9.5c1.5 0 2.5 1.5 2.5 3.5 0 2.5-2 4-4.5 4-2.5 0-3.5-1.5-3.5-3.5 0-3 3-5 5-5" />
      </svg>
    ),
    detail: "Moodboards, materials, and inspiration",
  },
  linkedin: {
    name: "LinkedIn",
    icon: <Linkedin size={24} />,
    detail: "Studio updates and professional milestones",
  },
  youtube: {
    name: "YouTube",
    icon: <Youtube size={24} />,
    detail: "Longer walkthroughs and transformation stories",
  },
  facebook: {
    name: "Facebook",
    icon: <Facebook size={24} />,
    detail: "Community updates and event news",
  },
  twitter: {
    name: "Twitter",
    icon: <Twitter size={24} />,
    detail: "Quick thoughts and industry insights",
  }
};

const SocialBar = () => {
  const { settings } = useSiteSettings();

  const socialLinks = Object.keys(socialDetails).map((key) => {
    const details = socialDetails[key];
    const url = settings?.social_links?.[key];
    const href = (url && typeof url === 'string' && url.trim().length > 0) ? url : "#";

    return {
      ...details,
      href,
    };
  });

  if (socialLinks.length === 0) return null;

  return (
    <section className="relative z-10 px-4 pb-20 md:pb-28">
      <div className="container mx-auto max-w-7xl">
        <div className="home-panel-muted rounded-[30px] px-6 py-10 text-center md:px-10 md:py-12">
          <div className="home-kicker mx-auto mb-4 justify-center">Stay Connected</div>
          <h2 className="font-serif text-3xl font-semibold text-[var(--site-text-heading)] md:text-4xl">
            Follow the work beyond the first conversation.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--site-text-muted)] md:text-base">
            If you are still exploring, these channels give you a closer look at
            our process, visual language, and finished spaces.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-center">
            {socialLinks.map((social) => (
              <SpotlightCard
                key={social.name}
                className="h-full rounded-2xl border border-white/10 bg-[#100D0A]/80 backdrop-blur-sm"
                spotlightColor="rgba(209, 175, 110, 0.25)"
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group contact-social-link block h-full p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  aria-label={`Visit our ${social.name}`}
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d1af6e]/30 bg-[#d1af6e]/10 text-[#d1af6e] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(209,175,110,0.4)] group-hover:-rotate-3 group-hover:border-[#d1af6e]/60 group-hover:bg-[#d1af6e]/20">
                    {social.icon}
                  </div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/90 transition-colors duration-300 group-hover:text-[#d1af6e]">
                    {social.name}
                  </span>
                  <p className="mx-auto max-w-[16rem] text-sm leading-6 text-white/60 transition-colors duration-300 group-hover:text-white/80">
                    {social.detail}
                  </p>
                </a>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialBar;
