# Milestone v3.0 Requirements

## Active Requirements

### Phase A: Asset Workspace
- [ ] **WS-01**: Implement `AssetWorkspace` full-page component to view a single asset's lifecycle.
- [ ] **WS-02**: Build Usage Panel displaying all bound entities for an asset.
- [ ] **WS-03**: Build Versions Panel displaying version history and support "Replace" operations without breaking references.
- [ ] **WS-04**: Add comprehensive Metadata & Actions (tagging, dimensions, photographer credits).

### Phase B: Universal Asset Picker
- [ ] **PICK-01**: Build `UniversalAssetPicker` prioritizing "Choose Existing" over "Upload New".
- [ ] **PICK-02**: Integrate the new picker into all contexts where media selection occurs.

### Phase C: Discovery Integration
- [ ] **DISC-01**: Refactor Discovery Engine Archetype UI to power visuals directly from the DAM `asset_usages`.
- [ ] **DISC-02**: Refactor Moodboards & Prompts to use managed assets instead of hardcoded paths.
- [ ] **DISC-03**: Remove all hardcoded archetype images from the codebase.

### Phase D: Collection Workspace
- [ ] **COLL-01**: Add Collection Workspace navigation (Assets, Collections, Domains, Archive).
- [ ] **COLL-02**: Build Collection Detail View showing aggregate counts, usage, and children assets grid.
- [ ] **COLL-03**: Implement bulk upload workflow that groups files into collections upon ingestion.

### Phase E: Archive & Governance
- [ ] **GOV-01**: Implement "Archive" soft deletion state for assets.
- [ ] **GOV-02**: Add usage protection to prevent archiving assets currently in use.
- [ ] **GOV-03**: Implement asset restoration flow (un-archive).

### Phase F: Search & Intelligence
- [ ] **INT-01**: Implement faceted search by Tag, Role, Collection, and Domain.
- [ ] **INT-02**: Build intelligence dashboards for Unused Assets, Duplicate Assets, Recent Uploads, Failed Uploads.

## Traceability
*To be filled by ROADMAP.md*
