# Designer Confidence Delta (DCD) v1.0

Measures the shift in a designer's confidence before and after interacting with the system's evidence and recommendations.

**Formula:**
`DCD = Confidence_after - Confidence_before`

**Validity Rules:**
*Valid only if:*
- `designer.confidence.pre` exists
- `designer.confidence.post` exists
- same session and same `commitmentId`
- elapsed time > 30 seconds
- `workspace.commitment.locked` occurred

*Invalid if:*
- duplicate submission
- abandoned workspace
- restored session
- imported proposal
