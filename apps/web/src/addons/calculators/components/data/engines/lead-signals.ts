/**
 * lead-signals.ts — Projects a stored lead row into the shape the intelligence
 * engines read.
 *
 * The engines were written against a `discovery_signals` blob that no migration
 * ever created and nothing ever wrote, so every one of them hit its guard and
 * returned empty. The data they want does exist — migration
 * 20260625000000_discovery_intelligence_on_leads.sql flattened the
 * DiscoveryHandoff into individual columns, which submit-estimate populates:
 *
 *   discovery_lifestyle   { familyType, members, children, workFromHome,
 *                           hostingFreq, cookingRole, petsPresent }
 *   discovery_priorities  { mustHave[], niceToHave[], emotionalWeights{} }
 *   discovery_sensory     { lighting, colors[], textures[], luxuryResolvedAs }
 *
 * This adapter re-assembles those columns into DiscoverySignals so the engines
 * work against real leads without changing their logic.
 */

import type { DiscoverySignals, LeadIntelligenceInput } from "./types";

/** DiscoveryHandoff.lifestyle, as stored in leads.discovery_lifestyle. */
interface StoredLifestyle {
  familyType?: string;
  members?: number;
  children?: number;
  workFromHome?: boolean;
  hostingFreq?: string;
  cookingRole?: string;
  petsPresent?: boolean;
}

/** DiscoveryHandoff.priorities, as stored in leads.discovery_priorities. */
interface StoredPriorities {
  mustHave?: string[];
  niceToHave?: string[];
  emotionalWeights?: Record<string, number>;
}

/** DiscoveryHandoff.sensory, as stored in leads.discovery_sensory. */
interface StoredSensory {
  lighting?: string;
  colors?: string[];
  textures?: string[];
  luxuryResolvedAs?: string;
}

/**
 * The lead fields this adapter reads.
 *
 * `budget_value_inr` (migration 20260408000001) and `timeline`
 * (20260221120000) exist in the database but are missing from the generated
 * types, which were last produced before several migrations landed. Declared
 * here so the adapter stays type-safe; delete these two once
 * src/integrations/supabase/types_utf8.ts is regenerated.
 */
type LeadSignalSource = LeadIntelligenceInput & {
  budget_value_inr?: number | null;
  timeline?: string | null;
  start_timing?: string | null;
};

const asObject = <T,>(value: unknown): T | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;

/**
 * DiscoveryHandoff records lighting as warm | cool | natural | dramatic; the
 * engines phrase it as natural | ambient | statement. Only the correspondences
 * below are asserted — `cool` has no engine equivalent and is left unmapped so
 * the engines fall through to their neutral default rather than being told
 * something the quiz never said.
 */
const LIGHTING_MAP: Record<string, string> = {
  natural: "natural",
  warm: "ambient",
  dramatic: "statement",
};

/** Hosting is a frequency in the handoff and a boolean to the engines. */
const HOSTS_OFTEN = new Set(["often", "always"]);

/** Family-focused covers multi-person household types. */
const FAMILY_TYPES = new Set(["nuclear", "joint"]);

export function toDiscoverySignals(lead: LeadSignalSource): DiscoverySignals | null {
  // An explicit blob wins when present — it keeps direct-payload callers and
  // the engine unit tests working unchanged.
  if (lead.discovery_signals) return lead.discovery_signals;

  const lifestyle = asObject<StoredLifestyle>(lead.discovery_lifestyle);
  const priorities = asObject<StoredPriorities>(lead.discovery_priorities);
  const sensory = asObject<StoredSensory>(lead.discovery_sensory);

  // Nothing from the discovery quiz reached this lead.
  if (!lifestyle && !priorities && !sensory) return null;

  const hostingFreq = lifestyle?.hostingFreq?.toLowerCase() ?? "";
  const familyType = lifestyle?.familyType?.toLowerCase() ?? "";
  const rawLighting = sensory?.lighting?.toLowerCase() ?? "";

  return {
    budget: typeof lead.budget_value_inr === "number" ? lead.budget_value_inr : null,
    timeline: lead.timeline ?? lead.start_timing ?? null,
    decision_makers: typeof lifestyle?.members === "number" ? lifestyle.members : null,
    luxuryResolvedAs: sensory?.luxuryResolvedAs ?? null,
    lifestyle: lifestyle
      ? {
          wfh: lifestyle.workFromHome === true,
          hosting: HOSTS_OFTEN.has(hostingFreq),
          family: FAMILY_TYPES.has(familyType) || (lifestyle.children ?? 0) > 0,
          pets: lifestyle.petsPresent === true,
        }
      : null,
    priorities: priorities
      ? {
          heroRooms: priorities.mustHave ?? [],
          emotionalWeights: priorities.emotionalWeights ?? {},
        }
      : null,
    sensory: sensory
      ? {
          lighting: LIGHTING_MAP[rawLighting],
          // Stored as an array; the engines match a single descriptor.
          textures: sensory.textures?.[0],
        }
      : null,
  };
}
