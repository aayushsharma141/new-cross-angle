# Phase 5: Content Hierarchy & Process Page Alignment

## Goal
Align the process methodology presentations across the application, resolve component duplication on secondary pages, and secure schema injections.

## Execution Steps

### 1. Process Page Wording and Stage Alignment
- **Target Files**: `OurProcessPage.tsx`, `ServicesProcess.tsx`, `OurApproach.tsx`.
- **Action**: 
  - Standardise all process descriptions on the 5-Stage framework established in `Process.tsx` (Consult, Measure & Plan, Design, Execute, Handover).
  - Modify `ServicesProcess.tsx` to use the 5-Stage model rather than the 4-phase model. Adjust titles and descriptions to sync precisely with the database backend query and homepage widgets.
  - Frame `OurApproach.tsx` as a high-level philosophy block that introduces this unified 5-Stage methodology.

### 2. De-duplicate Services Page
- **Target Files**: `ServicesPage.tsx`.
- **Action**:
  - Remove the imports and usage of `<ServicesProcess />` and `<OurApproach />`.
  - Create a custom, high-end teaser banner or card block contextually pointing users to the dedicated `/our-process` page (e.g., *"Discover our contractually-guaranteed 5-Stage Turnkey Process →"*). This guides user traffic down the right journey path and resolves search engine index duplication.

### 3. Secure Schema Script Injections
- **Target Files**: `SchemaMarkup.tsx`, `Process.tsx`, `ServiceDetailPage.tsx`, and any other component injecting raw JSON-LD.
- **Action**:
  - Implement a helper to escape opening/closing script tags (e.g., replace `</script>` with `<\/script>` or unicode escapes) when serializing JSON-LD content via `dangerouslySetInnerHTML`.
  - Ensure that dynamic data (like faq answers) cannot prematurely escape the schema script tags.

## Verification
- **Process Page Validation**: Navigate to `/our-process` and verify it displays the updated 5-stage timeline matching the homepage definitions.
- **De-duplication Check**: Verify that `/services` no longer renders the full `ServicesProcess` timeline or `OurApproach` pillars, but instead renders a single high-conversion banner linking to `/our-process`.
- **DOM & Schema Verification**: Open Chrome DevTools (or run browser checks) to verify that schema script blocks escape character sets safely and do not throw console warnings.
