import { useLocation } from "react-router-dom";

export type CTAContext = 'office' | 'residential' | 'turnkey' | 'generic';

export interface CTACopy {
  headlineStart: string;
  headlineHighlight: string;
  headlineFull: string;
  sub: string;
  btn1: string;
  btn1Link: string;
  btn2: string;
  btn2Link: string;
}

export function useDynamicCTA() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  let context: CTAContext = 'generic';
  
  if (path.includes('/commercial') || path.includes('/office')) {
    context = 'office';
  } else if (path.includes('/residential')) {
    context = 'residential';
  } else if (path.includes('/turnkey')) {
    context = 'turnkey';
  }

  const copy: Record<CTAContext, CTACopy> = {
    office: {
      headlineStart: "Plan your office like a system, ",
      headlineHighlight: "not decoration.",
      headlineFull: "Plan your office like a system, not decoration.",
      sub: "Get layout clarity, cost estimate, and execution timeline before you start.",
      btn1: "Get Office Plan",
      btn1Link: "/contact-us?context=office",
      btn2: "Discuss Your Project",
      btn2Link: "/contact-us",
    },
    residential: {
      headlineStart: "Don't guess what your home ",
      headlineHighlight: "will look like.",
      headlineFull: "Don't guess what your home will look like.",
      sub: "See photorealistic 3D renders before we break a single wall.",
      btn1: "See 3D Examples",
      btn1Link: "/gallery?category=residential",
      btn2: "Book Home Consultation",
      btn2Link: "/contact-us?context=residential",
    },
    turnkey: {
      headlineStart: "Skip the contractor ",
      headlineHighlight: "chaos.",
      headlineFull: "Skip the contractor chaos.",
      sub: "1 Contract. 1 Timeline. 100% Execution Warranty.",
      btn1: "See Turnkey Portfolio",
      btn1Link: "/gallery?category=turnkey",
      btn2: "Get Turnkey Estimate",
      btn2Link: "/estimate?context=turnkey",
    },
    generic: {
      headlineStart: "Stop collecting ",
      headlineHighlight: "Pinterest boards.",
      headlineFull: "Stop collecting Pinterest boards.",
      sub: "It's time to build it. Get a precise estimate and 3D preview.",
      btn1: "Calculate Cost",
      btn1Link: "/estimate",
      btn2: "Book Free Consultation",
      btn2Link: "/contact-us",
    },
  };

  return { context, cta: copy[context] };
}
