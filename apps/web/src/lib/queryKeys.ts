export const queryKeys = {
  leads: {
    all: ["leads"] as const,
    detail: (id: string) => ["leads", id] as const,
    stats: ["leads", "stats"] as const,
  },
  media: {
    all: ["media"] as const,
    detail: (id: string) => ["media", id] as const,
  },
  blog: {
    all: ["blog"] as const,
    detail: (slug: string) => ["blog", slug] as const,
    overview: ["blog", "overview"] as const,
    performance: ["blog", "performance"] as const,
    engagement: ["blog", "engagement"] as const,
  },
  testimonials: {
    all: ["testimonials"] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (slug: string) => ["projects", slug] as const,
  },
  services: {
    all: ["services"] as const,
    detail: (id: string) => ["services", id] as const,
  },
  users: {
    all: ["users"] as const,
  },
} as const;
