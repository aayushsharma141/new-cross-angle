# Blueprint Page Design & Layout History

This file tracks the design changes, layouts, and git checkpoints specifically for the **System Blueprint Page** (`apps/web/src/addons/discovery/pages/BlueprintPage.tsx`).

---

## 1. Visual History Log

| Iteration | Checkpoint Tag | Commit / Reference | Description & Key UI Elements | Screenshots / References |
| :--- | :--- | :--- | :--- | :--- |
| **#1** | `checkpoint/v1-archive` | `BlueprintPage.v1-archive.tsx` | **Tech Animation Catalog:** Focused on showing animation library references (GSAP, Framer Motion, Spline, Three.js), radar metrics for performance, layout previews of home components, and a CTA blob. | [Archived File](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/pages/BlueprintPage.v1-archive.tsx) |
| **#2** | `checkpoint/v2-bento-grid` | -- | **Bento Box Grid Layout:** Converted index items into a bento grid showcase highlighting state management latency stats, motion designs, and RLS security. User rejected this as "very low power" and not portraying the detailed scratch-to-live journey. | -- |
| **#3 (Active)** | `checkpoint/v3-interactive-timeline` | `HEAD` | **Dual-Layout Timeline Dashboard:** Interactive chronological system mapping covering DB schemas (with authorization role locks/unlocks), public staggering simulations (entrance step delays), decoupled admin CRM kanban board progression, and edge deployment Lighthouse console runner. | [View Layout Segment](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/pages/BlueprintPage.tsx#L377-L497) |

---

## 2. Key Code Diffs and Code Snippets

### A. Phase Stagger steps simulation (Active in v3)

```tsx
  // Handle stagger steps simulation
  useEffect(() => {
    if (staggerSimActive) {
      setStaggerStep(0);
      const t1 = setTimeout(() => setStaggerStep(1), 250);
      const t2 = setTimeout(() => setStaggerStep(2), 500);
      const t3 = setTimeout(() => setStaggerStep(3), 750);
      const t4 = setTimeout(() => setStaggerStep(4), 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      setStaggerStep(0);
    }
  }, [staggerSimActive]);
```

### B. Interactive Kanban CRM State Pipeline (Active in v3)

```tsx
<div className="grid grid-cols-4 gap-2">
  {['Inbox', 'Call', 'Proposal', 'Signed'].map((step, idx) => (
    <div key={step} className="flex flex-col gap-2">
      <span className="text-[9px] font-mono text-neutral-600 text-center uppercase tracking-wider">{step}</span>
      <div className="h-28 bg-neutral-900/50 rounded-lg border border-neutral-900 p-1 flex flex-col justify-start">
        {crmLeadStage === idx && (
          <div className="bg-[#C41230]/20 border border-[#C41230]/40 rounded p-1.5 text-[9px] font-mono text-white animate-bounce shadow-md">
            <div className="font-bold truncate">Aayush Sharma</div>
            <div className="text-[#C41230] font-bold mt-0.5 text-left">₹12.4L</div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
```
