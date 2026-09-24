import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatStrip } from "@/components/editorial";

/** Studio metrics from the CMS, as the shared number strip. */
const TrustStrip = () => {
  const { data: processMetrics = [] } = useQuery({
    queryKey: ['processMetrics'],
    queryFn: api.getProcessMetrics
  });

  if (processMetrics.length === 0) return null;

  return (
    <StatStrip
      stats={processMetrics.map((metric) => ({
        label: metric.label,
        value: `${metric.value}${metric.suffix ?? ""}`,
      }))}
    />
  );
};

export default TrustStrip;
