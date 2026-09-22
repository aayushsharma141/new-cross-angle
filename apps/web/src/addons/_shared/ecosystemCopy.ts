export const ECOSYSTEM_ROUTES = {
  discovery: "/aesthetic-discovery-engine",
  estimator: "/estimate",
  contact: "/contact-us",
  blueprint: "/system-blueprint",
} as const;

export const ECOSYSTEM_COPY = {
  discoveryRole: {
    label: "Discovery Engine",
    title: "Emotional Blueprint",
    description:
      "Decodes taste, habits, material instincts, light preferences, and personality signals before practical planning begins.",
  },
  estimatorRole: {
    label: "Estimator Tool",
    title: "Execution Estimate",
    description:
      "Translates the Discovery Blueprint into a practical scope, service level, investment range, and next-step plan.",
  },
  consultationRole: {
    label: "Design Consultation",
    title: "Human Review",
    description:
      "A designer reviews both the emotional blueprint and the estimate so the conversation starts with context.",
  },
  journeySteps: [
    {
      step: "01",
      title: "Discover Your Interior Identity",
      body:
        "Start with the Discovery Engine to understand the emotional and personality foundation behind your future home.",
    },
    {
      step: "02",
      title: "Estimate With Your Blueprint",
      body:
        "Use those insights to make the Estimator more personalized across scope, finish level, and design priorities.",
    },
    {
      step: "03",
      title: "Review A Connected Report",
      body:
        "Move into consultation with a single story: who you are, what your space needs, and what it may cost.",
    },
  ],
  ctas: {
    startDiscovery: "Create My Discovery Blueprint",
    refineDiscovery: "Refine My Discovery Blueprint",
    startEstimator: "Estimate Directly",
    startPersonalizedEstimator: "Get My Personalized Estimate",
    continueEstimator: "Continue To Estimator",
    consult: "Review With A Designer",
  },
  estimatorWithoutBlueprint:
    "You can estimate directly, but results become more useful when they are calibrated with your Discovery Blueprint.",
  estimatorWithBlueprint:
    "Your Discovery Blueprint is connected. The estimator can now carry your style profile into practical planning.",
} as const;

