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
  designProcess: {
    steps: ["designProcessSteps"] as const,
  },
  transformationStories: {
    active: ["transformation-stories"] as const,
  },
  siteMedia: {
    slot: (assetKey: string) => ["site-media-slot", assetKey] as const,
  },
  users: {
    all: ["users"] as const,
  },
  siteSettings: {
    // Public-safe column allow-list — used everywhere.
    public: ["siteSettings"] as const,
    // Full row — admin dashboard only.
    admin: ["siteSettings", "admin"] as const,
  },
  siteContent: {
    // Published blocks — read by the public site.
    published: ["siteContent", "published"] as const,
    // Drafts and version history — super admin editor only.
    drafts: ["siteContent", "drafts"] as const,
    versions: (key: string) => ["siteContent", "versions", key] as const,
  },
  integrations: {
    supabaseProbe: ["integrations", "supabaseProbe"] as const,
    email: ["integrations", "email"] as const,
    webhooks: ["integrations", "webhooks"] as const,
    analytics: ["integrations", "analytics"] as const,
    media: ["integrations", "media"] as const,
    lastSeen: ["integrations", "lastSeen"] as const,
    secrets: ["integrations", "secrets"] as const,
  },
} as const;
