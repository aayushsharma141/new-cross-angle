/**
 * CRM pipeline stage manifest.
 *
 * The single source of truth for "which stages exist?" and how they look.
 * Every CRM surface (board columns, list status badges, filter dropdowns,
 * sidebar shortcuts) reads stage labels and color tokens from this file.
 *
 * Field reference
 * - id              Persisted DB value (`leads.status`).
 * - label           Sentence-case label shown in the UI.
 * - shortLabel      Compact label used inside the kanban column header.
 * - dotClass        Tailwind class for a small accent dot.
 * - borderTopClass  Top border accent on kanban columns.
 * - badgeClass      Pill background + text + border for status badges.
 */

export interface CrmStage {
  id: string;
  label: string;
  shortLabel: string;
  dotClass: string;
  borderTopClass: string;
  badgeClass: string;
}

export const CRM_STAGES = [
  {
    id: "new",
    label: "New Inquiry",
    shortLabel: "New",
    dotClass: "bg-blue-500",
    borderTopClass: "border-t-[#3B82F6]",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "in_conversation",
    label: "In Conversation",
    shortLabel: "Conversation",
    dotClass: "bg-cyan-400",
    borderTopClass: "border-t-[#06B6D4]",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  {
    id: "meeting_planned",
    label: "Meeting Planned",
    shortLabel: "Meeting",
    dotClass: "bg-violet-400",
    borderTopClass: "border-t-[#8B5CF6]",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    id: "quote_sent",
    label: "Quote Sent",
    shortLabel: "Quote",
    dotClass: "bg-amber-400",
    borderTopClass: "border-t-[#F59E0B]",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    id: "closing",
    label: "Closing",
    shortLabel: "Closing",
    dotClass: "bg-[#F5B400]",
    borderTopClass: "border-t-[#F5B400]",
    badgeClass: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  {
    id: "won",
    label: "Won",
    shortLabel: "Won",
    dotClass: "bg-emerald-500",
    borderTopClass: "border-t-[#10B981]",
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    id: "lost",
    label: "Lost",
    shortLabel: "Lost",
    dotClass: "bg-gray-500",
    borderTopClass: "border-t-[#6B7280]",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
  },
] as const satisfies readonly CrmStage[];

export const CRM_STAGE_IDS = CRM_STAGES.map((stage) => stage.id) as [
  (typeof CRM_STAGES)[number]["id"],
  ...(typeof CRM_STAGES)[number]["id"][],
];

export type CrmStageId = (typeof CRM_STAGES)[number]["id"];

export const CRM_STAGE_LABELS: Record<CrmStageId, string> = CRM_STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage.label;
    return acc;
  },
  {} as Record<CrmStageId, string>,
);

export const CRM_STAGE_BADGE_CLASSES: Record<CrmStageId, string> = CRM_STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage.badgeClass;
    return acc;
  },
  {} as Record<CrmStageId, string>,
);

export function getCrmStageMeta(stageId: string) {
  return CRM_STAGES.find((stage) => stage.id === stageId);
}

export function isCrmStageId(value: string): value is CrmStageId {
  return CRM_STAGE_IDS.includes(value as CrmStageId);
}

// ─── Follow-Up SLA ──────────────────────────────────────────────────
/** Recommended maximum response time after entering each stage. */
export const FOLLOW_UP_SLA: Record<CrmStageId, { hours: number; label: string }> = {
  new:              { hours: 0.08,  label: "5 minutes" },
  in_conversation:  { hours: 24,    label: "24 hours" },
  meeting_planned:  { hours: 48,    label: "48 hours" },
  quote_sent:       { hours: 48,    label: "48 hours" },
  closing:          { hours: 72,    label: "3 days" },
  won:              { hours: 0,     label: "—" },
  lost:             { hours: 0,     label: "—" },
};

// ─── Stage Playbook ─────────────────────────────────────────────────
/** Contextual guidance shown inside the lead detail sheet and pipeline tooltips. */
export interface StagePlaybook {
  meaning: string;
  goal: string;
  commonMistake: string;
  exitCriteria: string;
}

export const STAGE_PLAYBOOK: Record<CrmStageId, StagePlaybook> = {
  new: {
    meaning: "Fresh lead just arrived from a source.",
    goal: "Make first contact and qualify basic interest.",
    commonMistake: "Waiting too long to respond — speed-to-lead matters most here.",
    exitCriteria: "Customer confirms interest and wants to continue the conversation.",
  },
  in_conversation: {
    meaning: "Initial contact established, actively discussing requirements.",
    goal: "Capture budget, city, timeline, and project type.",
    commonMistake: "Not asking about budget or decision-maker early enough.",
    exitCriteria: "Customer agrees to a meeting or site visit.",
  },
  meeting_planned: {
    meaning: "A meeting, call, or site visit has been scheduled.",
    goal: "Prepare the agenda, confirm attendance, gather project references.",
    commonMistake: "Not sending a meeting reminder 24 hours before.",
    exitCriteria: "Meeting is completed and you have enough data to send a quote.",
  },
  quote_sent: {
    meaning: "A formal proposal or quotation has been delivered.",
    goal: "Follow up on feedback and check decision timing.",
    commonMistake: "Waiting silently for a response instead of proactively following up.",
    exitCriteria: "Customer confirms interest in the quote or requests revisions.",
  },
  closing: {
    meaning: "Customer is ready to commit — final details being ironed out.",
    goal: "Resolve last blockers, confirm the final scope and payment terms.",
    commonMistake: "Not identifying who the final decision-maker is.",
    exitCriteria: "Customer signs or verbally confirms the project. Move to Won.",
  },
  won: {
    meaning: "Deal closed successfully!",
    goal: "Add a closing note and hand off to the delivery team.",
    commonMistake: "Forgetting to record what worked for future reference.",
    exitCriteria: "Closing note saved. Project handed off.",
  },
  lost: {
    meaning: "Deal did not materialize.",
    goal: "Record the loss reason for win/loss reporting.",
    commonMistake: "Marking lost without selecting a specific reason.",
    exitCriteria: "Loss reason selected and saved.",
  },
};

// ─── Sub-Statuses ───────────────────────────────────────────────────
export const STAGE_SUB_STATUSES: Record<CrmStageId, string[]> = {
  new:              ["Awaiting first contact", "Auto-reply sent"],
  in_conversation:  ["Actively chatting", "Waiting for customer reply"],
  meeting_planned:  ["Date confirmed", "Rescheduling"],
  quote_sent:       ["Under review", "Revisions requested"],
  closing:          ["Waiting for approval", "Financing pending", "Final negotiation"],
  won:              [],
  lost:             [],
};
