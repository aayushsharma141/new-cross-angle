import { useEffect, useRef } from "react";

if (typeof window !== "undefined") {
  if (!(window as any).__attentionSequence) {
    (window as any).__attentionSequence = 0;
  }
  if (!(window as any).__focalPointRecords) {
    (window as any).__focalPointRecords = {};
  }
  if ((window as any).__firstInteractionFocalPoint === undefined) {
    (window as any).__firstInteractionFocalPoint = null;
  }
}

interface AttentionEvent {
  room: string;
  focalPoint: string;
  firstVisibleAt: number;
  dwellMs: number;
  firstInteraction: boolean;
  intendedOrder: number;
  observedOrder: number;
  sequenceAccuracy: number;
}

export const useAttentionTelemetry = <T extends HTMLElement>(
  room: string,
  focalPoint: string,
  intendedOrder: number
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let enterTime = 0;
    let firstVisibleAt = 0;
    let observedOrder = 0;

    const handleInteraction = () => {
      if ((window as any).__firstInteractionFocalPoint === null) {
        (window as any).__firstInteractionFocalPoint = focalPoint;
      }
    };

    el.addEventListener("click", handleInteraction, { passive: true });
    el.addEventListener("mouseenter", handleInteraction, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const now = Date.now();
          enterTime = performance.now();
          
          if (!firstVisibleAt) {
            firstVisibleAt = now;
            const records = (window as any).__focalPointRecords;
            if (!records[focalPoint]) {
              (window as any).__attentionSequence++;
              observedOrder = (window as any).__attentionSequence;
              records[focalPoint] = { intendedOrder, observedOrder };
            } else {
              observedOrder = records[focalPoint].observedOrder;
            }
          }
        } else {
          if (enterTime > 0) {
            const dwellMs = performance.now() - enterTime;
            
            // Calculate Attention Sequence Accuracy
            const records = (window as any).__focalPointRecords;
            const allRecords = Object.values(records) as { intendedOrder: number; observedOrder: number }[];
            const correctCount = allRecords.filter(r => r.intendedOrder === r.observedOrder).length;
            const totalObserved = allRecords.length;
            const sequenceAccuracy = totalObserved > 0 ? (correctCount / totalObserved) : 0;

            const event: AttentionEvent = {
              room,
              focalPoint,
              firstVisibleAt,
              dwellMs: Math.round(dwellMs),
              firstInteraction: (window as any).__firstInteractionFocalPoint === focalPoint,
              intendedOrder,
              observedOrder,
              sequenceAccuracy
            };
            
            console.debug(`[Telemetry] Attention Purity Index Event: ${JSON.stringify(event)}`);
            
            const telemetryEvent = new CustomEvent("attention-telemetry", { detail: event });
            window.dispatchEvent(telemetryEvent);

            enterTime = 0;
          }
        }
      });
    }, { threshold: 0.8 }); // Require 80% visibility to count as true attention

    observer.observe(el);

    return () => {
      el.removeEventListener("click", handleInteraction);
      el.removeEventListener("mouseenter", handleInteraction);
      observer.disconnect();
    };
  }, [room, focalPoint, intendedOrder]);

  return ref;
};
