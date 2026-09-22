/**
 * Circular "seal" watermark for the hero: brand text set on a ring,
 * spinning slowly (paused under prefers-reduced-motion), with a small
 * gold dot at the centre. Purely decorative.
 */
export const HeroWatermark = ({ text = "CrossAngle Interior · Engineered Living · " }: { text?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 160 160"
    className="w-24 h-24 md:w-36 md:h-36 text-white/70 animate-[spin_38s_linear_infinite] motion-reduce:animate-none"
  >
    <defs>
      <path id="hero-seal-ring" d="M80,80 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" />
    </defs>
    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.75" />
    <circle cx="80" cy="80" r="3" fill="#C9A85C" />
    <text
      fill="currentColor"
      fontSize="10.5"
      fontWeight="700"
      letterSpacing="2.6"
      style={{ textTransform: "uppercase" }}
    >
      <textPath href="#hero-seal-ring" startOffset="0">
        {text}
        {text}
      </textPath>
    </text>
  </svg>
);

export default HeroWatermark;
