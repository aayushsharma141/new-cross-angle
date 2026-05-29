import { Monitor, Smartphone, Tablet } from "lucide-react";

export interface SessionRow {
  id: string;
  started_at: string;
  completed_at: string | null;
  mode: string;
  is_completed: boolean;
  last_stage: string | null;
  completion_time_seconds: number | null;
  user_agent: string | null;
  answers: Record<string, unknown>;
}

export interface EventRow {
  id: string;
  analytics_session_id: string | null;
  event_type: string;
  stage_name: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface LeadRow {
  id: string;
  session_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  city: string | null;
  lead_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export interface StageDropoff {
  stage: string;
  count: number;
  pct: number;
}

export interface ModeStats {
  mode: string;
  total: number;
  completed: number;
  rate: number;
  avgTime: number | null;
}

export interface DeviceStat {
  label: string;
  count: number;
  pct: number;
}

export const STAGE_ORDER = [
  "welcome", "reflection", "lifestyle", "visual_instinct",
  "adjective_selection", "emotional_mapping", "material_resonance",
  "light_calibration", "pattern_preview", "analysis", "results",
];

export const STAGE_LABELS: Record<string, string> = {
  welcome: "Welcome",
  reflection: "Reflection",
  lifestyle: "Lifestyle",
  visual_instinct: "Visual Instinct",
  adjective_selection: "Adjectives",
  emotional_mapping: "Emotional",
  material_resonance: "Material",
  light_calibration: "Light",
  pattern_preview: "Pattern",
  analysis: "Analysis",
  results: "Results",
};

export const DEVICE_ICONS: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

export const PIE_COLORS = [
  "hsl(var(--foreground) / 0.75)",
  "hsl(var(--foreground) / 0.55)",
  "hsl(var(--foreground) / 0.4)",
  "hsl(var(--foreground) / 0.28)",
  "hsl(var(--foreground) / 0.18)",
  "hsl(var(--foreground) / 0.1)",
];

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
  cursor: { fill: "hsl(var(--muted) / 0.5)" },
};

export const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: null },
] as const;

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s} s`;
}

export function parseUA(ua: string): { browser: string; os: string; device: "Desktop" | "Mobile" | "Tablet" } {
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";

  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (/iPad|Tablet/i.test(ua)) device = "Tablet";
  else if (/Mobile|iPhone|Android(?!.*Tablet)/i.test(ua)) device = "Mobile";

  return { browser, os, device };
}

export function computeModeStats(sessions: SessionRow[]): ModeStats[] {
  const byMode: Record<string, SessionRow[]> = {};
  for (const s of sessions) {
    (byMode[s.mode] ??= []).push(s);
  }
  return Object.entries(byMode).map(([mode, list]) => {
    const completed = list.filter((s) => s.is_completed);
    const times = completed.map((s) => s.completion_time_seconds).filter(Boolean) as number[];
    return {
      mode,
      total: list.length,
      completed: completed.length,
      rate: list.length > 0 ? (completed.length / list.length) * 100 : 0,
      avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null,
    };
  });
}

export function computeDropoffs(sessions: SessionRow[]): StageDropoff[] {
  const incomplete = sessions.filter((s) => !s.is_completed);
  const counts: Record<string, number> = {};
  for (const s of incomplete) {
    if (!s.last_stage) continue;
    counts[s.last_stage] = (counts[s.last_stage] ?? 0) + 1;
  }
  const total = incomplete.length || 1;
  return STAGE_ORDER
    .filter((stage) => counts[stage])
    .map((stage) => ({
      stage,
      count: counts[stage],
      pct: (counts[stage] / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeFunnel(sessions: SessionRow[]): { stage: string; count: number; pct: number }[] {
  const stageCounts: Record<string, number> = {};
  for (const s of sessions) {
    const lastIdx = STAGE_ORDER.indexOf(s.last_stage ?? "");
    for (let i = 0; i <= lastIdx; i++) {
      const stage = STAGE_ORDER[i];
      stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
    }
  }
  const total = sessions.length || 1;
  return STAGE_ORDER.map((stage) => ({
    stage,
    count: stageCounts[stage] ?? 0,
    pct: ((stageCounts[stage] ?? 0) / total) * 100,
  }));
}

export function computeBreakdown(sessions: SessionRow[], key: "browser" | "os" | "device"): DeviceStat[] {
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.user_agent) continue;
    const parsed = parseUA(s.user_agent);
    const val = parsed[key];
    counts[val] = (counts[val] ?? 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count, pct: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

export function scoreLeadIntent(lead: LeadRow): { label: string; cls: string } {
  let score = 0;
  const b = lead.budget_range || "";
  if (b.includes("50L+")) score += 3;
  else if (b.includes("15L")) score += 2;
  else if (b.includes("5L")) score += 1;

  const t = lead.timeline || "";
  if (t === "Immediately") score += 3;
  else if (t.startsWith("1–3")) score += 2;
  else if (t.startsWith("3–6")) score += 1;

  const p = lead.project_type || "";
  if (p === "New Home" || p === "Renovation") score += 2;
  else if (p === "Single Room" || p === "Office / Studio") score += 1;

  if (score >= 6) return { label: "High", cls: "bg-emerald-500/15 text-emerald-400" };
  if (score >= 3) return { label: "Medium", cls: "bg-amber-500/15 text-amber-400" };
  return { label: "Low", cls: "bg-muted text-muted-foreground" };
}

export function computeLeadBreakdown(leads: LeadRow[], key: keyof LeadRow): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const l of leads) {
    const val = (l[key] as string) || "Not specified";
    counts[val] = (counts[val] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
  `${name} (${(percent * 100).toFixed(0)}%)`;
