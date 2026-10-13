/**
 * Percentage change from `previous` to `current`, rounded to a whole number.
 *
 * Returns `null` when there is no previous value to compare against. Do not
 * substitute 100 for that case: "0 → 5" is not a doubling, it is "no baseline",
 * and showing +100% reads as a real trend.
 */
export function percentChange(current: number, previous: number): number | null {
  if (!previous || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** "+12% vs previous period", or an explicit no-baseline message. */
export function describeChange(pct: number | null, suffix = "vs previous period"): string {
  if (pct === null) return "No previous period to compare";
  return `${pct > 0 ? "+" : ""}${pct}% ${suffix}`;
}

export function trendDirection(pct: number | null): "up" | "down" | "neutral" {
  if (pct === null || pct === 0) return "neutral";
  return pct > 0 ? "up" : "down";
}
