# Crossangle Design Checklist

*This checklist must be completed before any implementation, component, or page change is merged. Every question requires a deliberate answer. A single "No" blocks the change.*

---

## Composition & Hierarchy

- [ ] Is there only **one focal point** in this view?
- [ ] Does the user's eye have a clear, directed path through the composition?
- [ ] Does photography remain dominant where present?
- [ ] Is the visual density appropriate for this room's position in the journey?

## System Integrity

- [ ] Is this change using **existing tokens only**? (No new hex codes, no arbitrary values)
- [ ] Does this introduce a new radius or spacing value outside the defined scale?
- [ ] Does this **strengthen the system** rather than create an exception to it?
- [ ] Could this element be expressed with a primitive component that already exists?

## Subtraction

- [ ] Could **anything be removed** from this change before it ships?
- [ ] Does this reduce visual noise, or does it add to it?
- [ ] Is every border present because it defines a material edge (not for decoration)?

## Motion & Behaviour

- [ ] Does motion in this change **reveal** rather than decorate?
- [ ] Is every animation physically grounded (no bouncing, no flashing, no floating)?
- [ ] Is performance invisible — does the interface avoid reminding the user that software exists?

## Trust & Craft

- [ ] Does this improve **clarity**, **rhythm**, **trust**, or **craftsmanship**?
- [ ] Would this still feel inevitable ten years from now?
- [ ] Is the interface **less noticeable** after this change than before it?

---

*If any answer is "No," the change does not ship.*
*If uncertain, apply Law 25: when in doubt, remove.*
