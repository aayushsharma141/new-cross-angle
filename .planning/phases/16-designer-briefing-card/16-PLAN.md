# PLAN: Phase 16 - Designer Briefing Card

## Domain
**Context**: The CRM holds rich ALCS (AI Lead Conversion System) and Discovery data for leads. Currently, sales/design teams must parse JSON objects and mentally map signals to a sales strategy.
**Goal**: Auto-generate a "Designer Briefing Card"—a formatted, pre-call brief that converts raw JSON/evidence into actionable identity, lifestyle, spatial intent, sensory language, and conversation starters.
**Definition of Done**:
1. "Generate Brief" button appears in the CRM Lead Detail drawer for leads with `discovery_archetype`.
2. A dynamically generated Brief renders Identity, Lifestyle, Spatial Intent, Sensory Language, and Sales Strategy based on `alcs_evidence` and `discovery_signals`.
3. The Brief can be printed or copied to clipboard/downloaded.

---

## 1. Implement Designer Briefing Service
- **File**: `apps/web/src/addons/calculators/components/data/engines/brief-generator.ts` (new file)
- **Action**: Create a utility class/function `generateDesignerBrief(lead: Lead)` that processes the lead's `discovery_signals` and `alcs_evidence`.
- **Logic**:
  - Extract Identity: Map `discovery_archetype` and `alcs_confidence`.
  - Extract Lifestyle: Look for signals related to family, hosting, pets, WFH.
  - Extract Spatial Intent: Map `priorities.heroRooms` and their weights.
  - Extract Sensory Language: Map visual, texture, and light preferences.
  - Generate Sales Strategy: Rule-based mapping (e.g., if Budget < Benchmark AND Archetype == Luxury → "Focus on Phased Evolution or Hero Space execution. Validate budget realities gently while maintaining premium material conversations.")
- **Output**: Returns a structured object or Markdown string representing the Brief.

## 2. Update CRM Lead Detail Drawer UI
- **File**: `apps/web/src/pages/admin/AdminEstimateLeads.tsx`
- **Action**: Add a "Generate Brief" button (conditionally rendered if `discovery_archetype` exists).
- **Action**: Add a modal or an inline expanding section to display the generated Brief.
- **Action**: Implement "Copy to Clipboard" and "Print" buttons for the Brief.
- **Design**: The Brief should look like a premium, clean summary card. Use typography and spacing to separate Identity, Lifestyle, Spaces, and Strategy.

## 3. Verify Brief Content & Logic
- **File**: `apps/web/src/addons/calculators/components/data/engines/brief-generator.test.ts` (new file)
- **Action**: Write unit tests for `generateDesignerBrief` using a few mock leads (e.g., the same canonical personas used in ALCS Calibration).
- **Action**: Ensure the generated brief includes the correct strategic advice based on archetype and budget constraints.

## 4. Final Review
- **Action**: Run the app locally, open the CRM, select a lead with discovery data, generate the brief, and verify it looks professional and is actionable.

---

**Notes for Implementation:**
Since we are keeping things fast and deterministic, `generateDesignerBrief` will use rule-based synthesis rather than making an external LLM API call. We already have the intelligence encoded in `alcs_evidence`, we just need to format it into human-readable strategic prose.
