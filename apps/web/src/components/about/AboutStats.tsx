import useCountUp from "@/hooks/useCountUp";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { StatStrip } from "@/components/editorial";

const CountUp = ({ value, suffix, index }: { value: number; suffix: string; index: number }) => {
  const { count, ref } = useCountUp(value, { duration: 1800, delay: index * 120 });
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

/** Four studio numbers, CMS-driven via `settings.studio_stats`. */
const AboutStats = () => {
  const { settings } = useSiteSettings();
  const stats = [
    { value: settings?.studio_stats?.yearsExperience || 15, suffix: "+", label: "Years of practice" },
    { value: settings?.studio_stats?.happyClients || 500, suffix: "+", label: "Clients served" },
    { value: settings?.studio_stats?.projectsCompleted || 750, suffix: "+", label: "Projects delivered" },
    { value: settings?.studio_stats?.awardsWon || 25, suffix: "+", label: "Design awards" },
  ];

  return (
    <StatStrip
      stats={stats.map((s, i) => ({
        label: s.label,
        value: <CountUp value={s.value} suffix={s.suffix} index={i} />,
      }))}
    />
  );
};

export default AboutStats;
