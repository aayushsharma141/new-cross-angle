# Analytics Specification v1.0

*Rule: Metrics drive events. Events do not define metrics.*

This document catalogs the event namespaces and required metadata for Crossangle.

## Shared Metadata & Context Snapshots

Every event MUST contain the following baseline metadata.

**Versioning**
- `eventVersion` (e.g., 1)
- `schemaVersion` (e.g., "2026-07")
- `workspaceVersion`, `recommendationVersion`, `genomeVersion`, `buildVersion`

**Correlation IDs**
- `sessionId`, `designerId`, `leadId`, `recommendationId`, `commitmentId`, `proposalId`

**Context Snapshots**
- `activeRoom`
- `activeArchetype`
- `recommendationConfidence`
- `designerExperienceLevel`
- `leadComplexity`
- `projectBudgetTier`
- `projectCategory`

## Reason Codes

Every override must require an enum code:
- `client_preference`
- `designer_experience`
- `budget`
- `technical_constraint`
- `timeline`
- `missing_information`
- `other` (allows optional free text)

## Event Taxonomy (Namespaced)

### Workspace (User Actions)
- `workspace.opened`
- `workspace.first_interaction`
- `workspace.room.entered`
- `workspace.room.left`
- `workspace.commitment.started`
- `workspace.commitment.locked`
- `workspace.commitment.edited`
- `workspace.commitment.reopened`
- `workspace.commitment.created`
- `workspace.commitment.revised`
- `workspace.commitment.unlocked`
- `workspace.commitment.archived`

### Designer (User Actions)
- `designer.confidence.pre`
- `designer.confidence.post`

### Recommendation (User Actions)
- `recommendation.viewed`
- `recommendation.expanded`
- `recommendation.copied`
- `recommendation.edited`
- `recommendation.accepted`
- `recommendation.partially_accepted`
- `recommendation.dismissed`
- `recommendation.overridden`
- `recommendation.divergence_calculated`

### AI Explainability
- `explainability.explanation.opened`
- `explainability.evidence_card.clicked`
- `explainability.evidence.reopened`
- `explainability.genome_reasoning.viewed`
- `explainability.confidence_indicator.viewed`

### System (Automated Actions)
- `system.recommendation.generated`
- `system.genome.completed`
- `system.workspace.restored`

### Errors
- `system.error`
- `system.timeout`
- `system.retry`
- `system.recovery`
- `analytics.failed`

### CRM & Outcomes (Closing the loop)
- `crm.lead.opened`
- `crm.lead.archived`
- `crm.lead.converted`
- `outcome.client_accepted`
- `outcome.client_rejected`
- `outcome.project_completed`
- `outcome.budget_changed`
- `outcome.scope_changed`
- `outcome.designer_satisfaction`
- `outcome.client_satisfaction`
- `outcome.learning_locked`

### Session Lifecycle
- `analytics.session.started`
- `analytics.session.ended`

## Telemetry Guarantees, Privacy & Sampling

### Event Guarantees
- **Required**: E.g., `workspace.commitment.locked`. If missing, the telemetry pipeline is broken.
- **Optional**: Provided if contextual information exists.
- **Best Effort**: E.g., `recommendation.expanded`. Less critical if dropped.

### Privacy Classification
- **Public**: Broad system stats.
- **Internal**: `designerId`, `leadId`, context states.
- **Sensitive**: `budget`, overrides related to financial constraints.
- **PII**: `clientName`, email, contact info (must not be sent in raw form to analytics).

### Sampling Policy
- `workspace.*` -> 100%
- `recommendation.*` -> 100%
- `performance.*` -> 20%
- `debug.*` -> 5%
