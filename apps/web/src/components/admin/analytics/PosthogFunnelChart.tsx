import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export function PosthogFunnelChart({ action, color, fromIso, toIso }: { action: string, color: string, fromIso?: string, toIso?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['posthog-funnel', action, fromIso, toIso],
    queryFn: async () => {
      const from = fromIso || subDays(new Date(), 30).toISOString();
      const to = toIso || new Date().toISOString();
      const res = await supabase.functions.invoke("posthog-query", {
        body: { action, from, to }
      });
      if (res.error) throw res.error;
      const labels: Record<string, string> = {
        quiz_started: 'Started', quiz_completed: 'Completed',
        calculator_started: 'Started', calculator_step_1: 'Step 1', calculator_step_2: 'Step 2', calculator_step_3: 'Step 3', calculator_step_4: 'Step 4', calculator_complete: 'Completed'
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (res.data || []).map((d: any) => ({
        step: labels[d.step] || d.step.replace('quiz_', '').replace('_', ' '),
        count: d.count
      }));
      if (action === 'funnel-estimator') {
        const order = ['Started', 'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Completed'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.sort((a: any, b: any) => {
          let iA = order.indexOf(a.step); let iB = order.indexOf(b.step);
          if (iA === -1) iA = 99; if (iB === -1) iB = 99;
          return iA - iB;
        });
      }
      return raw;
    }
  });

  if (isLoading) return <div className="h-full w-full flex items-center justify-center text-xs text-[hsl(var(--admin-text-muted))]">Loading...</div>;
  if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center text-xs text-[hsl(var(--admin-text-muted))]">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`color-${action}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color === 'emerald' ? '#10b981' : '#3b82f6'} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color === 'emerald' ? '#10b981' : '#3b82f6'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--admin-border))" opacity={0.3} />
        <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} dy={10} />
        <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 8, fontSize: 12 }} />
        <Area type="monotone" dataKey="count" stroke={color === 'emerald' ? '#10b981' : '#3b82f6'} strokeWidth={2} fillOpacity={1} fill={`url(#color-${action})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
