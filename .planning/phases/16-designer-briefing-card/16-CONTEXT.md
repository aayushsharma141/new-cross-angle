# Phase 16: Designer Briefing Card

## 1. Intent
With the completion of Phase 14 (Signal-Weighted ALCS) and Phase 15 (Recommendation Explainability), the CRM lead record now holds a deep well of psychological, sensory, and lifestyle data. However, data is only useful if it is actionable for the sales and design teams.

The goal of Phase 16 is to synthesize this rich data into a highly readable, actionable "Designer Briefing Card". A designer or salesperson should be able to generate and read this brief in 5 minutes before calling a lead. It translates raw Discovery and Estimator data into a strategic conversation plan.

## 2. Success Criteria
1. **Trigger**: Any lead with `discovery_archetype` populated shows a "Generate Brief" button in the CRM Lead Detail drawer (`AdminEstimateLeads.tsx`).
2. **Content Generation**: The brief dynamically synthesizes:
   - **Identity**: Name, Archetype, Confidence Score
   - **Lifestyle**: Family dynamics, Hosting preferences, WFH status
   - **Spatial Intent**: Hero rooms and their relative weights/priorities
   - **Sensory Language**: Lighting preferences, Textures, Luxury mode (restrained vs statement)
   - **Sales Strategy**: Suggested conversation starters and watch-for signals (e.g. "Lead has budget pressure but values premium materials—focus on phased hero spaces").
3. **Exportability**: The brief must be printable or downloadable as text from the admin panel for offline reference or attaching to calendar invites.

## 3. The Core Challenge
We need to generate a text/markdown synthesis dynamically based on the lead's JSON data. This requires a new utility service or prompt logic (if done via LLM) or rule-based generator (if done via code) that maps `discovery_signals` and `alcs_evidence` into a cohesive briefing document. Since we are building an intelligent system, a rule-based synthesis engine (`BriefingGenerator`) that constructs the brief from the lead's properties is preferred for determinism and speed.

## 4. Current State vs Target State
**Before Phase 16:**
The CRM displays raw tables and JSON data for Discovery signals and Estimator answers. A salesperson has to manually scroll, read, and mentally assemble the persona before a call.

**After Phase 16:**
The CRM provides a "Generate Brief" button. Clicking it instantly displays a clean, formatted Briefing Card that acts as a cheat sheet for the sales call.

## 5. Next Actions
- Create a `DesignerBriefService` or utility that takes a lead object and generates the briefing markdown/HTML.
- Update `AdminEstimateLeads.tsx` to include the "Generate Brief" button and a modal/panel to display the brief.
- Implement print/download functionality for the brief.
