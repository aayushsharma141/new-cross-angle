import useCountUp from "@/hooks/useCountUp";
import { useStudioStats } from "@/hooks/useSiteSettings";
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
  const studio = useStudioStats();
  const stats = [
    { value: studio.yearsExperience, suffix: "+", label: "Years of practice" },
    { value: studio.happyClients, suffix: "+", label: "Clients served" },
    { value: studio.projectsCompleted, suffix: "+", label: "Projects delivered" },
    { value: studio.awardsWon, suffix: "+", label: "Design awards" },
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
