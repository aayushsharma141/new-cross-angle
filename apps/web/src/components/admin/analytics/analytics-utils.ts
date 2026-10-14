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

/**
 * Stage keys exactly as the quiz emits them: DiscoveryEngine sends `Stage[stage]`,
 * the TypeScript enum member name. This list previously held snake_case names
 * ("welcome", "reflection", "adjective_selection") from a retired version of the
 * quiz, so every lookup missed and the funnel could not resolve a single stage.
 * Keep in sync with the Stage enum in src/types/discovery.ts.
 */
export const STAGE_ORDER = [
  "Welcome", "PhysicalSpace", "Timeline", "MorningRoutine", "KitchenUsage",
  "EntertainmentStyle", "RoomPriority", "VisualInstinct", "ReinterpretationGate",
  "DesignIdentity", "Atmosphere", "Constraints", "MaterialIdentity",
  "LivingPreferences", "PivotQuestion", "BudgetAlignment", "Analysis",
  "MiniResult", "LeadCapture", "Results",
];

export const STAGE_LABELS: Record<string, string> = {
  Welcome: "Welcome",
  PhysicalSpace: "Physical Space",
  Timeline: "Timeline",
  MorningRoutine: "Morning Routine",
  KitchenUsage: "Kitchen Usage",
  EntertainmentStyle: "Entertaining",
  RoomPriority: "Room Priority",
  VisualInstinct: "Visual Instinct",
  ReinterpretationGate: "Reinterpretation",
  DesignIdentity: "Design Identity",
  Atmosphere: "Atmosphere",
  Constraints: "Constraints",
  MaterialIdentity: "Materials",
  LivingPreferences: "Living Preferences",
  PivotQuestion: "Pivot Question",
  BudgetAlignment: "Budget",
  Analysis: "Analysis",
  MiniResult: "First Result",
  LeadCapture: "Contact Details",
  Results: "Full Results",
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
  const incomplete = sessions.filter((s) => !s.is_completed && s.last_stage);
  const counts: Record<string, number> = {};
  for (const s of incomplete) {
    counts[s.last_stage as string] = (counts[s.last_stage as string] ?? 0) + 1;
  }
  const total = incomplete.length || 1;
  return STAGE_ORDER
    .filter((stage) => counts[stage])
    .map((stage) => ({ stage, count: counts[stage], pct: (counts[stage] / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

export interface FunnelStep {
  stage: string;
  /** Sessions that reached this stage or any later one. */
  count: number;
  /** Share of all sessions that got this far. */
  pct: number;
  /** Sessions lost between the previous stage and this one. */
  droppedFromPrev: number;
  /** Those losses as a share of the previous stage. */
  dropPctFromPrev: number;
}

/**
 * A session counts toward a stage when it reached that stage OR any later one,
 * which is what makes the curve monotonic and the step-to-step losses real.
 * Quick mode skips stages, so "furthest reached" is the only sound measure —
 * counting only stages explicitly viewed would read a skipped step as a drop.
 */
export function computeFunnel(sessions: SessionRow[]): FunnelStep[] {
  const reachedIdx = sessions.map((s) => STAGE_ORDER.indexOf(s.last_stage ?? ""));
  const total = sessions.length;

  let prevCount = 0;
  return STAGE_ORDER.map((stage, i) => {
    const count = reachedIdx.filter((idx) => idx >= i).length;
    const droppedFromPrev = i === 0 ? 0 : Math.max(0, prevCount - count);
    const dropPctFromPrev = i === 0 || prevCount === 0 ? 0 : (droppedFromPrev / prevCount) * 100;
    prevCount = count;
    return {
      stage,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
      droppedFromPrev,
      dropPctFromPrev,
    };
  });
}

/** Distribution of the style identities finished sessions landed on. */
export function computeArchetypeBreakdown(sessions: SessionRow[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    const archetype = typeof s.answers.archetype === "string" ? s.answers.archetype : null;
    if (!archetype) continue;
    counts[archetype] = (counts[archetype] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Quiz event types the admin analytics page reconstructs sessions from. */
export const QUIZ_EVENT_TYPES = [
  "quiz_started", "quiz_step_viewed", "quiz_step_completed", "quiz_completed",
  "result_loaded", "lead_gate_viewed", "lead_gate_submitted",
];

/**
 * Rebuilds one row per real quiz session from the raw analytics_events stream.
 *
 * Replaces the previous approach, which expanded daily `quiz_started` /
 * `quiz_completed` totals into placeholder sessions. Those carried no stage, no
 * user agent and no answers, so the funnel, drop-offs, device panels and service
 * split were all derived from values the loader had invented.
 */
export function buildSessionsFromEvents(events: EventRow[]): SessionRow[] {
  const grouped = new Map<string, EventRow[]>();
  for (const e of events) {
    if (!e.analytics_session_id) continue;
    const list = grouped.get(e.analytics_session_id);
    if (list) list.push(e);
    else grouped.set(e.analytics_session_id, [e]);
  }

  const sessions: SessionRow[] = [];
  for (const [id, list] of grouped) {
    const ordered = [...list].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const completedEvent = ordered.find((e) => e.event_type === "quiz_completed");
    const startedEvent = ordered.find((e) => e.event_type === "quiz_started");

    let furthestIdx = -1;
    for (const e of ordered) {
      const idx = STAGE_ORDER.indexOf(e.stage_name ?? "");
      if (idx > furthestIdx) furthestIdx = idx;
    }
    // A finished quiz has reached the end even if the last stage event was missed.
    if (completedEvent) furthestIdx = Math.max(furthestIdx, STAGE_ORDER.indexOf("Results"));

    const totalSeconds = completedEvent?.meta.totalSeconds;
    const archetype = completedEvent?.meta.archetype;

    sessions.push({
      id,
      started_at: startedEvent?.created_at ?? ordered[0].created_at,
      completed_at: completedEvent?.created_at ?? null,
      mode: typeof startedEvent?.meta.mode === "string" ? startedEvent.meta.mode : "unknown",
      is_completed: Boolean(completedEvent),
      last_stage: furthestIdx >= 0 ? STAGE_ORDER[furthestIdx] : null,
      completion_time_seconds: typeof totalSeconds === "number" ? totalSeconds : null,
      user_agent: typeof startedEvent?.meta.userAgent === "string" ? startedEvent.meta.userAgent : null,
      answers: {
        archetype: typeof archetype === "string" ? archetype : undefined,
        leadGateViewed: ordered.some((e) => e.event_type === "lead_gate_viewed"),
        leadGateSubmitted: ordered.some((e) => e.event_type === "lead_gate_submitted"),
      },
    });
  }

  return sessions.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
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
  const escape = (v: string) => {
    // Lead fields come from public forms; a leading = + - @ tab or CR makes
    // spreadsheets evaluate the cell as a formula (CSV injection).
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM so Excel reads UTF-8 instead of cp1252 (otherwise "₹" renders as "â‚¹").
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
  `${name} (${(percent * 100).toFixed(0)}%)`;
